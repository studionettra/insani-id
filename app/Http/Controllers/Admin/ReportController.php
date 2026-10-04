<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Disbursement;
use App\Models\Donation;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $totalDonations = (float) Donation::where('status', 'paid')->sum('amount');
        $totalDisbursements = (float) Disbursement::where('status', 'transferred')->sum('requested_amount');

        // Attribution and Marketing Channel Performance
        $channelAttributions = Donation::where('status', 'paid')
            ->selectRaw("
                COALESCE(NULLIF(utm_source, ''), 'Direct / Organik') as source,
                COALESCE(NULLIF(utm_medium, ''), '-') as medium,
                COALESCE(NULLIF(utm_campaign, ''), '-') as campaign,
                COUNT(id) as transactions_count,
                SUM(amount) as total_amount,
                AVG(amount) as average_amount,
                MAX(amount) as max_amount
            ")
            ->groupBy('source', 'medium', 'campaign')
            ->orderByDesc('total_amount')
            ->get()
            ->map(function ($row) {
                return [
                    'source' => $row->source,
                    'medium' => $row->medium,
                    'campaign' => $row->campaign,
                    'transactions_count' => (int) $row->transactions_count,
                    'total_amount' => (float) $row->total_amount,
                    'average_amount' => round((float) $row->average_amount, 0),
                    'max_amount' => (float) $row->max_amount,
                ];
            });

        return inertia('Admin/Reports/Index', [
            'stats' => [
                'totalDonations' => $totalDonations,
                'totalDisbursements' => $totalDisbursements,
            ],
            'channelAttributions' => $channelAttributions,
        ]);
    }

    public function exportDonations(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : null;

        $query = Donation::with(['program'])->where('status', 'paid')->latest();

        if ($startDate && $endDate) {
            $query->whereBetween('paid_at', [$startDate, $endDate]);
        }

        $filename = 'laporan_donasi_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['ID Donasi', 'Tanggal Lunas', 'Program', 'Nama Donatur', 'Nominal', 'Metode Pembayaran', 'Sumber (UTM Source)', 'Media (UTM Medium)', 'Kampanye (UTM Campaign)', 'Referrer'];

        $callback = function () use ($query, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($query->cursor() as $donation) {
                fputcsv($file, [
                    $donation->donation_code,
                    $donation->paid_at ? $donation->paid_at->format('Y-m-d H:i:s') : '',
                    $donation->program ? $donation->program->title : '',
                    $donation->is_anonymous ? 'Inisiator Kebaikan' : $donation->donor_name,
                    $donation->amount,
                    $donation->payment_method,
                    $donation->utm_source ?? 'Direct / Organik',
                    $donation->utm_medium ?? '',
                    $donation->utm_campaign ?? '',
                    $donation->referrer_url ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportDisbursements(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : null;

        $query = Disbursement::with(['program'])->latest();

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $filename = 'laporan_pencairan_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = [
            'No Kuitansi',
            'Tgl Pengajuan',
            'Tgl Transfer',
            'Program',
            'Status',
            'Nominal Pengajuan (Gross)',
            'Potongan Platform (5%)',
            'Biaya Bank (BI-Fast)',
            'Nominal Bersih (Ditransfer)',
            'Bank Tujuan',
            'No Rekening',
            'Atas Nama',
            'Rencana Penyaluran',
            'Target Penerima',
            'Lokasi Penyaluran',
            'Estimasi Tgl Salur',
            'Catatan',
        ];

        $callback = function () use ($query, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($query->cursor() as $disb) {
                fputcsv($file, [
                    $disb->receipt_number ?? "ID #{$disb->id}",
                    $disb->created_at->format('Y-m-d H:i:s'),
                    $disb->transferred_at ? $disb->transferred_at->format('Y-m-d H:i:s') : '-',
                    $disb->program ? $disb->program->title : '',
                    $disb->status,
                    $disb->requested_amount,
                    $disb->platform_fee_amount,
                    $disb->bank_fee ?? 2500,
                    $disb->nett_amount,
                    $disb->bank_name,
                    $disb->bank_account_number,
                    $disb->bank_account_name,
                    $disb->distribution_plan ?? '-',
                    $disb->beneficiary_target ?? '-',
                    $disb->location ?? '-',
                    $disb->estimated_distribution_date ? $disb->estimated_distribution_date->format('Y-m-d') : '-',
                    $disb->notes ?? '-',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
