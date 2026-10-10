<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Fundraiser;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProgramListingController extends Controller
{
    public function index(Request $request)
    {
        $categoryId = $request->query('category');
        $search = $request->query('search');
        $sort = $request->query('sort', 'terbaru');

        $query = Program::with('category')
            ->where('status', 'published');

        if ($sort === 'terlama') {
            $query->orderBy('published_at', 'asc');
        } elseif ($sort === 'terbanyak') {
            $query->orderBy('collected_amount', 'desc');
        } else {
            $query->orderBy('published_at', 'desc');
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        $programs = $query->paginate(12)->withQueryString();
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Public/Program/Listing', [
            'programs' => $programs,
            'categories' => $categories,
            'filters' => [
                'category' => $categoryId,
                'search' => $search,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(string $slug)
    {
        $program = Program::with([
            'category',
            'creator',
            'campaignerProfile',
            'updates' => function ($query) {
                $query->where('is_published', true)
                    ->where('moderation_status', 'approved')
                    ->with(['disbursement:id,receipt_number,requested_amount,nett_amount,bank_name,bank_account_number,bank_account_name,distribution_plan,transferred_at'])
                    ->latest();
            },
            'comments' => function ($query) {
                $query->with('donation:id,amount')->where('is_hidden', false)->latest();
            },
        ])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $program->updates->each(function ($update) {
            if ($update->disbursement) {
                $update->disbursement->bank_account_number = $update->disbursement->masked_account_number;
            }
        });

        $sessionKey = 'viewed_program_'.$program->id;
        if (! session()->has($sessionKey)) {
            $program->increment('views_count');
            session()->put($sessionKey, now()->timestamp);
        }

        $refCode = request()->query('ref') ?? session('referral_code') ?? request()->cookie('referral_code');
        $currentFundraiser = null;
        if ($refCode) {
            $currentFundraiser = Fundraiser::with('user:id,name')
                ->where('program_id', $program->id)
                ->where('referral_code', $refCode)
                ->where('is_active', true)
                ->first();
        }

        $topFundraisers = Fundraiser::with('user:id,name')
            ->where('program_id', $program->id)
            ->where('is_active', true)
            ->orderByDesc('collected_amount')
            ->take(10)
            ->get();

        $userFundraiser = auth()->check()
            ? Fundraiser::where('program_id', $program->id)->where('user_id', auth()->id())->first()
            : null;

        $transferredDisbursements = $program->disbursements()
            ->with(['programUpdate:id,disbursement_id,title,created_at'])
            ->where('status', 'transferred')
            ->select([
                'id',
                'receipt_number',
                'requested_amount',
                'platform_fee_amount',
                'bank_fee',
                'nett_amount',
                'bank_name',
                'bank_account_number',
                'bank_account_name',
                'distribution_plan',
                'beneficiary_target',
                'location',
                'transferred_at',
            ])
            ->latest('transferred_at')
            ->get();

        $startDate = $program->published_at ?? $program->created_at ?? now();
        $diffDays = max(1, (int) $startDate->diffInDays(now()));
        $diffMonths = (int) $startDate->diffInMonths(now());
        if ($diffMonths >= 1) {
            $remainingDays = (int) $startDate->copy()->addMonths($diffMonths)->diffInDays(now());
            $campaignDurationText = $remainingDays > 0
                ? "{$diffMonths} bulan, {$remainingDays} hari"
                : "{$diffMonths} bulan";
        } else {
            $campaignDurationText = "{$diffDays} hari";
        }

        $effectivePlatformFeePercent = $program->campaigner_type === 'internal'
            ? 0.0
            : (float) ($program->platform_fee_percent ?? 0.0);

        $transparency = Cache::remember("program_{$program->id}_transparency", app()->environment('testing') ? 0 : 60, function () use ($program, $transferredDisbursements, $campaignDurationText, $effectivePlatformFeePercent) {
            $totalCollected = (float) $program->donations()->where('status', 'paid')->sum('amount');
            $totalGatewayFees = (float) DB::table('donations')
                ->join('payments', 'donations.id', '=', 'payments.donation_id')
                ->where('donations.program_id', $program->id)
                ->where('donations.status', 'paid')
                ->sum('payments.gateway_fee');

            $totalTransferredGross = (float) $transferredDisbursements->sum('requested_amount');
            $totalPlatformFees = (float) $transferredDisbursements->sum('platform_fee_amount');
            $totalTransferredNett = (float) $transferredDisbursements->sum('nett_amount');
            $availableBalance = max(0, $totalCollected - $totalGatewayFees - $totalTransferredGross);

            // Dana alokasi untuk program (net of platform fee)
            $allocatedForProgram = max(0, $totalCollected - $totalPlatformFees);

            $mappedDisbursements = $transferredDisbursements->map(function ($d) {
                return [
                    'id' => $d->id,
                    'receipt_number' => $d->receipt_number,
                    'requested_amount' => (float) $d->requested_amount,
                    'platform_fee_amount' => (float) $d->platform_fee_amount,
                    'bank_fee' => (float) $d->bank_fee,
                    'nett_amount' => (float) $d->nett_amount,
                    'bank_name' => $d->bank_name,
                    'bank_account_number' => $d->masked_account_number,
                    'bank_account_number_masked' => $d->masked_account_number,
                    'bank_account_name' => $d->bank_account_name,
                    'distribution_plan' => $d->distribution_plan,
                    'beneficiary_target' => $d->beneficiary_target,
                    'location' => $d->location,
                    'transferred_at' => $d->transferred_at?->toISOString(),
                    'transferred_at_formatted' => $d->transferred_at ? $d->transferred_at->translatedFormat('d M Y') : null,
                    'transferred_at_human' => $d->transferred_at ? $d->transferred_at->diffForHumans() : null,
                    'program_update' => $d->programUpdate ? [
                        'id' => $d->programUpdate->id,
                        'title' => $d->programUpdate->title,
                    ] : null,
                ];
            })->all();

            return [
                'total_collected' => $totalCollected,
                'total_gateway_fees' => $totalGatewayFees,
                'net_collected' => max(0, $totalCollected - $totalGatewayFees),
                'allocated_for_program' => $allocatedForProgram,
                'total_disbursed' => $totalTransferredGross,
                'total_platform_fees' => $totalPlatformFees,
                'total_transferred_nett' => $totalTransferredNett,
                'available_balance' => $availableBalance,
                'campaign_duration' => $campaignDurationText,
                'last_updated_at' => now()->translatedFormat('d M Y - H:i').' WIB',
                'platform_fee_percent' => $effectivePlatformFeePercent,
                'disbursements' => $mappedDisbursements,
            ];
        });

        return Inertia::render('Public/Program/Show', [
            'program' => $program,
            'currentFundraiser' => $currentFundraiser,
            'topFundraisers' => $topFundraisers,
            'userFundraiser' => $userFundraiser,
            'transparency' => $transparency,
        ]);
    }
}
