<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateDisbursementStatusRequest;
use App\Models\Disbursement;
use App\Notifications\DisbursementStatusUpdatedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
                $path = $request->file('transfer_proof')->store('disbursements/proofs', 'local');
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

    public function supportingDocument(Disbursement $disbursement)
    {
        if (! auth()->user()->can('disbursement.view') && ! auth()->user()->hasRole('Administrator')) {
            abort(403, 'Anda tidak memiliki wewenang untuk melihat berkas pendukung.');
        }

        if (! $disbursement->supporting_document || ! Storage::disk('local')->exists($disbursement->supporting_document)) {
            abort(404, 'Dokumen pendukung tidak ditemukan.');
        }

        return Storage::disk('local')->response($disbursement->supporting_document);
    }

    public function proof(Disbursement $disbursement)
    {
        if (! auth()->user()->can('disbursement.view') && ! auth()->user()->hasRole('Administrator')) {
            abort(403, 'Anda tidak memiliki wewenang untuk melihat bukti transfer.');
        }

        if (! $disbursement->transfer_proof || ! Storage::disk('local')->exists($disbursement->transfer_proof)) {
            abort(404, 'Bukti transfer tidak ditemukan.');
        }

        return Storage::disk('local')->response($disbursement->transfer_proof);
    }
}
