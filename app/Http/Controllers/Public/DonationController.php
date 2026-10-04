<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDonationRequest;
use App\Mail\DonationPendingNotification;
use App\Models\AppSetting;
use App\Models\BankAccount;
use App\Models\Donation;
use App\Models\Fundraiser;
use App\Models\Payment;
use App\Models\Program;
use App\Services\MidtransCorePaymentService;
use App\Services\XenditPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class DonationController extends Controller
{
    public function __construct(
        protected MidtransCorePaymentService $midtrans,
        protected ?XenditPaymentService $xendit = null
    ) {}

    public function create(Request $request, Program $program)
    {
        // Must be a published program
        if ($program->status !== 'published') {
            abort(404);
        }

        $isOnlineAvailable = $this->midtrans->isConfigured() || ! empty(config('services.xendit.api_key'));
        $channels = MidtransCorePaymentService::getAvailableChannels();
        $vaNotice = AppSetting::get('midtrans_va_maintenance_notice', 'Layanan Virtual Account otomatis sedang dalam integrasi perbankan berkala. Anda dapat berdonasi secara instan menggunakan QRIS (mendukung semua M-Banking: BCA, Mandiri, BRI, BNI, BSI) atau melalui Transfer Manual BSI & BRI.');

        $replaceCode = $request->query('replace') ?? $request->query('replace_donation');
        $replaceDonation = null;
        if (! empty($replaceCode)) {
            $replaceDonation = Donation::where('donation_code', $replaceCode)
                ->where('program_id', $program->id)
                ->where('status', 'pending')
                ->first();
        }

        return inertia('Public/Program/Donate', [
            'program' => $program->load('creator'),
            'onlinePaymentAvailable' => $isOnlineAvailable,
            'paymentChannels' => $channels,
            'vaMaintenanceNotice' => $vaNotice,
            'replaceDonation' => $replaceDonation,
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

        // If replacing a previous pending donation, safely mark the old one as cancelled
        $replaceCode = $validated['replace_donation_code'] ?? $request->input('replace_donation_code');
        if (! empty($replaceCode)) {
            $oldDonation = Donation::where('donation_code', $replaceCode)
                ->where('program_id', $program->id)
                ->where('status', 'pending')
                ->first();

            if ($oldDonation) {
                if ($oldDonation->channel === 'online') {
                    $this->midtrans->cancelTransaction($oldDonation->donation_code);
                }

                $oldDonation->update(['status' => 'cancelled']);
                $oldDonation->payments()->where('gateway_status', 'PENDING')->update([
                    'gateway_status' => 'CANCELLED',
                ]);
            }
        }

        if ($donation->channel === 'online') {
            $selectedChannel = $validated['payment_channel'] ?? 'QRIS';
            $selectedMethod = $validated['payment_method'] ?? 'qris';

            if ($this->midtrans->isConfigured()) {
                $charge = $this->midtrans->charge($donation, $selectedChannel, $selectedMethod);

                if ($charge['status'] === 'success') {
                    Payment::create([
                        'donation_id' => $donation->id,
                        'payment_method' => $charge['payment_method'] ?? $selectedMethod,
                        'payment_channel' => $charge['payment_channel'] ?? $selectedChannel,
                        'payment_destination' => $charge['payment_destination'] ?? $selectedChannel,
                        'checkout_url' => $charge['checkout_url'] ?? null,
                        'gateway' => 'midtrans',
                        'gateway_reference_id' => $charge['order_id'] ?? $donationCode,
                        'gateway_status' => $charge['gateway_status'] ?? 'PENDING',
                        'raw_payload' => $charge['raw_response'] ?? null,
                    ]);

                    // Kirim email tagihan pending
                    Mail::to($donation->donor_email)->queue(new DonationPendingNotification($donation));

                    // 100% Native, redirect ke halaman status internal (NO SNAP)
                    return redirect()->route('donation.status', ['donationCode' => $donationCode]);
                } else {
                    $donation->update(['status' => 'failed']);

                    return back()->with('error', 'Gagal membuat tagihan donasi: '.($charge['message'] ?? 'Kesalahan gateway pembayaran.'));
                }
            } elseif ($this->xendit && ! empty(config('services.xendit.api_key'))) {
                // Fallback legacy Xendit jika Midtrans belum diisi
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

                    Mail::to($donation->donor_email)->queue(new DonationPendingNotification($donation));

                    return inertia()->location($invoice['invoice_url']);
                } else {
                    $donation->update(['status' => 'failed']);

                    return back()->with('error', 'Gagal membuat tagihan donasi: '.$invoice['message']);
                }
            } else {
                $donation->update(['status' => 'failed']);

                return back()->with('error', 'Gateway pembayaran online sedang dalam pemeliharaan. Silakan gunakan Transfer Bank Manual.');
            }
        } else {
            // Offline/Manual transfer
            $channelCode = $validated['payment_channel'] ?? 'MANUAL_BSI';
            $channelDef = MidtransCorePaymentService::findChannel($channelCode, 'offline')
                ?? MidtransCorePaymentService::findChannel($channelCode)
                ?? XenditPaymentService::findChannel($channelCode, 'offline');

            Payment::create([
                'donation_id' => $donation->id,
                'payment_method' => 'bank_transfer_manual',
                'payment_channel' => $channelDef['code'] ?? $channelCode,
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

        // Real-time fallback sync: If donation is pending and online, check gateway API
        if ($donation->status === 'pending' && $donation->channel === 'online') {
            $paymentMidtrans = $donation->payments()->where('gateway', 'midtrans')->latest()->first();
            if ($paymentMidtrans) {
                $this->midtrans->syncPaymentStatus($paymentMidtrans);
                $donation->refresh();
                $donation->load(['program', 'payments']);
            } elseif ($this->xendit) {
                $paymentXendit = $donation->payments()->where('gateway', 'xendit')->latest()->first();
                if ($paymentXendit) {
                    $this->xendit->syncInvoiceStatus($paymentXendit);
                    $donation->refresh();
                    $donation->load(['program', 'payments']);
                }
            }
        }

        $selectedBankAccount = null;
        if ($donation->channel === 'offline') {
            $latestPayment = $donation->payments->last() ?? $donation->payments->first();
            if ($latestPayment) {
                $cleanDestination = preg_replace('/[^0-9]/', '', (string) $latestPayment->payment_destination);
                $channelCode = strtoupper(trim((string) $latestPayment->payment_channel));

                // 1. Try matching in active bank accounts
                $selectedBankAccount = BankAccount::where('is_active', true)
                    ->get()
                    ->first(function ($account) use ($cleanDestination, $channelCode) {
                        $cleanAccNum = preg_replace('/[^0-9]/', '', (string) $account->account_number);
                        if (! empty($cleanDestination) && $cleanAccNum === $cleanDestination) {
                            return true;
                        }

                        $accBankCode = strtoupper((string) ($account->bank_code ?? ''));
                        if (! empty($accBankCode) && ($channelCode === $accBankCode || $channelCode === 'MANUAL_'.$accBankCode)) {
                            return true;
                        }

                        $generatedCode = 'MANUAL_'.strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $account->bank_name));

                        return $channelCode === $generatedCode;
                    });

                // 2. Fallback to all bank accounts if deactivated
                if (! $selectedBankAccount) {
                    $selectedBankAccount = BankAccount::all()
                        ->first(function ($account) use ($cleanDestination, $channelCode) {
                            $cleanAccNum = preg_replace('/[^0-9]/', '', (string) $account->account_number);
                            if (! empty($cleanDestination) && $cleanAccNum === $cleanDestination) {
                                return true;
                            }

                            $accBankCode = strtoupper((string) ($account->bank_code ?? ''));
                            if (! empty($accBankCode) && ($channelCode === $accBankCode || $channelCode === 'MANUAL_'.$accBankCode)) {
                                return true;
                            }

                            $generatedCode = 'MANUAL_'.strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $account->bank_name));

                            return $channelCode === $generatedCode;
                        });
                }

                // 3. Fallback to channel definition
                if (! $selectedBankAccount) {
                    $channelDef = MidtransCorePaymentService::findChannel($channelCode, 'offline')
                        ?? XenditPaymentService::findChannel($channelCode, 'offline');
                    if ($channelDef) {
                        $selectedBankAccount = [
                            'id' => 0,
                            'bank_name' => $channelDef['name'] ?? 'Transfer Bank Manual',
                            'bank_code' => $channelDef['code'] ?? $channelCode,
                            'account_number' => $latestPayment->payment_destination ?: ($channelDef['account_number'] ?? ''),
                            'account_name' => $channelDef['account_name'] ?? 'Yayasan Peduli Insani Indonesia',
                            'instructions' => $channelDef['instructions'] ?? null,
                            'logo_url' => $channelDef['logo_url'] ?? null,
                        ];
                    }
                }
            }
        }

        $proofUrl = null;
        $paymentWithProof = $donation->payments->first(fn ($p) => ! empty($p->transfer_proof));
        if ($paymentWithProof && Storage::disk('local')->exists($paymentWithProof->transfer_proof)) {
            $proofUrl = URL::temporarySignedRoute(
                'donation.proof',
                now()->addMinutes(60),
                ['donation' => $donation->id]
            );
        }

        return inertia('Public/Donation/Status', [
            'donation' => $donation,
            'selectedBankAccount' => $selectedBankAccount,
            'proofUrl' => $proofUrl,
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

    /**
     * View manual donation transfer proof via temporary signed URL.
     */
    public function viewProof(Request $request, Donation $donation)
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'Tautan verifikasi bukti transfer tidak valid atau telah kedaluwarsa.');
        }

        $payment = $donation->payments()->whereNotNull('transfer_proof')->latest()->first();

        if (! $payment || ! Storage::disk('local')->exists($payment->transfer_proof)) {
            abort(404, 'Bukti transfer tidak ditemukan.');
        }

        return Storage::disk('local')->response($payment->transfer_proof);
    }

    /**
     * Cancel a pending donation voluntarily by donor or admin.
     */
    public function cancel(Request $request, string $donationCode)
    {
        $donation = Donation::where('donation_code', $donationCode)->with('payments')->firstOrFail();

        if ($donation->status !== 'pending') {
            return back()->with('error', 'Hanya tagihan donasi dengan status menunggu pembayaran yang dapat dibatalkan.');
        }

        $user = $request->user();
        if ($user) {
            $isOwner = ($donation->donor_user_id === $user->id) || ($donation->donor_email === $user->email);
            $canManage = $user->hasRole('Administrator') || $user->can('donation.view');

            if (! $isOwner && ! $canManage) {
                abort(403, 'Anda tidak memiliki hak untuk membatalkan donasi ini.');
            }
        }

        if ($donation->channel === 'online') {
            $this->midtrans->cancelTransaction($donation->donation_code);
        }

        $donation->update(['status' => 'cancelled']);
        $donation->payments()->where('gateway_status', 'PENDING')->update([
            'gateway_status' => 'CANCELLED',
        ]);

        return redirect()->route('donation.status', ['donationCode' => $donationCode])
            ->with('success', 'Donasi berhasil dibatalkan.');
    }
}
