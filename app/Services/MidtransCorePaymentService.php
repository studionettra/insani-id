<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\BankAccount;
use App\Models\Donation;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransCorePaymentService
{
    protected string $serverKey;

    protected string $clientKey;

    protected string $merchantId;

    protected bool $isProduction;

    protected string $baseUrl;

    protected int $expiryQrisMinutes;

    protected int $expiryVaHours;

    public function __construct(
        ?string $serverKey = null,
        ?string $clientKey = null,
        ?string $merchantId = null,
        ?bool $isProduction = null
    ) {
        $this->serverKey = $serverKey ?? (string) config('services.midtrans.server_key', '');
        $this->clientKey = $clientKey ?? (string) config('services.midtrans.client_key', '');
        $this->merchantId = $merchantId ?? (string) config('services.midtrans.merchant_id', '');
        $this->isProduction = $isProduction ?? (bool) config('services.midtrans.is_production', false);

        $this->baseUrl = $this->isProduction
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';

        $this->expiryQrisMinutes = (int) config('services.midtrans.expiry_qris_minutes', 30);
        $this->expiryVaHours = (int) config('services.midtrans.expiry_va_hours', 24);
    }

    /**
     * Check if Midtrans credentials are configured.
     */
    public function isConfigured(): bool
    {
        return ! empty($this->serverKey);
    }

    /**
     * Get Base API URL.
     */
    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }

    /**
     * Get Client Key for frontend tokenization if needed.
     */
    public function getClientKey(): string
    {
        return $this->clientKey;
    }

    /**
     * Check if environment is production.
     */
    public function isProduction(): bool
    {
        return $this->isProduction;
    }

    /**
     * Test connection to Midtrans API.
     *
     * @return array<string, mixed>
     */
    public function testConnection(): array
    {
        if (! $this->isConfigured()) {
            return [
                'success' => false,
                'message' => 'Server Key Midtrans belum dikonfigurasi di .env atau pengaturan sistem.',
            ];
        }

        try {
            // Test query on a non-existent or test order to check authentication
            $response = Http::withBasicAuth($this->serverKey, '')
                ->acceptJson()
                ->get("{$this->baseUrl}/test-connection-auth-check/status");

            // 404 means auth succeeded (key is valid), order just not found. 401 means invalid key.
            if ($response->status() === 404 || $response->successful()) {
                return [
                    'success' => true,
                    'status_code' => $response->status(),
                    'environment' => $this->isProduction ? 'Production (Live)' : 'Sandbox (Uji Coba)',
                    'message' => 'Koneksi ke Midtrans API berhasil diverifikasi.',
                ];
            }

            if ($response->status() === 401) {
                return [
                    'success' => false,
                    'status_code' => 401,
                    'message' => 'Otentikasi gagal: Server Key Midtrans tidak valid.',
                ];
            }

            return [
                'success' => false,
                'status_code' => $response->status(),
                'message' => 'Respon Midtrans: '.($response->json('status_message') ?? $response->body()),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Gagal menghubungi server Midtrans: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Get all available channels based on admin settings.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function getAvailableChannels(): array
    {
        $channels = [];

        // 1. QRIS (Active by default in Midtrans)
        if (AppSetting::get('midtrans_channel_qris', '1') === '1') {
            $channels[] = [
                'code' => 'QRIS',
                'name' => 'QRIS',
                'subtitle' => 'GoPay, OVO, DANA, ShopeePay, BCA, dll',
                'category' => 'qris',
                'method' => 'qris',
                'channel' => 'online',
                'min_amount' => 1000,
                'max_amount' => 10000000,
                'badge' => 'Paling Populer',
            ];
        }

        // 2. Virtual Accounts (Enabled per bank via Admin Settings)
        $vaSettings = [
            'BSI' => ['name' => 'BSI Virtual Account', 'setting' => 'midtrans_channel_bsi_va', 'default' => '0'],
            'BRI' => ['name' => 'BRI Virtual Account', 'setting' => 'midtrans_channel_bri_va', 'default' => '0'],
            'BNI' => ['name' => 'BNI Virtual Account', 'setting' => 'midtrans_channel_bni_va', 'default' => '0'],
            'MANDIRI' => ['name' => 'Mandiri Virtual Account', 'setting' => 'midtrans_channel_mandiri_va', 'default' => '0'],
            'BCA' => ['name' => 'BCA Virtual Account', 'setting' => 'midtrans_channel_bca_va', 'default' => '0'],
            'PERMATA' => ['name' => 'Permata Virtual Account', 'setting' => 'midtrans_channel_permata_va', 'default' => '0'],
            'CIMB' => ['name' => 'CIMB Niaga Virtual Account', 'setting' => 'midtrans_channel_cimb_va', 'default' => '0'],
            'DANAMON' => ['name' => 'Danamon Virtual Account', 'setting' => 'midtrans_channel_danamon_va', 'default' => '0'],
        ];

        foreach ($vaSettings as $code => $cfg) {
            if (AppSetting::get($cfg['setting'], $cfg['default']) === '1') {
                $channels[] = [
                    'code' => $code,
                    'name' => $cfg['name'],
                    'subtitle' => 'Verifikasi Otomatis',
                    'category' => 'virtual_account',
                    'method' => 'virtual_account',
                    'channel' => 'online',
                    'min_amount' => 10000,
                    'max_amount' => 50000000,
                ];
            }
        }

        // 3. E-Wallets
        if (AppSetting::get('midtrans_channel_shopeepay', '1') === '1') {
            $channels[] = [
                'code' => 'SHOPEEPAY',
                'name' => 'ShopeePay',
                'subtitle' => 'Aplikasi Shopee / ShopeePay',
                'category' => 'ewallet',
                'method' => 'ewallet',
                'channel' => 'online',
                'min_amount' => 1000,
                'max_amount' => 10000000,
            ];
        }

        if (AppSetting::get('midtrans_channel_gopay', '1') === '1') {
            $channels[] = [
                'code' => 'GOPAY',
                'name' => 'GoPay',
                'subtitle' => 'Aplikasi Gojek / GoPay',
                'category' => 'ewallet',
                'method' => 'ewallet',
                'channel' => 'online',
                'min_amount' => 1000,
                'max_amount' => 10000000,
            ];
        }

        // Future Optional: Credit Card
        if (AppSetting::get('midtrans_channel_credit_card', '0') === '1') {
            $channels[] = [
                'code' => 'CREDIT_CARD',
                'name' => 'Kartu Kredit / Debit',
                'subtitle' => 'Visa, Mastercard, JCB, Amex',
                'category' => 'credit_card',
                'method' => 'credit_card',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 50000000,
            ];
        }

        // 4. Transfer Manual Yayasan (Sourced dynamically from bank_accounts table)
        try {
            $bankAccounts = BankAccount::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();

            if ($bankAccounts->isNotEmpty()) {
                foreach ($bankAccounts as $acc) {
                    $rawCode = trim((string) ($acc->bank_code ?? ''));
                    if (! empty($rawCode)) {
                        $code = str_starts_with(strtoupper($rawCode), 'MANUAL_')
                            ? strtoupper($rawCode)
                            : 'MANUAL_'.strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $rawCode));
                    } else {
                        $code = 'MANUAL_'.strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $acc->bank_name));
                    }

                    $channels[] = [
                        'id' => $acc->id,
                        'bank_account_id' => $acc->id,
                        'code' => $code,
                        'name' => $acc->bank_name,
                        'subtitle' => 'Konfirmasi WhatsApp',
                        'category' => 'manual',
                        'method' => 'bank_transfer_manual',
                        'channel' => 'offline',
                        'min_amount' => 10000,
                        'max_amount' => 500000000,
                        'account_number' => $acc->account_number,
                        'account_name' => $acc->account_name,
                        'instructions' => $acc->instructions,
                        'logo_url' => $acc->logo_url,
                        'bank_type' => $acc->bank_type,
                    ];
                }

                return $channels;
            }
        } catch (\Throwable $e) {
            // Fallback to static defaults if database table not available
        }

        // Fallback default if no bank accounts configured yet
        $channels[] = [
            'id' => 1,
            'code' => 'MANUAL_BSI',
            'name' => 'Bank Syariah Indonesia (BSI)',
            'subtitle' => 'Konfirmasi WhatsApp',
            'category' => 'manual',
            'method' => 'bank_transfer_manual',
            'channel' => 'offline',
            'min_amount' => 10000,
            'max_amount' => 500000000,
            'account_number' => '713 219 5026',
            'account_name' => 'A.n Insani Indonesia',
            'instructions' => null,
            'logo_url' => null,
            'bank_type' => 'syariah',
        ];

        return $channels;
    }

    /**
     * Find a channel by its code.
     *
     * @return array<string, mixed>|null
     */
    public static function findChannel(string $code, ?string $channelType = null): ?array
    {
        $codeUpper = strtoupper(trim($code));

        foreach (self::getAvailableChannels() as $channel) {
            if (strtoupper($channel['code']) === $codeUpper) {
                if ($channelType === null || $channel['channel'] === $channelType) {
                    return $channel;
                }
            }
        }

        // Master channel definitions for historical records or lookup
        $masterDefinitions = [
            'BSI' => ['name' => 'BSI Virtual Account', 'category' => 'virtual_account', 'method' => 'virtual_account', 'channel' => 'online', 'min_amount' => 10000, 'max_amount' => 50000000],
            'BRI' => ['name' => 'BRI Virtual Account', 'category' => 'virtual_account', 'method' => 'virtual_account', 'channel' => 'online', 'min_amount' => 10000, 'max_amount' => 50000000],
            'BNI' => ['name' => 'BNI Virtual Account', 'category' => 'virtual_account', 'method' => 'virtual_account', 'channel' => 'online', 'min_amount' => 10000, 'max_amount' => 50000000],
            'MANDIRI' => ['name' => 'Mandiri Virtual Account', 'category' => 'virtual_account', 'method' => 'virtual_account', 'channel' => 'online', 'min_amount' => 10000, 'max_amount' => 50000000],
            'BCA' => ['name' => 'BCA Virtual Account', 'category' => 'virtual_account', 'method' => 'virtual_account', 'channel' => 'online', 'min_amount' => 10000, 'max_amount' => 50000000],
            'PERMATA' => ['name' => 'Permata Virtual Account', 'category' => 'virtual_account', 'method' => 'virtual_account', 'channel' => 'online', 'min_amount' => 10000, 'max_amount' => 50000000],
            'CIMB' => ['name' => 'CIMB Niaga Virtual Account', 'category' => 'virtual_account', 'method' => 'virtual_account', 'channel' => 'online', 'min_amount' => 10000, 'max_amount' => 50000000],
            'DANAMON' => ['name' => 'Danamon Virtual Account', 'category' => 'virtual_account', 'method' => 'virtual_account', 'channel' => 'online', 'min_amount' => 10000, 'max_amount' => 50000000],
            'QRIS' => ['name' => 'QRIS', 'category' => 'qris', 'method' => 'qris', 'channel' => 'online', 'min_amount' => 1000, 'max_amount' => 10000000],
            'SHOPEEPAY' => ['name' => 'ShopeePay', 'category' => 'ewallet', 'method' => 'ewallet', 'channel' => 'online', 'min_amount' => 1000, 'max_amount' => 10000000],
            'GOPAY' => ['name' => 'GoPay', 'category' => 'ewallet', 'method' => 'ewallet', 'channel' => 'online', 'min_amount' => 1000, 'max_amount' => 10000000],
            'CREDIT_CARD' => ['name' => 'Kartu Kredit / Debit', 'category' => 'credit_card', 'method' => 'credit_card', 'channel' => 'online', 'min_amount' => 10000, 'max_amount' => 50000000],
        ];

        $normalizedCode = str_ends_with($codeUpper, '_VA') ? substr($codeUpper, 0, -3) : $codeUpper;
        if (isset($masterDefinitions[$normalizedCode])) {
            $def = $masterDefinitions[$normalizedCode];
            if ($channelType === null || $def['channel'] === $channelType) {
                return array_merge(['code' => $codeUpper, 'subtitle' => 'Verifikasi Otomatis'], $def);
            }
        }

        return null;
    }

    /**
     * Calculate Midtrans official gateway fee based on payment type and gross amount.
     * Includes VAT (PPN 11%) according to official Midtrans pricing regulations.
     */
    public static function calculateGatewayFee(string $paymentType, float $grossAmount): float
    {
        $type = strtolower(trim($paymentType));

        // 1. QRIS: 0.7% MDR all-in (BI standard)
        if ($type === 'qris') {
            return round($grossAmount * 0.007, 2);
        }

        // 2. E-Wallets (GoPay, ShopeePay): 2% + 11% PPN = 2.22%
        if (in_array($type, ['gopay', 'shopeepay'], true)) {
            return round($grossAmount * 0.02 * 1.11, 2);
        }

        // 3. Virtual Accounts (Bank Transfer, E-Channel Mandiri, CIMB VA, Permata, dll):
        // Flat Rp 4.000 + 11% PPN (Rp 440) = Rp 4.440
        if (in_array($type, ['bank_transfer', 'echannel', 'cimb_va', 'bca_va', 'bni_va', 'bri_va', 'permata_va'], true) || str_ends_with($type, '_va')) {
            return 4440.0;
        }

        // 4. Credit Card: 2.9% + (Rp 2.000 * 1.11 PPN)
        if ($type === 'credit_card') {
            return round(($grossAmount * 0.029) + (2000 * 1.11), 2);
        }

        return 0.0;
    }

    /**
     * Main charge dispatcher.
     *
     * @return array<string, mixed>
     */
    public function charge(Donation $donation, string $channelCode, ?string $paymentMethod = null): array
    {
        $code = strtoupper(trim($channelCode));

        if ($code === 'QRIS') {
            return $this->chargeQris($donation);
        }

        if (in_array($code, ['SHOPEEPAY', 'GOPAY'], true)) {
            return $this->chargeEwallet($donation, $code);
        }

        if (in_array($code, ['BSI', 'BRI', 'BNI', 'MANDIRI', 'BCA', 'PERMATA', 'CIMB', 'DANAMON'], true)) {
            return $this->chargeBankTransfer($donation, $code);
        }

        // Fallback default to QRIS if unknown online channel
        return $this->chargeQris($donation);
    }

    /**
     * Charge via GoPay Dynamic QRIS.
     *
     * @return array<string, mixed>
     */
    public function chargeQris(Donation $donation): array
    {
        $payload = [
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id' => $donation->donation_code,
                'gross_amount' => (int) round($donation->amount),
            ],
            'qris' => [
                'acquirer' => 'gopay',
            ],
            'customer_details' => [
                'first_name' => $donation->is_anonymous ? 'Inisiator' : $donation->donor_name,
                'last_name' => $donation->is_anonymous ? 'Kebaikan' : '',
                'email' => $donation->donor_email,
                'phone' => $donation->donor_phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => 'PROGRAM-'.$donation->program_id,
                    'price' => (int) round($donation->amount),
                    'quantity' => 1,
                    'name' => mb_substr($donation->program?->title['id'] ?? $donation->program?->title ?? 'Donasi Insani', 0, 50),
                ],
            ],
            'custom_expiry' => [
                'order_time' => now()->format('Y-m-d H:i:s O'),
                'expiry_duration' => $this->expiryQrisMinutes,
                'unit' => 'minute',
            ],
        ];

        return $this->executeCharge($payload, 'qris', 'QRIS');
    }

    /**
     * Charge via E-Wallet (ShopeePay or GoPay).
     *
     * @return array<string, mixed>
     */
    public function chargeEwallet(Donation $donation, string $channel): array
    {
        $type = strtolower($channel) === 'shopeepay' ? 'shopeepay' : 'gopay';
        $callbackUrl = route('donation.status', ['donationCode' => $donation->donation_code]);

        $payload = [
            'payment_type' => $type,
            'transaction_details' => [
                'order_id' => $donation->donation_code,
                'gross_amount' => (int) round($donation->amount),
            ],
            'customer_details' => [
                'first_name' => $donation->is_anonymous ? 'Inisiator' : $donation->donor_name,
                'last_name' => $donation->is_anonymous ? 'Kebaikan' : '',
                'email' => $donation->donor_email,
                'phone' => $donation->donor_phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => 'PROGRAM-'.$donation->program_id,
                    'price' => (int) round($donation->amount),
                    'quantity' => 1,
                    'name' => mb_substr($donation->program?->title['id'] ?? $donation->program?->title ?? 'Donasi Insani', 0, 50),
                ],
            ],
            'custom_expiry' => [
                'order_time' => now()->format('Y-m-d H:i:s O'),
                'expiry_duration' => 15,
                'unit' => 'minute',
            ],
        ];

        if ($type === 'shopeepay') {
            $payload['shopeepay'] = [
                'callback_url' => $callbackUrl,
            ];
        } else {
            $payload['gopay'] = [
                'enable_callback' => true,
                'callback_url' => $callbackUrl,
            ];
        }

        return $this->executeCharge($payload, 'ewallet', strtoupper($channel));
    }

    /**
     * Charge via Bank Transfer Virtual Account.
     *
     * @return array<string, mixed>
     */
    public function chargeBankTransfer(Donation $donation, string $bankCode): array
    {
        $code = strtolower($bankCode);

        $payload = [
            'transaction_details' => [
                'order_id' => $donation->donation_code,
                'gross_amount' => (int) round($donation->amount),
            ],
            'customer_details' => [
                'first_name' => $donation->is_anonymous ? 'Inisiator' : $donation->donor_name,
                'last_name' => $donation->is_anonymous ? 'Kebaikan' : '',
                'email' => $donation->donor_email,
                'phone' => $donation->donor_phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => 'PROGRAM-'.$donation->program_id,
                    'price' => (int) round($donation->amount),
                    'quantity' => 1,
                    'name' => mb_substr($donation->program?->title['id'] ?? $donation->program?->title ?? 'Donasi Insani', 0, 50),
                ],
            ],
            'custom_expiry' => [
                'order_time' => now()->format('Y-m-d H:i:s O'),
                'expiry_duration' => $this->expiryVaHours,
                'unit' => 'hour',
            ],
        ];

        if ($code === 'mandiri') {
            $payload['payment_type'] = 'echannel';
            $payload['echannel'] = [
                'bill_info1' => 'Donasi Insani',
                'bill_info2' => $donation->donation_code,
            ];
        } elseif ($code === 'permata') {
            $payload['payment_type'] = 'bank_transfer';
            $payload['bank_transfer'] = [
                'bank' => 'permata',
            ];
        } else {
            $payload['payment_type'] = 'bank_transfer';
            $payload['bank_transfer'] = [
                'bank' => $code, // bsi, bri, bni, bca, danamon, cimb
            ];
        }

        return $this->executeCharge($payload, 'virtual_account', strtoupper($bankCode));
    }

    /**
     * Execute HTTP POST charge request to Midtrans API.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function executeCharge(array $payload, string $paymentMethod, string $paymentChannel): array
    {
        if (! $this->isConfigured()) {
            return [
                'status' => 'error',
                'message' => 'Kunci Server Midtrans belum dikonfigurasi.',
            ];
        }

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->acceptJson()
                ->post("{$this->baseUrl}/charge", $payload);

            $data = $response->json();
            $statusCode = (string) ($data['status_code'] ?? '');
            $isSuccessStatus = in_array($statusCode, ['200', '201', '202'], true);

            if (! $response->successful() || ! $isSuccessStatus) {
                Log::error('Midtrans charge failed', [
                    'status' => $response->status(),
                    'status_code' => $statusCode,
                    'payload' => $payload,
                    'response' => $data,
                ]);

                $errorMessage = $data['status_message'] ?? 'Gagal membuat tagihan di Midtrans.';
                if ($statusCode === '402') {
                    $errorMessage = "Saluran pembayaran {$paymentChannel} belum aktif di sistem perbankan Midtrans. Silakan gunakan Virtual Account BCA, BNI, Mandiri, atau Transfer Manual.";
                }

                return [
                    'status' => 'error',
                    'message' => $errorMessage,
                    'raw_response' => $data,
                ];
            }

            // Parse response attributes
            $actions = $data['actions'] ?? [];
            $qrCodeUrl = null;
            $deeplinkUrl = null;

            foreach ($actions as $action) {
                if (($action['name'] ?? '') === 'generate-qr-code') {
                    $qrCodeUrl = $action['url'] ?? null;
                }
                if (($action['name'] ?? '') === 'deeplink-redirect') {
                    $deeplinkUrl = $action['url'] ?? null;
                }
            }

            // Extract VA Number
            $vaNumber = null;
            if (! empty($data['va_numbers'][0]['va_number'])) {
                $vaNumber = $data['va_numbers'][0]['va_number'];
            } elseif (! empty($data['permata_va_number'])) {
                $vaNumber = $data['permata_va_number'];
            } elseif (! empty($data['bill_key'])) {
                $vaNumber = $data['bill_key']; // Mandiri bill key
            }

            return [
                'status' => 'success',
                'transaction_id' => $data['transaction_id'] ?? null,
                'order_id' => $data['order_id'] ?? null,
                'gross_amount' => $data['gross_amount'] ?? null,
                'payment_method' => $paymentMethod,
                'payment_channel' => $paymentChannel,
                'payment_destination' => $vaNumber,
                'checkout_url' => $deeplinkUrl ?? $qrCodeUrl,
                'qr_code_url' => $qrCodeUrl,
                'qr_string' => $data['qr_string'] ?? null,
                'deeplink_url' => $deeplinkUrl,
                'va_number' => $vaNumber,
                'biller_code' => $data['biller_code'] ?? null,
                'bill_key' => $data['bill_key'] ?? null,
                'gateway_status' => strtoupper($data['transaction_status'] ?? 'PENDING'),
                'actions' => $actions,
                'raw_response' => $data,
            ];
        } catch (\Throwable $e) {
            Log::error('Midtrans charge exception', [
                'error' => $e->getMessage(),
                'payload' => $payload,
            ]);

            return [
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem saat menghubungi gateway pembayaran: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Check transaction status directly from Midtrans API.
     *
     * @return array<string, mixed>
     */
    public function checkTransactionStatus(string $orderId): array
    {
        if (! $this->isConfigured()) {
            return ['status' => 'error', 'message' => 'Midtrans not configured'];
        }

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->acceptJson()
                ->get("{$this->baseUrl}/{$orderId}/status");

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'data' => $response->json(),
                ];
            }

            return [
                'status' => 'error',
                'message' => $response->json('status_message') ?? 'Gagal memeriksa status.',
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify cryptographic signature from Midtrans webhook.
     */
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $receivedSignature): bool
    {
        $calculatedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$this->serverKey);

        return hash_equals($calculatedSignature, $receivedSignature);
    }

    /**
     * Sync and update payment & donation status from Midtrans API.
     */
    public function syncPaymentStatus(Payment $payment): bool
    {
        $orderId = $payment->gateway_reference_id ?? $payment->donation?->donation_code;

        if (! $orderId) {
            return false;
        }

        $res = $this->checkTransactionStatus($orderId);

        if ($res['status'] !== 'success' || empty($res['data'])) {
            return false;
        }

        $data = $res['data'];
        $transactionStatus = (string) ($data['transaction_status'] ?? '');
        $fraudStatus = (string) ($data['fraud_status'] ?? 'accept');
        $paymentType = (string) ($data['payment_type'] ?? '');
        $grossAmount = (float) ($data['gross_amount'] ?? $payment->donation?->amount ?? 0);

        // Map Midtrans transaction status to application gateway_status
        $currentStatus = strtoupper((string) $payment->gateway_status);
        $gatewayStatus = 'PENDING';
        $isPaid = false;

        if ($transactionStatus === 'settlement' || ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {
            $gatewayStatus = 'PAID';
            $isPaid = true;
        } elseif ($transactionStatus === 'expire') {
            $gatewayStatus = 'EXPIRED';
        } elseif (in_array($transactionStatus, ['cancel', 'deny'], true)) {
            $gatewayStatus = 'FAILED';
        }

        // Monotonic state protection: if payment is already PAID, ignore out-of-order downgrade syncs
        if ($currentStatus === 'PAID' && ! $isPaid) {
            $payment->update([
                'raw_payload' => array_merge($payment->raw_payload ?? [], ['last_sync_ignored' => $data]),
            ]);

            return true;
        }

        // Check nominal match for paid transactions
        if ($isPaid) {
            $expectedAmount = (float) ($payment->donation?->amount ?? 0);
            if (round($grossAmount, 2) !== round($expectedAmount, 2)) {
                $payment->update([
                    'gateway_status' => 'MISMATCH',
                    'raw_payload' => array_merge($payment->raw_payload ?? [], [
                        'mismatch_sync' => $data,
                        'mismatch_details' => [
                            'received' => $grossAmount,
                            'expected' => $expectedAmount,
                            'detected_at' => now()->toIso8601String(),
                        ],
                    ]),
                ]);

                return false;
            }
        }

        // Calculate Midtrans official gateway fee using centralized pricing logic
        $fee = $isPaid ? self::calculateGatewayFee($paymentType, $grossAmount) : 0.0;

        $updateData = [
            'gateway_status' => $gatewayStatus,
            'paid_amount' => $isPaid ? $grossAmount : null,
            'gateway_fee' => $fee,
            'paid_at' => $isPaid ? ($payment->paid_at ?? now()) : null,
            'raw_payload' => array_merge($payment->raw_payload ?? [], ['last_sync' => $data]),
        ];

        // Capture VA number if present in sync response
        if (! empty($data['va_numbers'][0]['va_number'])) {
            $updateData['payment_destination'] = $data['va_numbers'][0]['va_number'];
        } elseif (! empty($data['permata_va_number'])) {
            $updateData['payment_destination'] = $data['permata_va_number'];
        } elseif (! empty($data['bill_key'])) {
            $updateData['payment_destination'] = $data['bill_key'];
        }

        // Update payment (PaymentObserver will automatically handle donation status,
        // comments for Tab Donatur, program collected amount, fundraiser attribution, and receipt notification)
        $payment->update($updateData);

        return $isPaid;
    }

    /**
     * Cancel an active transaction in Midtrans API.
     *
     * @return array<string, mixed>
     */
    public function cancelTransaction(string $orderId): array
    {
        if (! $this->isConfigured()) {
            return [
                'success' => false,
                'message' => 'Kunci Server Midtrans belum dikonfigurasi.',
            ];
        }

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->acceptJson()
                ->post("{$this->baseUrl}/{$orderId}/cancel");

            $data = $response->json();
            $statusCode = (string) ($data['status_code'] ?? '');

            return [
                'success' => in_array($statusCode, ['200', '412', '404'], true),
                'status_code' => $statusCode,
                'message' => $data['status_message'] ?? 'Permintaan pembatalan diproses.',
                'raw_response' => $data,
            ];
        } catch (\Throwable $e) {
            Log::warning('Midtrans cancelTransaction exception', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
