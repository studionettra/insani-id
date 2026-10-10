<?php

namespace App\Http\Requests;

use App\Models\Program;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAdminDisbursementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        $canCreate = $user->can('disbursement.create') || $user->hasAnyRole(['Administrator', 'Super Admin']);
        if (! $canCreate) {
            return false;
        }

        /** @var Program|null $program */
        $program = $this->route('program');

        return $program && $program->campaigner_type === 'internal';
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('requested_amount') && is_string($this->requested_amount)) {
            $this->merge([
                'requested_amount' => str_replace('.', '', $this->requested_amount),
            ]);
        }

        if ($this->has('is_direct_transferred')) {
            $this->merge([
                'is_direct_transferred' => filter_var($this->is_direct_transferred, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
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
        $availableBalance = $program ? (float) $program->available_balance : 0.0;

        return [
            'requested_amount' => ['required', 'numeric', 'min:10000', "max:{$availableBalance}"],
            'disbursement_type' => ['required', 'string', 'in:vendor,field_team,beneficiary_direct,other'],
            'bank_name' => ['required', 'string', 'max:100'],
            'bank_account_number' => ['required', 'string', 'max:50'],
            'bank_account_name' => ['required', 'string', 'max:150'],
            'distribution_plan' => ['required', 'string', 'max:1000'],
            'beneficiary_target' => ['required', 'string', 'max:150'],
            'location' => ['required', 'string', 'max:150'],
            'estimated_distribution_date' => ['required', 'date'],
            'supporting_document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:500'],
            'is_direct_transferred' => ['nullable', 'boolean'],
            'transfer_proof' => ['nullable', 'required_if:is_direct_transferred,true', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
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
            'requested_amount.required' => 'Nominal penyaluran dana wajib diisi.',
            'requested_amount.numeric' => 'Nominal penyaluran harus berupa angka.',
            'requested_amount.min' => 'Nominal penyaluran minimal Rp 10.000.',
            'requested_amount.max' => 'Nominal penyaluran melebihi sisa kas program yang tersedia saat ini.',
            'disbursement_type.required' => 'Tipe alokasi penyaluran wajib dipilih.',
            'disbursement_type.in' => 'Tipe alokasi penyaluran tidak valid.',
            'bank_name.required' => 'Nama bank atau metode transfer tujuan wajib diisi.',
            'bank_account_number.required' => 'Nomor rekening atau nomor tujuan wajib diisi.',
            'bank_account_name.required' => 'Nama pemilik rekening penerima wajib diisi.',
            'distribution_plan.required' => 'Rencana / rincian keperluan penyaluran wajib diisi.',
            'distribution_plan.max' => 'Rencana keperluan penyaluran maksimal 1000 karakter.',
            'beneficiary_target.required' => 'Target penerima manfaat wajib diisi.',
            'location.required' => 'Lokasi penyaluran wajib diisi.',
            'estimated_distribution_date.required' => 'Estimasi tanggal pelaksanaan penyaluran wajib diisi.',
            'estimated_distribution_date.date' => 'Format tanggal pelaksanaan tidak valid.',
            'supporting_document.mimes' => 'Berkas RAB/dokumen pendukung harus berupa file PDF, JPG, JPEG, atau PNG.',
            'supporting_document.max' => 'Ukuran berkas RAB/dokumen pendukung maksimal 5MB.',
            'transfer_proof.required_if' => 'Bukti transfer wajib dilampirkan jika penyaluran ditandai telah ditransfer.',
            'transfer_proof.mimes' => 'Bukti transfer harus berupa file PDF, JPG, JPEG, atau PNG.',
            'transfer_proof.max' => 'Ukuran berkas bukti transfer maksimal 5MB.',
        ];
    }
}
