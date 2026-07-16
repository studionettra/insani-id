<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Donation;
use App\Models\Disbursement;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // For the dashboard view, we can provide some basic stats
        $totalDonations = Donation::where('status', 'paid')->sum('amount');
        $totalDisbursements = Disbursement::where('status', 'transferred')->sum('requested_amount');

        return inertia('Admin/Reports/Index', [
            'stats' => [
                'totalDonations' => $totalDonations,
                'totalDisbursements' => $totalDisbursements,
            ]
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

        $filename = "laporan_donasi_" . now()->format('Ymd_His') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID Donasi', 'Tanggal Lunas', 'Program', 'Nama Donatur', 'Nominal', 'Metode Pembayaran'];

        $callback = function() use($donations, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($donations as $donation) {
                $row['ID Donasi'] = $donation->donation_code;
                $row['Tanggal Lunas'] = $donation->paid_at ? $donation->paid_at->format('Y-m-d H:i:s') : '';
                $row['Program'] = $donation->program ? $donation->program->title : '';
                $row['Nama Donatur'] = $donation->is_anonymous ? 'Hamba Allah' : $donation->donor_name;
                $row['Nominal'] = $donation->amount;
                $row['Metode Pembayaran'] = $donation->payment_method;

                fputcsv($file, array($row['ID Donasi'], $row['Tanggal Lunas'], $row['Program'], $row['Nama Donatur'], $row['Nominal'], $row['Metode Pembayaran']));
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

        $filename = "laporan_pencairan_" . now()->format('Ymd_His') . ".csv";

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Tgl Pengajuan', 'Program', 'Nominal Pencairan', 'Status', 'Tujuan Transfer', 'Keterangan'];

        $callback = function() use($disbursements, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($disbursements as $disb) {
                $row['Tgl Pengajuan'] = $disb->created_at->format('Y-m-d H:i:s');
                $row['Program'] = $disb->program ? $disb->program->title : '';
                $row['Nominal Pencairan'] = $disb->requested_amount;
                $row['Status'] = $disb->status;
                $row['Tujuan Transfer'] = $disb->bank_name . ' - ' . $disb->bank_account_number;
                $row['Keterangan'] = $disb->notes;

                fputcsv($file, array($row['Tgl Pengajuan'], $row['Program'], $row['Nominal Pencairan'], $row['Status'], $row['Tujuan Transfer'], $row['Keterangan']));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
