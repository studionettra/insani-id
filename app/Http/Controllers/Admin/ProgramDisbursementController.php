<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminDisbursementRequest;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProgramDisbursementController extends Controller
{
    /**
     * Tampilkan formulir pencatatan penyaluran dana untuk program internal.
     */
    public function create(Program $program): Response
    {
        if ($program->campaigner_type !== 'internal') {
            abort(403, 'Penyaluran dana internal hanya berlaku untuk program yang dikelola langsung oleh yayasan.');
        }

        $program->loadMissing(['category', 'creator']);

        $availableBalance = (float) $program->available_balance;
        $totalCollected = (float) $program->total_collected_amount;
        $totalDisbursed = (float) $program->total_disbursed_amount;
        $totalGatewayFees = (float) $program->total_gateway_fees;

        $recentDisbursements = $program->disbursements()
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Programs/Disbursements/Create', [
            'program' => array_merge($program->toArray(), [
                'title_translations' => $program->getTranslations('title'),
            ]),
            'metrics' => [
                'total_collected' => $totalCollected,
                'total_gateway_fees' => $totalGatewayFees,
                'total_disbursed' => $totalDisbursed,
                'available_balance' => $availableBalance,
            ],
            'recentDisbursements' => $recentDisbursements,
        ]);
    }

    /**
     * Simpan transaksi penyaluran dana program internal.
     */
    public function store(StoreAdminDisbursementRequest $request, Program $program): RedirectResponse
    {
        $docPath = $request->hasFile('supporting_document')
            ? $request->file('supporting_document')->store('disbursements/documents', 'local')
            : null;

        $proofPath = $request->hasFile('transfer_proof')
            ? $request->file('transfer_proof')->store('disbursements/proofs', 'local')
            : null;

        $disbursement = DB::transaction(function () use ($program, $request, $docPath, $proofPath) {
            $lockedProgram = Program::whereKey($program->id)->lockForUpdate()->firstOrFail();
            $availableBalance = (float) $lockedProgram->available_balance;
            $requestedAmount = (float) $request->input('requested_amount');

            if ($requestedAmount > $availableBalance) {
                abort(422, 'Nominal penyaluran melebihi sisa kas program yang tersedia.');
            }

            $isDirectTransferred = $request->boolean('is_direct_transferred');
            $status = $isDirectTransferred ? 'transferred' : 'approved';

            $notePrefix = '['.strtoupper((string) $request->input('disbursement_type', 'INTERNAL')).'] ';
            $notes = trim($notePrefix.($request->input('notes') ?? ''));

            $disbursement = $lockedProgram->disbursements()->create([
                'requested_amount' => $requestedAmount,
                'bank_name' => $request->input('bank_name'),
                'bank_account_number' => $request->input('bank_account_number'),
                'bank_account_name' => $request->input('bank_account_name'),
                'platform_fee_percent' => 0.0,
                'platform_fee_amount' => 0.0,
                'gateway_fee' => 0.0,
                'bank_fee' => 0.0,
                'nett_amount' => $requestedAmount,
                'notes' => $notes,
                'distribution_plan' => $request->input('distribution_plan'),
                'beneficiary_target' => $request->input('beneficiary_target'),
                'location' => $request->input('location'),
                'estimated_distribution_date' => $request->input('estimated_distribution_date'),
                'supporting_document' => $docPath,
                'transfer_proof' => $proofPath,
                'status' => $status,
                'approved_by' => auth()->id(),
                'transferred_at' => $isDirectTransferred ? now() : null,
            ]);

            // Tetapkan nomor kuitansi resmi
            $disbursement->receipt_number = 'KW-DISB-'.now()->format('Ym').'-'.str_pad((string) $disbursement->id, 4, '0', STR_PAD_LEFT);
            $disbursement->save();

            return $disbursement;
        });

        return redirect()->route('admin.programs.show', [
            'program' => $program->id,
            'tab' => 'finances',
        ])->with('success', 'Penyaluran dana program internal berhasil dicatat (No. Kuitansi: '.$disbursement->receipt_number.').');
    }
}
