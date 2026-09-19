<?php

namespace App\Services;

use App\Models\Donation;
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
     * Create Xendit Invoice for a Donation
     *
     * @param  Donation  $donation
     * @return array
     */
    public function createInvoice($donation)
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

        $createInvoiceRequest = new CreateInvoiceRequest([
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
        ]);

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
}
