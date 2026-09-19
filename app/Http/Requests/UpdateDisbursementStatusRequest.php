<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDisbursementStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('disbursement.approve') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'in:approved,rejected,transferred'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:1000'],
            'transfer_proof' => ['required_if:status,transferred', 'nullable', 'image', 'max:2048'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Status pencairan wajib dipilih.',
            'status.in' => 'Status pencairan tidak valid.',
            'rejection_reason.required_if' => 'Alasan penolakan wajib diisi jika status ditolak.',
            'transfer_proof.required_if' => 'Bukti transfer wajib diunggah jika status telah ditransfer.',
            'transfer_proof.image' => 'Bukti transfer harus berupa gambar.',
            'transfer_proof.max' => 'Ukuran bukti transfer maksimal 2MB.',
        ];
    }
}
