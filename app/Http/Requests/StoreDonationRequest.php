<?php

namespace App\Http\Requests;

use App\Models\AppSetting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDonationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $minAmount = (int) (AppSetting::where('key', 'min_donation_amount')->value('value') ?? 10000);

        return [
            'amount' => ['required', 'numeric', "min:{$minAmount}"],
            'donor_name' => ['required', 'string', 'max:255'],
            'donor_email' => ['required', 'email', 'max:255'],
            'donor_phone' => ['required', 'string', 'max:30'],
            'is_anonymous' => ['nullable', 'boolean'],
            'message' => ['nullable', 'string', 'max:1000'],
            'channel' => ['required', 'in:online,offline'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $minAmount = (int) (AppSetting::where('key', 'min_donation_amount')->value('value') ?? 10000);

        return [
            'amount.required' => 'Nominal donasi wajib diisi.',
            'amount.numeric' => 'Nominal donasi harus berupa angka.',
            'amount.min' => 'Nominal donasi minimal Rp '.number_format($minAmount, 0, ',', '.'),
            'donor_name.required' => 'Nama donatur wajib diisi.',
            'donor_email.required' => 'Alamat email wajib diisi.',
            'donor_email.email' => 'Format email tidak valid.',
            'donor_phone.required' => 'Nomor WhatsApp / telepon wajib diisi.',
            'channel.required' => 'Metode pembayaran wajib dipilih.',
            'channel.in' => 'Metode pembayaran tidak valid.',
        ];
    }
}
