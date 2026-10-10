<?php

namespace App\Actions\User;

use App\Models\Disbursement;
use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeleteUserAction
{
    /**
     * Delete and anonymize the user account.
     *
     * @throws ValidationException
     */
    public function execute(User $user, bool $isSelfService = true): void
    {
        if ($isSelfService) {
            $this->validateSelfServiceDeletion($user);
        }

        DB::transaction(function () use ($user): void {
            $anonymizedEmail = sprintf('deleted_%d_%d@anonymized.insani.id', $user->id, now()->timestamp);

            $user->forceFill([
                'email' => $anonymizedEmail,
                'phone' => null,
                'name' => 'Sahabat Insani (Akun Dihapus)',
                'is_active' => false,
                'must_change_password' => false,
                'remember_token' => null,
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ])->save();

            $user->delete();
        });
    }

    /**
     * Validate business constraints before self-service deletion.
     *
     * @throws ValidationException
     */
    protected function validateSelfServiceDeletion(User $user): void
    {
        if ($user->isStaff()) {
            throw ValidationException::withMessages([
                'password' => 'Akun pengelola internal tidak dapat dihapus secara mandiri. Silakan hubungi Administrator utama untuk pengalihan wewenang.',
            ]);
        }

        $campaignerProfileId = $user->campaignerProfile?->id;

        $hasActivePrograms = Program::query()
            ->where(function ($query) use ($user, $campaignerProfileId): void {
                $query->where('created_by', $user->id);

                if ($campaignerProfileId) {
                    $query->orWhere('campaigner_profile_id', $campaignerProfileId);
                }
            })
            ->whereIn('status', ['published', 'pending_verification'])
            ->exists();

        if ($hasActivePrograms) {
            throw ValidationException::withMessages([
                'password' => 'Anda masih memiliki program donasi aktif atau dalam proses verifikasi. Program harus diselesaikan atau ditutup terlebih dahulu sebelum akun dapat dihapus.',
            ]);
        }

        $hasPendingDisbursements = Disbursement::query()
            ->whereHas('program', function ($query) use ($user, $campaignerProfileId): void {
                $query->where('created_by', $user->id);

                if ($campaignerProfileId) {
                    $query->orWhere('campaigner_profile_id', $campaignerProfileId);
                }
            })
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($hasPendingDisbursements) {
            throw ValidationException::withMessages([
                'password' => 'Anda masih memiliki pengajuan pencairan dana yang sedang berjalan. Selesaikan proses pencairan sebelum menghapus akun.',
            ]);
        }
    }
}
