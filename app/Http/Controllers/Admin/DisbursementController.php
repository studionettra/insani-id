<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateDisbursementStatusRequest;
use App\Models\Disbursement;
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
        $disbursement->load(['program.campaignerProfile', 'program.creator']);

        return Inertia::render('Admin/Disbursements/Show', [
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
            if ($request->hasFile('transfer_proof')) {
                $path = $request->file('transfer_proof')->store('disbursements', 'public');
                $disbursement->transfer_proof = $path;
            }
        }

        $disbursement->save();

        return back()->with('success', 'Status pencairan berhasil diubah.');
    }
}
