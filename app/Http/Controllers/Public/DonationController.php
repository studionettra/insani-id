<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDonationRequest;
use App\Mail\DonationPendingNotification;
use App\Models\Donation;
use App\Models\Fundraiser;
use App\Models\Payment;
use App\Models\Program;
use App\Services\XenditPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class DonationController extends Controller
{
    protected $xendit;

    public function __construct(XenditPaymentService $xendit)
    {
        $this->xendit = $xendit;
    }

    public function create(Program $program)
    {
        // Must be a published program
        if ($program->status !== 'published') {
            abort(404);
        }

        return inertia('Public/Program/Donate', [
            'program' => $program->load('creator'),
            'onlinePaymentAvailable' => ! empty(config('services.xendit.api_key')),
            'paymentChannels' => XenditPaymentService::getAvailableChannels(),
        ]);
    }

    public function store(StoreDonationRequest $request, Program $program)
    {
        if ($program->status !== 'published') {
            abort(404);
        }

        $validated = $request->validated();

        $donationCode = 'DON-'.strtoupper(Str::random(10));

        $uniqueCode = null;
        $totalAmount = (float) $validated['amount'];

        if ($validated['channel'] === 'offline') {
            $existingCodes = Donation::where('program_id', $program->id)
                ->where('channel', 'offline')
                ->where('status', 'pending')
                ->whereDate('created_at', today())
                ->pluck('unique_code')
                ->filter()
                ->all();

            do {
                $uniqueCode = rand(101, 999);
            } while (in_array($uniqueCode, $existingCodes));

            $totalAmount += $uniqueCode;
        }

        $utmSource = $validated['utm_source'] ?? session('utm_source') ?? $request->cookie('utm_source');
        $utmMedium = $validated['utm_medium'] ?? session('utm_medium') ?? $request->cookie('utm_medium');
        $utmCampaign = $validated['utm_campaign'] ?? session('utm_campaign') ?? $request->cookie('utm_campaign');
        $utmTerm = $validated['utm_term'] ?? session('utm_term') ?? $request->cookie('utm_term');
        $utmContent = $validated['utm_content'] ?? session('utm_content') ?? $request->cookie('utm_content');
        $referrerUrl = $validated['referrer_url'] ?? session('referrer_url') ?? $request->header('referer');
        $landingPage = session('landing_page');

        $refCode = $validated['referral_code'] ?? $validated['ref'] ?? $request->input('ref') ?? session('referral_code') ?? $request->cookie('referral_code');
        $fundraiser = null;
        if ($refCode) {
            $fundraiser = Fundraiser::where('program_id', $program->id)
                ->where('referral_code', $refCode)
                ->where('is_active', true)
                ->first();
        }

        if ($fundraiser && empty($utmSource)) {
            $utmSource = 'fundraiser_'.$fundraiser->referral_code;
        }

        $donation = Donation::create([
            'donation_code' => $donationCode,
            'program_id' => $program->id,
            'donor_user_id' => auth()->id(),
            'fundraiser_id' => $fundraiser?->id,
            'fundraiser_user_id' => $fundraiser?->user_id,
            'donor_name' => $validated['donor_name'],
            'donor_email' => $validated['donor_email'],
            'donor_phone' => $validated['donor_phone'],
            'is_anonymous' => $validated['is_anonymous'] ?? false,
            'message' => $validated['message'] ?? null,
            'amount' => $totalAmount,
            'unique_code' => $uniqueCode,
            'channel' => $validated['channel'],
            'status' => 'pending',
            'utm_source' => $utmSource,
            'utm_medium' => $utmMedium,
            'utm_campaign' => $utmCampaign,
            'utm_term' => $utmTerm,
            'utm_content' => $utmContent,
            'referrer_url' => $referrerUrl,
            'landing_page' => $landingPage,
        ]);

        if ($donation->channel === 'online') {
            $selectedChannel = $validated['payment_channel'] ?? null;
            $invoice = $this->xendit->createInvoice($donation, $selectedChannel);

            if ($invoice['status'] === 'success') {
                Payment::create([
                    'donation_id' => $donation->id,
                    'payment_method' => $validated['payment_method'] ?? 'virtual_account',
                    'payment_channel' => $selectedChannel,
                    'checkout_url' => $invoice['invoice_url'] ?? null,
                    'gateway' => 'xendit',
                    'gateway_reference_id' => $invoice['external_id'],
                    'gateway_status' => 'PENDING',
                ]);

                // Kirim email tagihan pending
                Mail::to($donation->donor_email)->queue(new DonationPendingNotification($donation));

                return inertia()->location($invoice['invoice_url']);
            } else {
                // If failed, mark as failed
                $donation->update(['status' => 'failed']);

                return back()->with('error', 'Gagal membuat tagihan donasi: '.$invoice['message']);
            }
        } else {
            // Offline/Manual transfer
            $channelCode = $validated['payment_channel'] ?? 'MANUAL_BSI';
            $channelDef = XenditPaymentService::findChannel($channelCode);

            Payment::create([
                'donation_id' => $donation->id,
                'payment_method' => 'bank_transfer_manual',
                'payment_channel' => $channelCode,
                'payment_destination' => $channelDef['account_number'] ?? '713 219 5026',
                'gateway' => 'manual',
                'gateway_reference_id' => $donationCode,
                'gateway_status' => 'PENDING',
            ]);

            // Kirim email tagihan pending
            Mail::to($donation->donor_email)->queue(new DonationPendingNotification($donation));

            return redirect()->route('donation.status', ['donationCode' => $donationCode]);
        }
    }

    public function status($donationCode)
    {
        $donation = Donation::where('donation_code', $donationCode)->with(['program', 'payments'])->firstOrFail();

        // Real-time fallback sync: If donation is pending and online, check Xendit API
        if ($donation->status === 'pending' && $donation->channel === 'online') {
            $payment = $donation->payments()->where('gateway', 'xendit')->latest()->first();
            if ($payment) {
                $this->xendit->syncInvoiceStatus($payment);
                $donation->refresh();
                $donation->load(['program', 'payments']);
            }
        }

        return inertia('Public/Donation/Status', [
            'donation' => $donation,
        ]);
    }

    /**
     * Search and view donation history for guest donors.
     */
    public function lookup(Request $request)
    {
        $search = trim((string) $request->input('q', ''));
        $donations = null;

        if (! empty($search)) {
            // If query matches a donation code, check direct redirection
            if (str_starts_with(strtoupper($search), 'DON-')) {
                $exactDonation = Donation::where('donation_code', strtoupper($search))->first();
                if ($exactDonation) {
                    return redirect()->route('donation.status', ['donationCode' => $exactDonation->donation_code]);
                }
            }

            $donations = Donation::with(['program.category', 'payments'])
                ->where('donor_email', $search)
                ->orWhere('donation_code', $search)
                ->latest()
                ->paginate(10)
                ->withQueryString();
        }

        return inertia('Public/Donation/Lookup', [
            'search' => $search,
            'donations' => $donations,
        ]);
    }
}
