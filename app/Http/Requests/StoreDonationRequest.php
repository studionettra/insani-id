<?php

namespace App\Http\Requests;

use App\Models\AppSetting;
use App\Rules\NoProfanityRule;
use App\Rules\NoUrlRule;
use App\Services\XenditPaymentService;
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
     * Prepare the data for validation (sanitasi HTML dan script).
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'donor_name' => is_string($this->donor_name) ? $this->sanitizeContent($this->donor_name) : $this->donor_name,
            'message' => is_string($this->message) ? $this->sanitizeContent($this->message) : $this->message,
        ]);
    }

    /**
     * Remove malicious scripts, styles, and html tags from input string.
     */
    protected function sanitizeContent(string $value): string
    {
        // Hapus blok <script>...</script> dan <style>...</style> beserta isinya
        $cleaned = preg_replace('/<(script|style)[^>]*?>.*?<\/\1>/si', '', $value);

        // Bersihkan seluruh sisa tag HTML
        $cleaned = strip_tags($cleaned);

        return trim($cleaned);
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
            'donor_name' => ['required', 'string', 'max:100', new NoUrlRule, new NoProfanityRule],
            'donor_email' => ['required', 'email', 'max:255'],
            'donor_phone' => ['required', 'string', 'max:30'],
            'is_anonymous' => ['nullable', 'boolean'],
            'message' => ['nullable', 'string', 'max:1000', new NoUrlRule, new NoProfanityRule],
            'website_url' => ['nullable', 'prohibited'],
            'channel' => ['required', 'in:online,offline'],
            'payment_method' => ['nullable', 'string', 'in:virtual_account,ewallet,qris,credit_card,bank_transfer_manual'],
            'payment_channel' => ['nullable', 'string', 'max:50'],
            'utm_source' => ['nullable', 'string', 'max:100'],
            'utm_medium' => ['nullable', 'string', 'max:100'],
            'utm_campaign' => ['nullable', 'string', 'max:150'],
            'utm_term' => ['nullable', 'string', 'max:100'],
            'utm_content' => ['nullable', 'string', 'max:150'],
            'referrer_url' => ['nullable', 'string', 'max:500'],
            'referral_code' => ['nullable', 'string', 'max:100'],
            'ref' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $channelCode = $this->input('payment_channel');
            $amount = (float) $this->input('amount');

            if (! empty($channelCode) && $amount > 0) {
                $channelDef = XenditPaymentService::findChannel($channelCode);
                if ($channelDef) {
                    if (isset($channelDef['min_amount']) && $amount < $channelDef['min_amount']) {
                        $validator->errors()->add('amount', "Nominal donasi untuk metode {$channelDef['name']} minimal Rp ".number_format($channelDef['min_amount'], 0, ',', '.').'.');
                    }
                    if (isset($channelDef['max_amount']) && $amount > $channelDef['max_amount']) {
                        $validator->errors()->add('amount', "Nominal donasi untuk metode {$channelDef['name']} maksimal Rp ".number_format($channelDef['max_amount'], 0, ',', '.').'.');
                    }
                }
            }
        });
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
            'payment_method.in' => 'Kategori pembayaran tidak valid.',
            'website_url.prohibited' => 'Terdeteksi aktivitas mencurigakan. Permintaan tidak dapat diproses.',
        ];
    }
}
