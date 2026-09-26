<?php

namespace App\Http\Requests;

use App\Models\Program;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDisbursementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var Program|null $program */
        $program = $this->route('program');

        if (! $program || $program->campaigner_type === 'internal') {
            return false;
        }

        $profileId = $this->user()?->campaignerProfile?->id;

        return $profileId && $program->campaigner_profile_id === $profileId;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Program|null $program */
        $program = $this->route('program');
        $availableBalance = $program ? $program->available_balance : 0;

        return [
            'requested_amount' => ['required', 'numeric', 'min:150000', "max:{$availableBalance}"],
            'distribution_plan' => ['required', 'string', 'max:1000'],
            'beneficiary_target' => ['required', 'string', 'max:150'],
            'location' => ['required', 'string', 'max:150'],
            'estimated_distribution_date' => ['required', 'date'],
            'supporting_document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'requested_amount.required' => 'Nominal pencairan wajib diisi.',
            'requested_amount.numeric' => 'Nominal pencairan harus berupa angka.',
            'requested_amount.min' => 'Nominal pencairan minimal Rp 150.000.',
            'requested_amount.max' => 'Nominal pencairan melebihi sisa saldo yang tersedia.',
            'distribution_plan.required' => 'Rencana penyaluran dana wajib diisi.',
            'distribution_plan.max' => 'Rencana penyaluran maksimal 1000 karakter.',
            'beneficiary_target.required' => 'Target penerima manfaat wajib diisi.',
            'location.required' => 'Lokasi penyaluran wajib diisi.',
            'estimated_distribution_date.required' => 'Estimasi tanggal penyaluran wajib diisi.',
            'estimated_distribution_date.date' => 'Format tanggal penyaluran tidak valid.',
            'supporting_document.file' => 'Berkas pendukung harus berupa file.',
            'supporting_document.mimes' => 'Berkas pendukung harus berformat PDF, JPG, JPEG, atau PNG.',
            'supporting_document.max' => 'Ukuran berkas pendukung maksimal 2MB.',
            'notes.max' => 'Catatan maksimal 500 karakter.',
        ];
    }

    /**
     * Configure the validator instance for gating checks.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            /** @var Program|null $program */
            $program = $this->route('program');
            if (! $program) {
                return;
            }

            // Check if there is an existing pending or approved disbursement
            $hasOngoing = $program->disbursements()
                ->whereIn('status', ['pending', 'approved'])
                ->exists();

            if ($hasOngoing) {
                $validator->errors()->add('gating', 'Masih terdapat pengajuan pencairan dana yang sedang diproses. Mohon tunggu hingga pencairan selesai.');

                return;
            }

            // Check if last transferred disbursement has approved update
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
                    $pendingOrRejectedUpdate = $program->updates()
                        ->where(function ($q) use ($lastTransferred) {
                            $q->where('disbursement_id', $lastTransferred->id)
                                ->orWhere('created_at', '>=', $lastTransferred->transferred_at);
                        })
                        ->latest()
                        ->first();

                    if ($pendingOrRejectedUpdate && $pendingOrRejectedUpdate->moderation_status === 'pending') {
                        $validator->errors()->add('gating', 'Laporan penyaluran dana untuk pencairan sebelumnya masih dalam peninjauan oleh admin. Pengajuan baru dapat dilakukan setelah laporan disetujui.');
                    } elseif ($pendingOrRejectedUpdate && $pendingOrRejectedUpdate->moderation_status === 'rejected') {
                        $reason = $pendingOrRejectedUpdate->rejection_reason ? ": {$pendingOrRejectedUpdate->rejection_reason}" : '';
                        $validator->errors()->add('gating', "Laporan penyaluran dana sebelumnya ditolak{$reason}. Mohon perbaiki dan unggah kembali laporan penyaluran Anda.");
                    } else {
                        $validator->errors()->add('gating', 'Anda belum mengunggah Kabar Terbaru / Laporan Penyaluran untuk pencairan dana sebelumnya. Silakan unggah laporan terlebih dahulu.');
                    }
                }
            }
        });
    }
}
