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

        $donations = $query->get();

        $filename = 'laporan_donasi_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['ID Donasi', 'Tanggal Lunas', 'Program', 'Nama Donatur', 'Nominal', 'Metode Pembayaran', 'Sumber (UTM Source)', 'Media (UTM Medium)', 'Kampanye (UTM Campaign)', 'Referrer'];

        $callback = function () use ($donations, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($donations as $donation) {
                $row['ID Donasi'] = $donation->donation_code;
                $row['Tanggal Lunas'] = $donation->paid_at ? $donation->paid_at->format('Y-m-d H:i:s') : '';
                $row['Program'] = $donation->program ? $donation->program->title : '';
                $row['Nama Donatur'] = $donation->is_anonymous ? 'Hamba Allah' : $donation->donor_name;
                $row['Nominal'] = $donation->amount;
                $row['Metode Pembayaran'] = $donation->payment_method;
                $row['Sumber (UTM Source)'] = $donation->utm_source ?? 'Direct / Organik';
                $row['Media (UTM Medium)'] = $donation->utm_medium ?? '';
                $row['Kampanye (UTM Campaign)'] = $donation->utm_campaign ?? '';
                $row['Referrer'] = $donation->referrer_url ?? '';

                fputcsv($file, [
                    $row['ID Donasi'],
                    $row['Tanggal Lunas'],
                    $row['Program'],
                    $row['Nama Donatur'],
                    $row['Nominal'],
                    $row['Metode Pembayaran'],
                    $row['Sumber (UTM Source)'],
                    $row['Media (UTM Medium)'],
                    $row['Kampanye (UTM Campaign)'],
                    $row['Referrer'],
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

        $disbursements = $query->get();

        $filename = 'laporan_pencairan_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['Tgl Pengajuan', 'Program', 'Nominal Pencairan', 'Status', 'Tujuan Transfer', 'Keterangan'];

        $callback = function () use ($disbursements, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($disbursements as $disb) {
                $row['Tgl Pengajuan'] = $disb->created_at->format('Y-m-d H:i:s');
                $row['Program'] = $disb->program ? $disb->program->title : '';
                $row['Nominal Pencairan'] = $disb->requested_amount;
                $row['Status'] = $disb->status;
                $row['Tujuan Transfer'] = $disb->bank_name.' - '.$disb->bank_account_number;
                $row['Keterangan'] = $disb->notes;

                fputcsv($file, [$row['Tgl Pengajuan'], $row['Program'], $row['Nominal Pencairan'], $row['Status'], $row['Tujuan Transfer'], $row['Keterangan']]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
