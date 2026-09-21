<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDisbursementRequest;
use App\Models\Program;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CampaignerDisbursementController extends Controller
{
    public function index(Program $program)
    {
        if ($program->campaigner_type === 'internal') {
            abort(403, 'Unauthorized.');
        }

        $profileId = auth()->user()->campaignerProfile?->id;

        if (! $profileId || $program->campaigner_profile_id !== $profileId) {
            abort(403, 'Unauthorized.');
        }

        $disbursements = $program->disbursements()->latest()->paginate(10);

        return Inertia::render('Public/Akun/Disbursement/Index', [
            'program' => $program,
            'disbursements' => $disbursements,
        ]);
    }

    public function create(Program $program)
    {
        if ($program->campaigner_type === 'internal') {
            abort(403, 'Unauthorized.');
        }

        $profileId = auth()->user()->campaignerProfile?->id;

        if (! $profileId || $program->campaigner_profile_id !== $profileId) {
            abort(403, 'Unauthorized.');
        }

        $totalCollected = $program->donations()->where('status', 'paid')->sum('amount');
        $totalDisbursed = $program->disbursements()->whereIn('status', ['pending', 'approved', 'transferred'])->sum('requested_amount');
        $availableBalance = $totalCollected - $totalDisbursed;

        return Inertia::render('Public/Akun/Disbursement/Create', [
            'program' => $program->load('category'),
            'availableBalance' => $availableBalance,
            'bankDetails' => auth()->user()->campaignerProfile, // Provide the verified profile details
        ]);
    }

    public function store(StoreDisbursementRequest $request, Program $program)
    {
        $validated = $request->validated();

        $profile = auth()->user()->campaignerProfile;

        if (! $profile || ! $profile->bank_name || ! $profile->bank_account_number || ! $profile->bank_account_name) {
            return back()->with('error', 'Silakan lengkapi profil rekening bank Anda terlebih dahulu.');
        }

        $platformFeePercent = $program->category->platform_fee_percent ?? 0;

        DB::transaction(function () use ($program, $request, $profile, $platformFeePercent) {
            $lockedProgram = Program::whereKey($program->id)->lockForUpdate()->firstOrFail();
            $totalCollected = $lockedProgram->donations()->where('status', 'paid')->sum('amount');
            $totalDisbursed = $lockedProgram->disbursements()->whereIn('status', ['pending', 'approved', 'transferred'])->sum('requested_amount');
            $availableBalance = max(0, $totalCollected - $totalDisbursed);

            $requestedAmount = (float) $request->input('requested_amount');

            if ($requestedAmount > $availableBalance) {
                throw ValidationException::withMessages([
                    'requested_amount' => 'Nominal pencairan melebihi sisa saldo yang tersedia saat ini (Rp '.number_format($availableBalance, 0, ',', '.').').',
                ]);
            }

            $platformFeeAmount = $requestedAmount * ($platformFeePercent / 100);
            $nettAmount = $requestedAmount - $platformFeeAmount;

            $lockedProgram->disbursements()->create([
                'requested_amount' => $requestedAmount,
                'bank_name' => $profile->bank_name,
                'bank_account_number' => $profile->bank_account_number,
                'bank_account_name' => $profile->bank_account_name,
                'platform_fee_percent' => $platformFeePercent,
                'platform_fee_amount' => $platformFeeAmount,
                'nett_amount' => $nettAmount,
                'notes' => $request->input('notes'),
            ]);
        });

        return redirect()->route('akun.programs.disbursements.index', $program->id)->with('success', 'Pengajuan pencairan dana berhasil dibuat.');
    }
}
