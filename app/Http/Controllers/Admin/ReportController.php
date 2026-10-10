<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        [$startDate, $endDate, $range] = $this->resolveDateRange($request);

        // 1. Inflow: Donations
        $donationQuery = Donation::where('status', 'paid');
        if ($startDate && $endDate) {
            $donationQuery->whereBetween('paid_at', [$startDate, $endDate]);
        }
        $totalGrossDonations = (float) $donationQuery->sum('amount');
        $totalDonationsCount = (int) $donationQuery->count();

        // 2. Third-Party Deductions: Gateway Fees
        $gatewayFeeQuery = DB::table('donations')
            ->join('payments', 'donations.id', '=', 'payments.donation_id')
            ->where('donations.status', 'paid');
        if ($startDate && $endDate) {
            $gatewayFeeQuery->whereBetween('donations.paid_at', [$startDate, $endDate]);
        }
        $totalGatewayFees = (float) $gatewayFeeQuery->sum('payments.gateway_fee');
        $netCollectedDonations = max(0, $totalGrossDonations - $totalGatewayFees);

        // 3. Outflow: Disbursements
        $disbursementQuery = Disbursement::where('status', 'transferred');
        if ($startDate && $endDate) {
            $disbursementQuery->whereBetween('transferred_at', [$startDate, $endDate]);
        }
        $totalPlatformFees = (float) $disbursementQuery->sum('platform_fee_amount');
        $totalBankFees = (float) $disbursementQuery->sum('bank_fee');
        $totalDisbursedNett = (float) $disbursementQuery->sum('nett_amount');
        $totalDisbursementsCount = (int) $disbursementQuery->count();
        // Total alokasi bruto penyaluran dari rekening penampungan (mencakup hak campaigner dan alokasi hak lembaga)
        $totalDisbursedGross = (float) $disbursementQuery->selectRaw('SUM(requested_amount + platform_fee_amount) as total')->value('total');

        // Breakdown Penyaluran Internal Yayasan vs Mitra Campaigner
        $internalDisbursedAmount = (float) (clone $disbursementQuery)
            ->whereHas('program', fn ($q) => $q->where('campaigner_type', 'internal'))
            ->sum('requested_amount');
        $internalDisbursementsCount = (int) (clone $disbursementQuery)
            ->whereHas('program', fn ($q) => $q->where('campaigner_type', 'internal'))
            ->count();

        $campaignerDisbursedAmount = (float) (clone $disbursementQuery)
            ->whereHas('program', fn ($q) => $q->where('campaigner_type', '!=', 'internal'))
            ->sum('requested_amount');
        $campaignerDisbursementsCount = (int) (clone $disbursementQuery)
            ->whereHas('program', fn ($q) => $q->where('campaigner_type', '!=', 'internal'))
            ->count();

        // 4. Escrow & Cashflow Balance
        // Point-in-time total escrow fund currently held across all programs
        $allTimeNetCollected = (float) (Donation::where('status', 'paid')->sum('amount') -
            DB::table('donations')
                ->join('payments', 'donations.id', '=', 'payments.donation_id')
                ->where('donations.status', 'paid')
                ->sum('payments.gateway_fee'));
        $allTimeDisbursedGross = (float) Disbursement::whereIn('status', ['transferred'])
            ->selectRaw('SUM(requested_amount + platform_fee_amount) as total')
            ->value('total');
        $currentEscrowBalance = max(0, $allTimeNetCollected - $allTimeDisbursedGross);
        $periodNetCashflow = $netCollectedDonations - $totalDisbursedGross;

        // 5. Payment Channel Performance Aggregation
        $channelRows = DB::table('donations')
            ->join('payments', 'donations.id', '=', 'payments.donation_id')
            ->where('donations.status', 'paid');
        if ($startDate && $endDate) {
            $channelRows->whereBetween('donations.paid_at', [$startDate, $endDate]);
        }
        $rawChannels = $channelRows->selectRaw('
            payments.payment_method,
            payments.payment_channel,
            payments.payment_destination,
            donations.channel as donation_channel,
            COUNT(donations.id) as transactions_count,
            SUM(donations.amount) as gross_amount,
            SUM(payments.gateway_fee) as gateway_fee
        ')
            ->groupBy('payments.payment_method', 'payments.payment_channel', 'payments.payment_destination', 'donations.channel')
            ->get();

        $groupedChannels = [];
        foreach ($rawChannels as $row) {
            $label = Payment::formatChannelLabel(
                $row->payment_channel,
                $row->payment_method,
                $row->payment_destination,
                $row->donation_channel
            );
            $isManual = ($row->donation_channel === 'offline') || ($row->payment_method === 'bank_transfer_manual');
            $category = $isManual ? 'Transfer Bank Manual' : 'Payment Gateway';

            if (! isset($groupedChannels[$label])) {
                $groupedChannels[$label] = [
                    'channel_label' => $label,
                    'category' => $category,
                    'transactions_count' => 0,
                    'gross_amount' => 0.0,
                    'gateway_fee' => 0.0,
                    'net_amount' => 0.0,
                ];
            }

            $groupedChannels[$label]['transactions_count'] += (int) $row->transactions_count;
            $groupedChannels[$label]['gross_amount'] += (float) $row->gross_amount;
            $groupedChannels[$label]['gateway_fee'] += (float) $row->gateway_fee;
            $groupedChannels[$label]['net_amount'] += ((float) $row->gross_amount - (float) $row->gateway_fee);
        }

        $paymentChannelStats = collect($groupedChannels)
            ->map(function ($item) use ($totalGrossDonations) {
                $item['percentage'] = $totalGrossDonations > 0
                    ? round(($item['gross_amount'] / $totalGrossDonations) * 100, 1)
                    : 0;
                $item['average_amount'] = $item['transactions_count'] > 0
                    ? round($item['gross_amount'] / $item['transactions_count'], 0)
                    : 0;

                return $item;
            })
            ->sortByDesc('gross_amount')
            ->values()
            ->all();

        // 6. Source Attribution: Direct / Campaigner vs Fundraiser
        $directQuery = Donation::where('status', 'paid')->whereNull('fundraiser_id');
        if ($startDate && $endDate) {
            $directQuery->whereBetween('paid_at', [$startDate, $endDate]);
        }
        $directCount = (int) $directQuery->count();
        $directAmount = (float) $directQuery->sum('amount');

        $fundraiserDonationQuery = Donation::where('status', 'paid')->whereNotNull('fundraiser_id');
        if ($startDate && $endDate) {
            $fundraiserDonationQuery->whereBetween('paid_at', [$startDate, $endDate]);
        }
        $fundraiserCount = (int) $fundraiserDonationQuery->count();
        $fundraiserAmount = (float) $fundraiserDonationQuery->sum('amount');

        $attributionTotalAmount = $directAmount + $fundraiserAmount;
        $directPercentage = $attributionTotalAmount > 0 ? round(($directAmount / $attributionTotalAmount) * 100, 1) : 0;
        $fundraiserPercentage = $attributionTotalAmount > 0 ? round(($fundraiserAmount / $attributionTotalAmount) * 100, 1) : 0;

        // Top 10 Fundraisers in the period
        $topFundraisersQuery = DB::table('donations')
            ->join('fundraisers', 'donations.fundraiser_id', '=', 'fundraisers.id')
            ->join('users', 'fundraisers.user_id', '=', 'users.id')
            ->join('programs', 'fundraisers.program_id', '=', 'programs.id')
            ->where('donations.status', 'paid');
        if ($startDate && $endDate) {
            $topFundraisersQuery->whereBetween('donations.paid_at', [$startDate, $endDate]);
        }
        $topFundraisers = $topFundraisersQuery->selectRaw('
            fundraisers.id as fundraiser_id,
            fundraisers.referral_code,
            users.name as fundraiser_name,
            users.email as fundraiser_email,
            programs.title as program_title,
            programs.slug as program_slug,
            COUNT(donations.id) as donations_count,
            SUM(donations.amount) as total_raised
        ')
            ->groupBy('fundraisers.id', 'fundraisers.referral_code', 'users.name', 'users.email', 'programs.title', 'programs.slug')
            ->orderByDesc('total_raised')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $cleanTitle = $row->program_title;
                if (is_string($cleanTitle) && str_starts_with(trim($cleanTitle), '{')) {
                    $decoded = json_decode($cleanTitle, true);
                    if (is_array($decoded)) {
                        $cleanTitle = $decoded['id'] ?? $decoded['en'] ?? reset($decoded) ?? $cleanTitle;
                    }
                }

                return [
                    'fundraiser_id' => $row->fundraiser_id,
                    'referral_code' => $row->referral_code,
                    'name' => $row->fundraiser_name,
                    'email' => $row->fundraiser_email,
                    'program_title' => $cleanTitle,
                    'program_slug' => $row->program_slug,
                    'donations_count' => (int) $row->donations_count,
                    'total_raised' => (float) $row->total_raised,
                ];
            });

        // 7. Attribution and Marketing Channel Performance (UTM)
        $utmDonationQuery = Donation::where('status', 'paid');
        if ($startDate && $endDate) {
            $utmDonationQuery->whereBetween('paid_at', [$startDate, $endDate]);
        }
        $channelAttributions = $utmDonationQuery
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
            'filters' => [
                'range' => $range,
                'start_date' => $startDate ? $startDate->format('Y-m-d') : '',
                'end_date' => $endDate ? $endDate->format('Y-m-d') : '',
            ],
            'financialSummary' => [
                'total_gross_donations' => $totalGrossDonations,
                'total_donations_count' => $totalDonationsCount,
                'total_gateway_fees' => $totalGatewayFees,
                'net_collected_donations' => $netCollectedDonations,
                'total_disbursed_gross' => $totalDisbursedGross,
                'total_disbursements_count' => $totalDisbursementsCount,
                'total_platform_fees' => $totalPlatformFees,
                'total_bank_fees' => $totalBankFees,
                'total_disbursed_nett' => $totalDisbursedNett,
                'internal_disbursed_amount' => $internalDisbursedAmount,
                'internal_disbursements_count' => $internalDisbursementsCount,
                'campaigner_disbursed_amount' => $campaignerDisbursedAmount,
                'campaigner_disbursements_count' => $campaignerDisbursementsCount,
                'escrow_balance' => $currentEscrowBalance,
                'period_net_cashflow' => $periodNetCashflow,
            ],
            'paymentChannelStats' => $paymentChannelStats,
            'attributionStats' => [
                'direct' => [
                    'count' => $directCount,
                    'amount' => $directAmount,
                    'percentage' => $directPercentage,
                ],
                'fundraiser' => [
                    'count' => $fundraiserCount,
                    'amount' => $fundraiserAmount,
                    'percentage' => $fundraiserPercentage,
                ],
                'top_fundraisers' => $topFundraisers,
            ],
            'stats' => [
                'totalDonations' => $totalGrossDonations,
                'totalDisbursements' => $totalDisbursedGross,
            ],
            'channelAttributions' => $channelAttributions,
        ]);
    }

    public function exportDonations(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : null;

        $query = Donation::with(['program', 'payments', 'fundraiser.user'])
            ->where('status', 'paid')
            ->latest('paid_at');

        if ($startDate && $endDate) {
            $query->whereBetween('paid_at', [$startDate, $endDate]);
        }

        $filename = 'laporan_donasi_keuangan_'.now()->format('Ymd_His').'.csv';

        $headers = [
            'Content-type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = [
            'ID Donasi',
            'Tanggal Lunas',
            'Program',
            'Nama Donatur',
            'Nominal Donasi',
            'Kategori Saluran',
            'Kanal Pembayaran',
            'Biaya Payment Gateway',
            'Nominal Bersih Diterima',
            'Atribusi Sumber',
            'Nama Relawan Fundraiser',
            'Kode Referral',
            'Sumber UTM',
            'Media UTM',
            'Kampanye UTM',
            'Referrer',
        ];

        $callback = function () use ($query, $columns) {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM for Microsoft Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            foreach ($query->cursor() as $donation) {
                /** @var Payment|null $payment */
                $payment = $donation->payments->whereIn('gateway_status', ['PAID', 'SETTLED'])->sortByDesc('created_at')->first()
                    ?? $donation->payments->sortByDesc('created_at')->first();

                $channelLabel = $payment
                    ? $payment->payment_channel_label
                    : Payment::formatChannelLabel(null, null, null, $donation->channel);

                $gatewayFee = $payment ? (float) $payment->gateway_fee : 0.0;
                $netAmount = max(0, (float) $donation->amount - $gatewayFee);

                $isManual = ($donation->channel === 'offline') || ($payment && $payment->payment_method === 'bank_transfer_manual');
                $category = $isManual ? 'Transfer Bank Manual' : 'Payment Gateway';

                $attribution = $donation->fundraiser_id ? 'Relawan Fundraiser' : 'Campaigner Langsung / Organik';
                $fundraiserName = $donation->fundraiser?->user?->name ?? ($donation->fundraiser_id ? "Fundraiser #{$donation->fundraiser_id}" : '-');
                $referralCode = $donation->fundraiser?->referral_code ?? '-';

                fputcsv($file, [
                    $donation->donation_code,
                    $donation->paid_at ? $donation->paid_at->format('Y-m-d H:i:s') : '',
                    $donation->program ? $donation->program->title : '',
                    $donation->is_anonymous ? 'Inisiator Kebaikan' : $donation->donor_name,
                    $donation->amount,
                    $category,
                    $channelLabel,
                    $gatewayFee,
                    $netAmount,
                    $attribution,
                    $fundraiserName,
                    $referralCode,
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
            'Content-type' => 'text/csv; charset=UTF-8',
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
            'Alokasi Program Bruto',
            'Nominal Pengajuan Campaigner',
            'Hak Lembaga 5%',
            'Biaya Bank BI-Fast',
            'Nominal Bersih Ditransfer',
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
            // Add UTF-8 BOM for Microsoft Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, $columns);

            foreach ($query->cursor() as $disb) {
                $grossAllocation = (float) $disb->requested_amount + (float) $disb->platform_fee_amount;
                fputcsv($file, [
                    $disb->receipt_number ?? "ID #{$disb->id}",
                    $disb->created_at->format('Y-m-d H:i:s'),
                    $disb->transferred_at ? $disb->transferred_at->format('Y-m-d H:i:s') : '-',
                    $disb->program ? $disb->program->title : '',
                    $disb->status,
                    $grossAllocation,
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

    /**
     * Resolve standard or custom date range filters.
     *
     * @return array{0: ?Carbon, 1: ?Carbon, 2: string}
     */
    protected function resolveDateRange(Request $request): array
    {
        $range = $request->input('range', 'all');
        $startDate = null;
        $endDate = null;

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $range = 'custom';
        } elseif ($range === 'today') {
            $startDate = Carbon::today()->startOfDay();
            $endDate = Carbon::today()->endOfDay();
        } elseif ($range === '7d') {
            $startDate = Carbon::now()->subDays(6)->startOfDay();
            $endDate = Carbon::now()->endOfDay();
        } elseif ($range === '30d') {
            $startDate = Carbon::now()->subDays(29)->startOfDay();
            $endDate = Carbon::now()->endOfDay();
        } elseif ($range === 'this_month') {
            $startDate = Carbon::now()->startOfMonth();
            $endDate = Carbon::now()->endOfMonth();
        } elseif ($range === 'this_year') {
            $startDate = Carbon::now()->startOfYear();
            $endDate = Carbon::now()->endOfYear();
        } else {
            $range = 'all';
        }

        return [$startDate, $endDate, $range];
    }
}
