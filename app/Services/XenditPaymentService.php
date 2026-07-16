<?php

namespace App\Services;

use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Xendit\Invoice\CreateInvoiceRequest;

class XenditPaymentService
{
    protected $apiInstance;

    public function __construct()
    {
        Configuration::setXenditKey(config('services.xendit.api_key'));
        $this->apiInstance = new InvoiceApi();
    }

    /**
     * Create Xendit Invoice for a Donation
     *
     * @param \App\Models\Donation $donation
     * @return array
     */
    public function createInvoice($donation)
    {
        $createInvoiceRequest = new CreateInvoiceRequest([
            'external_id' => $donation->donation_code,
            'amount' => $donation->amount,
            'payer_email' => $donation->donor_email,
            'description' => "Donasi untuk " . (is_array($donation->program->title) ? $donation->program->title['id'] : $donation->program->title),
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
                'invoice_expired' => ['whatsapp', 'email']
            ]
        ]);

        try {
            $result = $this->apiInstance->createInvoice($createInvoiceRequest);
            return [
                'status' => 'success',
                'invoice_url' => $result->getInvoiceUrl(),
                'external_id' => $result->getExternalId(),
            ];
        } catch (\Xendit\XenditSdkException $e) {
            \Illuminate\Support\Facades\Log::error('Xendit Invoice Creation Failed: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error('Xendit Full Error: ' . $e->getFullError());
            
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Xendit Generic Error: ' . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}
