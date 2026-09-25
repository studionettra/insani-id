<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CampaignSlotRequest;
use App\Notifications\CampaignSlotRequestReviewedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignSlotRequestController extends Controller
{
    /**
     * Display a listing of slot requests.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'pending');
        $query = CampaignSlotRequest::with(['campaignerProfile.user', 'requester', 'reviewer'])
            ->latest();

        if ($status !== 'semua') {
            $query->where('status', $status);
        }

        $slotRequests = $query->paginate(10)->withQueryString();

        $counts = [
            'pending' => CampaignSlotRequest::where('status', 'pending')->count(),
            'approved' => CampaignSlotRequest::where('status', 'approved')->count(),
            'rejected' => CampaignSlotRequest::where('status', 'rejected')->count(),
            'all' => CampaignSlotRequest::count(),
        ];

        return Inertia::render('Admin/Campaigners/SlotRequests', [
            'slotRequests' => $slotRequests,
            'filters' => ['status' => $status],
            'counts' => $counts,
        ]);
    }

    /**
     * Approve the slot request and update campaigner profile's max slots.
     */
    public function approve(Request $request, CampaignSlotRequest $slotRequest): RedirectResponse
    {
        if ($slotRequest->status !== 'pending') {
            return back()->with('error', 'Permohonan ini sudah diproses sebelumnya.');
        }

        $validated = $request->validate([
            'approved_slots' => 'required|integer|min:'.($slotRequest->current_slots + 1).'|max:100',
            'admin_notes' => 'nullable|string|max:500',
        ], [
            'approved_slots.min' => "Slot yang disetujui harus lebih besar dari kuota saat ini ({$slotRequest->current_slots} slot).",
        ]);

        $slotRequest->status = 'approved';
        $slotRequest->reviewed_by = auth()->id();
        $slotRequest->reviewed_at = now();
        $slotRequest->admin_notes = $validated['admin_notes'] ?? null;
        $slotRequest->save();

        if ($slotRequest->campaignerProfile) {
            $slotRequest->campaignerProfile->update([
                'max_campaign_slots' => $validated['approved_slots'],
            ]);
        }

        if ($slotRequest->requester) {
            $slotRequest->requester->notify(new CampaignSlotRequestReviewedNotification($slotRequest));
        }

        return back()->with('success', "Pengajuan berhasil disetujui. Kuota slot lembaga telah dinaikkan menjadi {$validated['approved_slots']} slot.");
    }

    /**
     * Reject the slot request with notes.
     */
    public function reject(Request $request, CampaignSlotRequest $slotRequest): RedirectResponse
    {
        if ($slotRequest->status !== 'pending') {
            return back()->with('error', 'Permohonan ini sudah diproses sebelumnya.');
        }

        $validated = $request->validate([
            'admin_notes' => 'required|string|min:5|max:500',
        ], [
            'admin_notes.required' => 'Wajib memberikan catatan/alasan penolakan pengajuan.',
            'admin_notes.min' => 'Catatan penolakan minimal 5 karakter.',
        ]);

        $slotRequest->status = 'rejected';
        $slotRequest->reviewed_by = auth()->id();
        $slotRequest->reviewed_at = now();
        $slotRequest->admin_notes = $validated['admin_notes'];
        $slotRequest->save();

        if ($slotRequest->requester) {
            $slotRequest->requester->notify(new CampaignSlotRequestReviewedNotification($slotRequest));
        }

        return back()->with('success', 'Pengajuan penambahan slot telah ditolak dengan catatan.');
    }
}
