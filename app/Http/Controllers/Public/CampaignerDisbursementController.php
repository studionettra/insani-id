<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDisbursementRequest;
use App\Models\Program;
use App\Models\User;
use App\Notifications\DisbursementRequestedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
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

        $availableBalance = $program->available_balance;

        // Check gating status
        $hasOngoing = $program->disbursements()
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        $canWithdraw = true;
        $gatingMessage = null;

        if ($hasOngoing) {
            $canWithdraw = false;
            $gatingMessage = 'Masih terdapat pengajuan pencairan dana yang sedang diproses. Mohon tunggu hingga pencairan selesai.';
        } else {
            $lastTransferred = $program->disbursements()
                ->where('status', 'transferred')
                ->latest('transferred_at')
                ->first();

            if ($lastTransferred) {
                $hasApprovedUpdate = $program->updates()
                    ->where(function ($q) use ($lastTransferred) {
                        $q->where('disbursement_id', $lastTransferred->id)
                            ->orWhere('created_at', '>=', $lastTransferred->transferred_at);
                    })
                    ->where('moderation_status', 'approved')
                    ->exists();

                if (! $hasApprovedUpdate) {
                    $canWithdraw = false;
                    $pendingOrRejectedUpdate = $program->updates()
                        ->where(function ($q) use ($lastTransferred) {
                            $q->where('disbursement_id', $lastTransferred->id)
                                ->orWhere('created_at', '>=', $lastTransferred->transferred_at);
                        })
                        ->latest()
                        ->first();

                    if ($pendingOrRejectedUpdate && $pendingOrRejectedUpdate->moderation_status === 'pending') {
                        $gatingMessage = 'Laporan penyaluran dana untuk pencairan sebelumnya masih dalam peninjauan oleh admin. Pengajuan baru dapat dilakukan setelah laporan disetujui.';
                    } elseif ($pendingOrRejectedUpdate && $pendingOrRejectedUpdate->moderation_status === 'rejected') {
                        $reason = $pendingOrRejectedUpdate->rejection_reason ? ": {$pendingOrRejectedUpdate->rejection_reason}" : '';
                        $gatingMessage = "Laporan penyaluran dana sebelumnya ditolak{$reason}. Mohon perbaiki dan unggah kembali laporan penyaluran Anda.";
                    } else {
                        $gatingMessage = 'Anda belum mengunggah Kabar Terbaru / Laporan Penyaluran untuk pencairan dana sebelumnya. Silakan unggah laporan terlebih dahulu.';
                    }
                }
            }
        }

        return Inertia::render('Public/Akun/Disbursement/Create', [
            'program' => $program->load('category'),
            'availableBalance' => $availableBalance,
            'canWithdraw' => $canWithdraw,
            'gatingMessage' => $gatingMessage,
            'bankDetails' => auth()->user()->campaignerProfile,
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
        $docPath = $request->hasFile('supporting_document')
            ? $request->file('supporting_document')->store('disbursements/documents', 'public')
            : null;

        $disbursement = DB::transaction(function () use ($program, $request, $profile, $platformFeePercent, $docPath) {
            $lockedProgram = Program::whereKey($program->id)->lockForUpdate()->firstOrFail();
            $availableBalance = $lockedProgram->available_balance;

            $requestedAmount = (float) $request->input('requested_amount');

            if ($requestedAmount > $availableBalance) {
                throw ValidationException::withMessages([
                    'requested_amount' => 'Nominal pencairan melebihi sisa saldo yang tersedia saat ini (Rp '.number_format($availableBalance, 0, ',', '.').').',
                ]);
            }

            $platformFeeAmount = $requestedAmount * ($platformFeePercent / 100);
            $bankFee = 2500.0;
            $nettAmount = max(0, $requestedAmount - $platformFeeAmount - $bankFee);

            return $lockedProgram->disbursements()->create([
                'requested_amount' => $requestedAmount,
                'bank_name' => $profile->bank_name,
                'bank_account_number' => $profile->bank_account_number,
                'bank_account_name' => $profile->bank_account_name,
                'platform_fee_percent' => $platformFeePercent,
                'platform_fee_amount' => $platformFeeAmount,
                'bank_fee' => $bankFee,
                'nett_amount' => $nettAmount,
                'notes' => $request->input('notes'),
                'distribution_plan' => $request->input('distribution_plan'),
                'beneficiary_target' => $request->input('beneficiary_target'),
                'location' => $request->input('location'),
                'estimated_distribution_date' => $request->input('estimated_distribution_date'),
                'supporting_document' => $docPath,
                'status' => 'pending',
            ]);
        });

        $recipients = rescue(fn () => User::permission('disbursement.approve')->get(), collect(), false);
        if ($recipients->isEmpty()) {
            $recipients = rescue(fn () => User::role('Administrator')->get(), collect(), false);
        }
        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new DisbursementRequestedNotification($disbursement));
        }

        return redirect()->route('akun.programs.disbursements.index', $program->id)->with('success', 'Pengajuan pencairan dana berhasil dibuat.');
    }

    public function receipt(Program $program, \App\Models\Disbursement $disbursement)
    {
        if ($program->campaigner_type === 'internal') {
            abort(403, 'Unauthorized.');
        }

        $profileId = auth()->user()->campaignerProfile?->id;

        if (! $profileId || $program->campaigner_profile_id !== $profileId || $disbursement->program_id !== $program->id) {
            abort(403, 'Unauthorized.');
        }

        $disbursement->load(['program.category', 'approvedBy']);

        return Inertia::render('Public/Akun/Disbursement/Receipt', [
            'program' => $program,
            'disbursement' => $disbursement,
        ]);
    }
}
