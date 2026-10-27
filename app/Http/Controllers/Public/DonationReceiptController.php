<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Donation;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

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

        $payment = $donation->payments()->whereIn('gateway_status', ['PAID', 'SETTLED'])->latest()->first()
            ?? $donation->payments()->latest()->first();

        $settings = AppSetting::pluck('value', 'key')->toArray();

        $verifyUrl = route('donation.status', ['donationCode' => $donation->donation_code]);
        $renderer = new ImageRenderer(
            new RendererStyle(150, 1),
            new SvgImageBackEnd
        );
        $writer = new Writer($renderer);
        $qrCodeDataUri = 'data:image/svg+xml;base64,'.base64_encode($writer->writeString($verifyUrl));

        return view('receipt', [
            'donation' => $donation,
            'payment' => $payment,
            'settings' => $settings,
            'qrCodeDataUri' => $qrCodeDataUri,
        ]);
    }
}
