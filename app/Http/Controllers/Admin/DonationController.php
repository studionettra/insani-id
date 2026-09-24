<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function index(Request $request)
    {
        $baseQuery = Donation::query();

        // Filter based on role
        if (auth()->user()->hasAnyRole(['Campaigner Individu', 'Campaigner Lembaga'])) {
            $baseQuery->whereHas('program', function ($q) {
                $q->where('created_by', auth()->id());
            });
        }

        $counts = [
            'all' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'pending_manual' => (clone $baseQuery)->where('channel', 'offline')->where('status', 'pending')->count(),
            'paid' => (clone $baseQuery)->where('status', 'paid')->count(),
            'failed' => (clone $baseQuery)->where('status', 'failed')->count(),
        ];

        $query = (clone $baseQuery)->with(['program', 'donor', 'payments.confirmedBy']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('donation_code', 'like', "%{$search}%")
                    ->orWhere('donor_name', 'like', "%{$search}%")
                    ->orWhere('donor_email', 'like', "%{$search}%")
                    ->orWhere('donor_phone', 'like', "%{$search}%")
                    ->orWhereHas('program', function ($sub) use ($search) {
                        $sub->where('title', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'pending_manual') {
                $query->where('channel', 'offline')->where('status', 'pending');
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('channel') && $request->status !== 'pending_manual') {
            $query->where('channel', $request->channel);
        }

        if ($request->filled('utm_source')) {
            $query->where('utm_source', $request->utm_source);
        }

        if ($request->filled('utm_campaign')) {
            $query->where('utm_campaign', $request->utm_campaign);
        }

        $donations = $query->latest()->paginate(10)->withQueryString();

        return inertia('Admin/Donation/Index', [
            'donations' => $donations,
            'filters' => $request->only(['search', 'status', 'channel', 'utm_source', 'utm_campaign']),
            'counts' => $counts,
        ]);
    }

    public function confirm(Request $request, Donation $donation)
    {
        // Only authorized staff (Administrator or Keuangan) can confirm manual donations
        if (auth()->user()->hasAnyRole(['Campaigner Individu', 'Campaigner Lembaga']) || ! auth()->user()->hasAnyRole(['Administrator', 'Keuangan', 'Program Officer'])) {
            abort(403, 'Hanya tim Keuangan atau Administrator yang berwenang mengonfirmasi donasi manual.');
        }

        if ($donation->status === 'paid' || $donation->channel !== 'offline') {
            return back()->with('error', 'Donasi ini tidak dapat dikonfirmasi manual.');
        }

        // Get the pending offline payment
        $payment = $donation->payments()->where('gateway', 'manual')->where('gateway_status', 'PENDING')->first();

        if ($payment) {
            $payment->update([
                'gateway_status' => 'PAID',
                'paid_amount' => $donation->amount,
                'paid_at' => now(),
                'confirmed_by' => auth()->id(),
            ]);

            // This will trigger the PaymentObserver to update Donation and send email.
        }

        return back()->with('success', 'Donasi manual berhasil dikonfirmasi.');
    }
}
