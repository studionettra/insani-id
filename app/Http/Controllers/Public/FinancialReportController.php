<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\FinancialReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class FinancialReportController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->to(url('/tentang-kami#laporan-keuangan'));
    }

    public function download(FinancialReport $financial_report): Response|RedirectResponse
    {
        $financial_report->increment('download_count');

        if ($financial_report->file_path && Storage::disk('public')->exists($financial_report->file_path)) {
            return Storage::disk('public')->download(
                $financial_report->file_path,
                ($financial_report->slug ?: 'laporan-keuangan').'.pdf'
            );
        }

        if ($financial_report->external_url) {
            return redirect()->away($financial_report->external_url);
        }

        abort(404, 'Berkas laporan tidak ditemukan.');
    }
}
