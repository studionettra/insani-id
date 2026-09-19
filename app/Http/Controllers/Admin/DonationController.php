<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function index(Request $request)
    {
        $query = Donation::with(['program', 'donor', 'payments']);

        // Filter based on role
        if (auth()->user()->hasAnyRole(['Campaigner Individu', 'Campaigner Lembaga'])) {
            $query->whereHas('program', function ($q) {
                $q->where('created_by', auth()->id());
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('donation_code', 'like', "%{$search}%")
                    ->orWhere('donor_name', 'like', "%{$search}%")
                    ->orWhereHas('program', function ($sub) use ($search) {
                        $sub->where('title', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $donations = $query->latest()->paginate(10)->withQueryString();

        return inertia('Admin/Donation/Index', [
            'donations' => $donations,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function confirm(Request $request, Donation $donation)
    {
        // Admin or Campaigner who owns the program
        if (auth()->user()->hasAnyRole(['Campaigner Individu', 'Campaigner Lembaga']) && $donation->program->created_by !== auth()->id()) {
            abort(403);
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
