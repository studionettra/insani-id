<?php

namespace App\Services;

use App\Models\BankAccount;
use App\Models\Donation;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Xendit\Configuration;
use Xendit\Invoice\CreateInvoiceRequest;
use Xendit\Invoice\InvoiceApi;
use Xendit\XenditSdkException;

class XenditPaymentService
{
    protected $apiInstance;

    public function __construct(?InvoiceApi $apiInstance = null)
    {
        $apiKey = config('services.xendit.api_key');
        if (! empty($apiKey)) {
            Configuration::setXenditKey($apiKey);
        }
        $this->apiInstance = $apiInstance ?? new InvoiceApi;
    }

    /**
     * Get all available payment channels along with their limits and metadata.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function getAvailableChannels(): array
    {
        return [
            // QRIS
            [
                'code' => 'QRIS',
                'name' => 'QRIS',
                'subtitle' => 'GoPay, OVO, DANA, ShopeePay, BCA, dll',
                'category' => 'qris',
                'method' => 'qris',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 10000000,
                'badge' => 'Paling Populer',
            ],
            // Virtual Account
            [
                'code' => 'BCA',
                'name' => 'BCA Virtual Account',
                'subtitle' => 'Verifikasi Otomatis',
                'category' => 'virtual_account',
                'method' => 'virtual_account',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 50000000,
            ],
            [
                'code' => 'MANDIRI',
                'name' => 'Mandiri Virtual Account',
                'subtitle' => 'Verifikasi Otomatis',
                'category' => 'virtual_account',
                'method' => 'virtual_account',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 50000000,
            ],
            [
                'code' => 'BRI',
                'name' => 'BRI Virtual Account',
                'subtitle' => 'Verifikasi Otomatis',
                'category' => 'virtual_account',
                'method' => 'virtual_account',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 50000000,
            ],
            [
                'code' => 'BNI',
                'name' => 'BNI Virtual Account',
                'subtitle' => 'Verifikasi Otomatis',
                'category' => 'virtual_account',
                'method' => 'virtual_account',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 50000000,
            ],
            [
                'code' => 'PERMATA',
                'name' => 'Permata Virtual Account',
                'subtitle' => 'Verifikasi Otomatis',
                'category' => 'virtual_account',
                'method' => 'virtual_account',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 50000000,
            ],
            [
                'code' => 'CIMB',
                'name' => 'CIMB Niaga Virtual Account',
                'subtitle' => 'Verifikasi Otomatis',
                'category' => 'virtual_account',
                'method' => 'virtual_account',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 50000000,
            ],
            // E-Wallets
            [
                'code' => 'SHOPEEPAY',
                'name' => 'ShopeePay',
                'subtitle' => 'Aplikasi Shopee / ShopeePay',
                'category' => 'ewallet',
                'method' => 'ewallet',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 10000000,
            ],
            [
                'code' => 'OVO',
                'name' => 'OVO',
                'subtitle' => 'Aplikasi OVO',
                'category' => 'ewallet',
                'method' => 'ewallet',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 10000000,
            ],
            [
                'code' => 'DANA',
                'name' => 'DANA',
                'subtitle' => 'Aplikasi DANA',
                'category' => 'ewallet',
                'method' => 'ewallet',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 10000000,
            ],
            [
                'code' => 'ASTRAPAY',
                'name' => 'AstraPay',
                'subtitle' => 'Aplikasi AstraPay',
                'category' => 'ewallet',
                'method' => 'ewallet',
                'channel' => 'online',
                'min_amount' => 10000,
                'max_amount' => 10000000,
            ],
            // Manual Transfer channels loaded dynamically
            ...((function () {
                try {
                    $accounts = BankAccount::where('is_active', true)->orderBy('sort_order')->get();
                    if ($accounts->isNotEmpty()) {
                        return $accounts->map(function ($acc) {
                            return [
                                'code' => $acc->bank_code ?: 'MANUAL_'.strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $acc->bank_name)),
                                'name' => $acc->bank_name,
                                'subtitle' => 'Konfirmasi WhatsApp',
                                'category' => 'manual',
                                'method' => 'bank_transfer_manual',
                                'channel' => 'offline',
                                'min_amount' => 10000,
                                'max_amount' => 500000000,
                                'account_number' => $acc->account_number,
                                'account_name' => $acc->account_name,
                            ];
                        })->all();
                    }
                } catch (\Throwable $e) {
                    // Fallback to defaults if table is not yet migrated
                }

                return [
                    [
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
                    ],
                    [
                        'code' => 'MANUAL_BRI',
                        'name' => 'Bank Rakyat Indonesia (BRI)',
                        'subtitle' => 'Konfirmasi WhatsApp',
                        'category' => 'manual',
                        'method' => 'bank_transfer_manual',
                        'channel' => 'offline',
                        'min_amount' => 10000,
                        'max_amount' => 500000000,
                        'account_number' => '0345 0100 1366 304',
                        'account_name' => 'A.n Insani Indonesia',
                    ],
                ];
            })()),
        ];
    }

    /**
     * Find channel definition by code.
     *
     * @return array<string, mixed>|null
     */
    public static function findChannel(string $code): ?array
    {
        foreach (self::getAvailableChannels() as $channel) {
            if (strtoupper($channel['code']) === strtoupper($code)) {
                return $channel;
            }
        }

        return null;
    }

    /**
     * Map Xendit payment method string to internal enum.
     */
    public static function mapPaymentMethod(?string $xenditMethod): string
    {
        if (empty($xenditMethod)) {
            return 'virtual_account';
        }

        return match (strtoupper($xenditMethod)) {
            'BANK_TRANSFER', 'VIRTUAL_ACCOUNT' => 'virtual_account',
            'EWALLET' => 'ewallet',
            'QR_CODE', 'QRIS' => 'qris',
            'CREDIT_CARD' => 'credit_card',
            default => 'virtual_account',
        };
    }

    /**
     * Create Xendit Invoice for a Donation
     *
     * @param  Donation  $donation
     * @return array<string, mixed>
     */
    public function createInvoice($donation, ?string $paymentChannel = null): array
    {
        $apiKey = config('services.xendit.api_key');
        if (empty($apiKey)) {
            Log::error('Xendit Invoice Creation Failed: XENDIT_API_KEY is not configured in .env');

            return [
                'status' => 'error',
                'message' => 'Layanan pembayaran online belum dikonfigurasi. Silakan gunakan metode transfer manual atau hubungi administrator.',
            ];
        }

        $programTitle = is_array($donation->program->title)
            ? ($donation->program->title[app()->getLocale()] ?? $donation->program->title['id'] ?? reset($donation->program->title))
            : $donation->program->title;

        $requestParams = [
            'external_id' => $donation->donation_code,
            'amount' => $donation->amount,
            'payer_email' => $donation->donor_email,
            'description' => 'Donasi untuk '.$programTitle,
            'success_redirect_url' => route('donation.status', ['donationCode' => $donation->donation_code]),
            'failure_redirect_url' => route('donation.status', ['donationCode' => $donation->donation_code]),
            'customer' => [
                'given_names' => $donation->donor_name,
                'email' => $donation->donor_email,
                'mobile_number' => $donation->donor_phone,
            ],
            'customer_notification_preference' => [
                'invoice_created' => ['whatsapp', 'email'],
                'invoice_reminder' => ['whatsapp', 'email'],
                'invoice_paid' => ['whatsapp', 'email'],
                'invoice_expired' => ['whatsapp', 'email'],
            ],
        ];

        // If a specific channel is selected, filter invoice methods to that channel
        if (! empty($paymentChannel) && ! in_array(strtoupper($paymentChannel), ['ALL', 'ONLINE'])) {
            $requestParams['payment_methods'] = [strtoupper($paymentChannel)];
        }

        $createInvoiceRequest = new CreateInvoiceRequest($requestParams);

        try {
            $result = $this->apiInstance->createInvoice($createInvoiceRequest);

            return [
                'status' => 'success',
                'invoice_url' => $result->getInvoiceUrl(),
                'external_id' => $result->getExternalId(),
            ];
        } catch (XenditSdkException $e) {
            Log::error('Xendit Invoice Creation Failed: '.$e->getMessage());
            Log::error('Xendit Full Error: '.json_encode($e->getFullError()));

            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        } catch (\Throwable $e) {
            Log::error('Xendit Generic Error: '.$e->getMessage());

            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Synchronize the latest invoice status from Xendit API.
     */
    public function syncInvoiceStatus(Payment $payment): bool
    {
        $apiKey = config('services.xendit.api_key');
        if (empty($apiKey) || $payment->gateway !== 'xendit' || empty($payment->gateway_reference_id)) {
            return false;
        }

        try {
            $invoices = $this->apiInstance->getInvoices(null, $payment->gateway_reference_id);
            if (empty($invoices)) {
                return false;
            }

            $invoice = $invoices[0];
            $status = strtoupper($invoice->getStatus());
            $isPaid = in_array($status, ['PAID', 'SETTLED']);

            $updateData = [
                'gateway_status' => $status,
                'raw_payload' => json_decode(json_encode($invoice), true),
            ];

            if ($isPaid) {
                $updateData['paid_amount'] = (float) $invoice->getAmount();
                $updateData['paid_at'] = $payment->paid_at ?? now();

                if ($invoice->getPaymentMethod()) {
                    $updateData['payment_method'] = self::mapPaymentMethod($invoice->getPaymentMethod());
                }

                if (! empty($invoice['payment_channel'])) {
                    $updateData['payment_channel'] = $invoice['payment_channel'];
                }

                if (! empty($invoice['payment_destination'])) {
                    $updateData['payment_destination'] = $invoice['payment_destination'];
                }
            }

            $payment->update($updateData);

            Log::info("Synced Xendit status for payment {$payment->id} ({$payment->gateway_reference_id}): {$status}");

            return true;
        } catch (\Throwable $e) {
            Log::warning("Failed to sync Xendit status for payment {$payment->id}: ".$e->getMessage());

            return false;
        }
    }
}
