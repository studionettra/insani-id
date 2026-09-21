<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Donation;

class DonationReceiptController extends Controller
{
    /**
     * Display a clean, printable official donation e-receipt.
     */
    public function show(string $donationCode)
    {
        $donation = Donation::with(['program', 'payments'])
            ->where('donation_code', strtoupper($donationCode))
            ->firstOrFail();

        // Only paid donations can have an official receipt
        if ($donation->status !== 'paid') {
            return redirect()->route('donation.status', ['donationCode' => $donation->donation_code])
                ->with('error', 'Kwitansi resmi hanya tersedia untuk donasi yang telah terkonfirmasi lunas.');
        }

        $payment = $donation->payments()->whereIn('gateway_status', ['PAID', 'SETTLED'])->latest()->first();

        $settings = AppSetting::whereIn('key', [
            'site_name',
            'contact_email',
            'contact_whatsapp',
            'contact_address',
        ])->pluck('value', 'key');

        return view('receipt', [
            'donation' => $donation,
            'payment' => $payment,
            'settings' => $settings,
        ]);
    }
}
