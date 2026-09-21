<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Fundraiser;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class FundraiserController extends Controller
{
    /**
     * Register the authenticated user as a fundraiser for a program.
     */
    public function store(Request $request, Program $program)
    {
        $user = $request->user();

        if ($program->status !== 'published') {
            return back()->with('error', 'Program ini tidak sedang aktif menerima donasi.');
        }

        $validated = $request->validate([
            'target_amount' => ['nullable', 'numeric', 'min:10000', 'max:1000000000'],
            'personal_message' => ['nullable', 'string', 'max:500'],
        ]);

        $existing = Fundraiser::where('user_id', $user->id)
            ->where('program_id', $program->id)
            ->first();

        if ($existing) {
            return back()->with('info', 'Anda sudah terdaftar sebagai fundraiser untuk program ini.')
                ->with('fundraiser', $existing);
        }

        // Generate unique referral code
        $baseSlug = Str::slug($user->name);
        if (empty($baseSlug)) {
            $baseSlug = 'insani';
        }

        do {
            $referralCode = $baseSlug.'-'.Str::lower(Str::random(4));
        } while (Fundraiser::where('referral_code', $referralCode)->exists());

        $fundraiser = Fundraiser::create([
            'user_id' => $user->id,
            'program_id' => $program->id,
            'referral_code' => $referralCode,
            'target_amount' => $validated['target_amount'] ?? null,
            'personal_message' => $validated['personal_message'] ?? null,
            'collected_amount' => 0,
            'donors_count' => 0,
            'is_active' => true,
        ]);

        // Automatically assign 'Fundraiser' role if not yet assigned
        if (class_exists(Role::class)) {
            $fundraiserRole = Role::firstOrCreate(['name' => 'Fundraiser', 'guard_name' => 'web']);
            if (! $user->hasRole($fundraiserRole)) {
                $user->assignRole($fundraiserRole);
            }
        }

        return back()->with('success', 'Selamat! Anda resmi menjadi Fundraiser untuk program ini.')
            ->with('fundraiser', $fundraiser);
    }

    /**
     * Display list of programs the authenticated user is fundraising for.
     */
    public function myFundraisers(Request $request): Response
    {
        $user = $request->user();

        $fundraisers = Fundraiser::with(['program.category'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        $totalCollected = Fundraiser::where('user_id', $user->id)->sum('collected_amount');
        $totalDonors = Fundraiser::where('user_id', $user->id)->sum('donors_count');
        $activeCount = Fundraiser::where('user_id', $user->id)->where('is_active', true)->count();

        return Inertia::render('Public/Akun/Fundraiser/Index', [
            'fundraisers' => $fundraisers,
            'stats' => [
                'totalCollected' => (float) $totalCollected,
                'totalDonors' => (int) $totalDonors,
                'activeCount' => (int) $activeCount,
            ],
        ]);
    }
}
