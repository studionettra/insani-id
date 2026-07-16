<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Services\XenditPaymentService;
use Illuminate\Http\Request;
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
            'program' => $program->load('creator')
        ]);
    }

    public function store(Request $request, Program $program)
    {
        if ($program->status !== 'published') {
            abort(404);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:10000',
            'donor_name' => 'required|string|max:255',
            'donor_email' => 'required|email|max:255',
            'donor_phone' => 'required|string|max:30',
            'is_anonymous' => 'boolean',
            'message' => 'nullable|string',
            'channel' => 'required|in:online,offline',
        ]);

        $donationCode = 'DON-' . strtoupper(Str::random(10));
        
        $uniqueCode = null;
        $totalAmount = $validated['amount'];
        
        if ($validated['channel'] === 'offline') {
            $uniqueCode = rand(101, 999);
            $totalAmount += $uniqueCode;
        }

        $donation = Donation::create([
            'donation_code' => $donationCode,
            'program_id' => $program->id,
            'donor_user_id' => auth()->id(),
            'donor_name' => $validated['donor_name'],
            'donor_email' => $validated['donor_email'],
            'donor_phone' => $validated['donor_phone'],
            'is_anonymous' => $validated['is_anonymous'] ?? false,
            'message' => $validated['message'] ?? null,
            'amount' => $totalAmount,
            'unique_code' => $uniqueCode,
            'channel' => $validated['channel'],
            'status' => 'pending',
        ]);

        if ($donation->channel === 'online') {
            // Generate Xendit Invoice
            $invoice = $this->xendit->createInvoice($donation);

            if ($invoice['status'] === 'success') {
                Payment::create([
                    'donation_id' => $donation->id,
                    'payment_method' => 'virtual_account', // Placeholder, xendit handles actual method in invoice
                    'gateway' => 'xendit',
                    'gateway_reference_id' => $invoice['external_id'],
                    'gateway_status' => 'PENDING',
                ]);

                return inertia()->location($invoice['invoice_url']);
            } else {
                // If failed, mark as failed
                $donation->update(['status' => 'failed']);
                return back()->with('error', 'Gagal membuat tagihan donasi: ' . $invoice['message']);
            }
        } else {
            // Offline/Manual transfer
            Payment::create([
                'donation_id' => $donation->id,
                'payment_method' => 'bank_transfer_manual',
                'gateway' => 'manual',
                'gateway_reference_id' => $donationCode,
                'gateway_status' => 'PENDING',
            ]);

            return redirect()->route('donation.status', ['donationCode' => $donationCode]);
        }
    }

    public function status($donationCode)
    {
        $donation = Donation::where('donation_code', $donationCode)->with('program')->firstOrFail();
        
        return inertia('Public/Donation/Status', [
            'donation' => $donation
        ]);
    }
}
