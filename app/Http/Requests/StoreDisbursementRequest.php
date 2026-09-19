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

        $totalCollected = $program ? (float) $program->donations()->where('status', 'paid')->sum('amount') : 0;
        $totalDisbursed = $program ? (float) $program->disbursements()->whereIn('status', ['pending', 'approved', 'transferred'])->sum('requested_amount') : 0;
        $availableBalance = max(0, $totalCollected - $totalDisbursed);

        return [
            'requested_amount' => ['required', 'numeric', 'min:10000', "max:{$availableBalance}"],
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
            'requested_amount.min' => 'Nominal pencairan minimal Rp 10.000.',
            'requested_amount.max' => 'Nominal pencairan melebihi sisa saldo yang tersedia.',
            'notes.max' => 'Catatan maksimal 500 karakter.',
        ];
    }
}
