<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateDisbursementStatusRequest;
use App\Models\Disbursement;
use App\Notifications\DisbursementStatusUpdatedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisbursementController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');

        $disbursements = Disbursement::with('program')
            ->when($status !== 'all', function ($query) use ($status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Disbursements/Index', [
            'disbursements' => $disbursements,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function show(Disbursement $disbursement)
    {
        $disbursement->load(['program.campaignerProfile', 'program.creator', 'program.category']);

        return Inertia::render('Admin/Disbursements/Show', [
            'disbursement' => $disbursement,
        ]);
    }

    public function receipt(Disbursement $disbursement)
    {
        $disbursement->load(['program.campaignerProfile', 'program.creator', 'program.category', 'approvedBy']);

        return Inertia::render('Admin/Disbursements/Receipt', [
            'disbursement' => $disbursement,
        ]);
    }

    public function updateStatus(UpdateDisbursementStatusRequest $request, Disbursement $disbursement)
    {
        $validated = $request->validated();

        $status = $request->input('status');

        if ($status === 'approved' && $disbursement->status !== 'pending') {
            return back()->with('error', 'Hanya pengajuan pending yang bisa disetujui.');
        }

        if ($status === 'transferred' && $disbursement->status !== 'approved') {
            return back()->with('error', 'Pencairan harus disetujui terlebih dahulu sebelum ditransfer.');
        }

        $disbursement->status = $status;

        if ($status === 'approved' || $status === 'rejected') {
            $disbursement->approved_by = auth()->id();
        }

        if ($status === 'rejected') {
            $disbursement->rejection_reason = $request->input('rejection_reason');
        }

        if ($status === 'transferred') {
            $disbursement->transferred_at = now();
            if (empty($disbursement->receipt_number)) {
                $disbursement->receipt_number = 'KW-DISB-'.now()->format('Ym').'-'.str_pad((string) $disbursement->id, 4, '0', STR_PAD_LEFT);
            }
            if ($request->hasFile('transfer_proof')) {
                $path = $request->file('transfer_proof')->store('disbursements', 'public');
                $disbursement->transfer_proof = $path;
            }
        }

        $disbursement->save();

        $disbursement->loadMissing(['program.creator', 'program.campaignerProfile.user']);
        $recipient = $disbursement->program?->creator ?? $disbursement->program?->campaignerProfile?->user;
        if ($recipient) {
            rescue(fn () => $recipient->notify(
                new DisbursementStatusUpdatedNotification($disbursement)
            ));
        }

        return back()->with('success', 'Status pencairan berhasil diubah.');
    }
}
