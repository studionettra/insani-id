<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Fundraiser;
use App\Models\Program;
use Illuminate\Http\Request;
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
                $query->where('is_published', true)->latest();
            },
            'comments' => function ($query) {
                $query->with('donation:id,amount')->where('is_hidden', false)->latest();
            },
        ])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

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
            ->where('status', 'transferred')
            ->select([
                'id',
                'receipt_number',
                'requested_amount',
                'platform_fee_amount',
                'bank_fee',
                'nett_amount',
                'distribution_plan',
                'beneficiary_target',
                'location',
                'transferred_at',
            ])
            ->latest('transferred_at')
            ->get();

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

        $transparency = [
            'total_collected' => $totalCollected,
            'total_gateway_fees' => $totalGatewayFees,
            'net_collected' => max(0, $totalCollected - $totalGatewayFees),
            'total_disbursed' => $totalTransferredGross,
            'total_platform_fees' => $totalPlatformFees,
            'total_transferred_nett' => $totalTransferredNett,
            'available_balance' => $availableBalance,
            'disbursements' => $transferredDisbursements,
        ];

        return Inertia::render('Public/Program/Show', [
            'program' => $program,
            'currentFundraiser' => $currentFundraiser,
            'topFundraisers' => $topFundraisers,
            'userFundraiser' => $userFundraiser,
            'transparency' => $transparency,
        ]);
    }
}
