<?php

namespace App\Http\Controllers;

use App\Models\CampaignerProfile;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\Fundraiser;
use App\Models\Payment;
use App\Models\Program;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display role-aware real-time metrics on dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $roles = $user->getRoleNames()->toArray();

        $isAdministrator = in_array('Administrator', $roles);
        $isProgramOfficer = in_array('Program Officer', $roles);
        $isVerifikator = in_array('Verifikator', $roles);
        $isKeuangan = in_array('Keuangan', $roles);
        $isCampaigner = in_array('Campaigner Individu', $roles) || in_array('Campaigner Lembaga', $roles);
        $isStaff = $isAdministrator || $isProgramOfficer || $isVerifikator || $isKeuangan
            || in_array('Customer Service', $roles)
            || in_array('Eksekutif', $roles)
            || in_array('Relawan Lapangan', $roles)
            || in_array('Content Editor', $roles);

        $isDonor = in_array('Donatur', $roles) || (! $isStaff && ! $isCampaigner);

        // General Platform Stats (for Admins, Keuangan, Program Officer, Eksekutif)
        $totalDonations = (float) Donation::where('status', 'paid')->sum('amount');
        $donationsThisMonth = (float) Donation::where('status', 'paid')
            ->whereMonth('paid_at', Carbon::now()->month)
            ->whereYear('paid_at', Carbon::now()->year)
            ->sum('amount');

        $activePrograms = Program::where('status', 'published')->count();
        $pendingPrograms = Program::where('status', 'pending_verification')->count();
        $pendingCampaigners = CampaignerProfile::where('verification_status', 'pending')->count();
        $totalDonors = Donation::where('status', 'paid')->distinct('donor_email')->count('donor_email');
        $totalDisbursed = (float) Disbursement::where('status', 'transferred')->sum('requested_amount');
        $disbursedThisMonth = (float) Disbursement::where('status', 'transferred')
            ->whereMonth('transferred_at', Carbon::now()->month)
            ->whereYear('transferred_at', Carbon::now()->year)
            ->sum('requested_amount');
        $pendingDisbursements = (float) Disbursement::where('status', 'pending')->sum('requested_amount');
        $pendingDisbursementsCount = Disbursement::where('status', 'pending')->count();
        $pendingOfflineDonations = Donation::where('channel', 'offline')->where('status', 'pending')->count();

        // Donor Specific Data
        $donorStats = null;
        if ($isDonor) {
            $donorDonationsQuery = Donation::where(function ($query) use ($user) {
                $query->where('donor_user_id', $user->id)
                    ->orWhere('donor_email', $user->email);
            });

            $totalDonated = (float) (clone $donorDonationsQuery)->where('status', 'paid')->sum('amount');
            $paidDonationsCount = (clone $donorDonationsQuery)->where('status', 'paid')->count();
            $helpedProgramsCount = (clone $donorDonationsQuery)->where('status', 'paid')->distinct('program_id')->count('program_id');
            $pendingDonations = (clone $donorDonationsQuery)
                ->with('program')
                ->where('status', 'pending')
                ->latest()
                ->get();
            $pendingCount = $pendingDonations->count();

            $recentDonations = (clone $donorDonationsQuery)
                ->with(['program.category', 'payments'])
                ->latest()
                ->take(5)
                ->get();

            $donorStats = [
                'totalDonated' => $totalDonated,
                'paidDonationsCount' => $paidDonationsCount,
                'helpedProgramsCount' => $helpedProgramsCount,
                'pendingCount' => $pendingCount,
                'pendingDonations' => $pendingDonations,
                'recentDonations' => $recentDonations,
            ];
        }

        // Campaigner Specific Data
        $campaignerStats = null;
        if ($isCampaigner) {
            $myProgramsQuery = Program::where('created_by', $user->id);
            $myProgramIds = $myProgramsQuery->pluck('id');

            $campaignerStats = [
                'programsCount' => $myProgramsQuery->count(),
                'activeProgramsCount' => (clone $myProgramsQuery)->where('status', 'published')->count(),
                'totalCollected' => (float) Donation::whereIn('program_id', $myProgramIds)->where('status', 'paid')->sum('amount'),
                'totalDonors' => Donation::whereIn('program_id', $myProgramIds)->where('status', 'paid')->count(),
                'totalDisbursed' => (float) Disbursement::whereIn('program_id', $myProgramIds)->where('status', 'transferred')->sum('requested_amount'),
                'myPrograms' => Program::where('created_by', $user->id)->with('category')->latest()->take(5)->get(),
            ];
        }

        // Fundraiser Specific Data
        $fundraiserCount = Fundraiser::where('user_id', $user->id)->count();
        $isFundraiser = in_array('Fundraiser', $roles) || $fundraiserCount > 0;
        $fundraiserStats = null;
        if ($fundraiserCount > 0) {
            $myFundraisers = Fundraiser::where('user_id', $user->id)
                ->with('program.category')
                ->latest()
                ->take(5)
                ->get();

            $fundraiserStats = [
                'count' => $fundraiserCount,
                'totalCollected' => (float) Fundraiser::where('user_id', $user->id)->sum('collected_amount'),
                'totalDonors' => (int) Fundraiser::where('user_id', $user->id)->sum('donors_count'),
                'fundraisers' => $myFundraisers,
            ];
        }

        // Recent active campaigns
        $recentCampaigns = Program::with('category')
            ->where('status', 'published')
            ->latest()
            ->take(5)
            ->get();

        $recommendedPrograms = Program::with('category')
            ->where('status', 'published')
            ->latest()
            ->take(3)
            ->get();

        // Staff Analytics Data (Charts, UTM Breakdown, Conversion Funnel)
        $analyticsData = null;
        if ($isStaff) {
            $startDate = Carbon::now()->subDays(29)->startOfDay();
            $dailyDonations = Donation::where('status', 'paid')
                ->where('paid_at', '>=', $startDate)
                ->selectRaw('DATE(paid_at) as date, SUM(amount) as total_amount, COUNT(id) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->keyBy('date');

            $dates = [];
            $amounts = [];
            $counts = [];
            for ($i = 29; $i >= 0; $i--) {
                $carbonDate = Carbon::now()->subDays($i);
                $dateKey = $carbonDate->format('Y-m-d');
                $dates[] = $carbonDate->format('d M');
                $amounts[] = isset($dailyDonations[$dateKey]) ? (float) $dailyDonations[$dateKey]->total_amount : 0.0;
                $counts[] = isset($dailyDonations[$dateKey]) ? (int) $dailyDonations[$dateKey]->count : 0;
            }

            // Channel Breakdown (UTM Source)
            $sourceBreakdown = Donation::where('status', 'paid')
                ->selectRaw("COALESCE(NULLIF(utm_source, ''), 'Direct / Organik') as source, COUNT(id) as count, SUM(amount) as total_amount")
                ->groupBy('source')
                ->orderByDesc('total_amount')
                ->get();

            $sourceLabels = [];
            $sourceSeries = [];
            $sourceDetails = [];
            foreach ($sourceBreakdown as $sb) {
                $formattedName = ucfirst(str_replace(['_', '-'], ' ', $sb->source));
                $sourceLabels[] = $formattedName;
                $sourceSeries[] = (int) $sb->count;
                $sourceDetails[] = [
                    'name' => $formattedName,
                    'raw_source' => $sb->source,
                    'count' => (int) $sb->count,
                    'amount' => (float) $sb->total_amount,
                ];
            }

            // Funnel Metrics
            $totalProgramViews = (int) Program::where('status', 'published')->sum('views_count');
            $totalDonationAttempts = Donation::count();
            $totalPaidDonations = Donation::where('status', 'paid')->count();
            $overallConversionRate = $totalProgramViews > 0
                ? round(($totalPaidDonations / $totalProgramViews) * 100, 2)
                : ($totalDonationAttempts > 0 ? round(($totalPaidDonations / $totalDonationAttempts) * 100, 2) : 0.0);

            // Top Performing Programs
            $topPrograms = Program::with('category')
                ->where('status', 'published')
                ->orderByDesc('collected_amount')
                ->take(5)
                ->get()
                ->map(function ($p) {
                    $donationCount = Donation::where('program_id', $p->id)->where('status', 'paid')->count();
                    $views = (int) $p->views_count;
                    $conversionRate = $views > 0 ? round(($donationCount / $views) * 100, 1) : 0.0;

                    return [
                        'id' => $p->id,
                        'title' => $p->title,
                        'slug' => $p->slug,
                        'category' => $p->category?->name,
                        'collected_amount' => (float) $p->collected_amount,
                        'target_amount' => (float) $p->target_amount,
                        'views_count' => $views,
                        'donation_count' => $donationCount,
                        'conversion_rate' => $conversionRate,
                    ];
                });

            // Payment Methods Breakdown
            $rawPaymentMethods = Payment::whereHas('donation', fn ($q) => $q->where('status', 'paid'))
                ->selectRaw("COALESCE(NULLIF(payment_method, ''), 'manual') as method, COUNT(id) as count, SUM(COALESCE(paid_amount, 0)) as total_amount")
                ->groupBy('method')
                ->orderByDesc('count')
                ->get();

            $methodLabels = [];
            $methodSeries = [];
            $methodDetails = [];
            $methodNames = [
                'bank_transfer_manual' => 'Transfer Manual',
                'manual' => 'Transfer Manual',
                'virtual_account' => 'Virtual Account',
                'qris' => 'QRIS Instan',
                'ewallet' => 'E-Wallet',
                'credit_card' => 'Kartu Kredit',
            ];

            foreach ($rawPaymentMethods as $pm) {
                $formattedName = $methodNames[$pm->method] ?? ucfirst(str_replace('_', ' ', $pm->method));
                $methodLabels[] = $formattedName;
                $methodSeries[] = (int) $pm->count;
                $methodDetails[] = [
                    'name' => $formattedName,
                    'raw_method' => $pm->method,
                    'count' => (int) $pm->count,
                    'amount' => (float) $pm->total_amount,
                ];
            }

            if (empty($methodLabels)) {
                $offlineCount = Donation::where('status', 'paid')->where('channel', 'offline')->count();
                $offlineAmount = (float) Donation::where('status', 'paid')->where('channel', 'offline')->sum('amount');
                $onlineCount = Donation::where('status', 'paid')->where('channel', 'online')->count();
                $onlineAmount = (float) Donation::where('status', 'paid')->where('channel', 'online')->sum('amount');

                if ($offlineCount > 0) {
                    $methodLabels[] = 'Transfer Manual';
                    $methodSeries[] = $offlineCount;
                    $methodDetails[] = [
                        'name' => 'Transfer Manual',
                        'raw_method' => 'manual',
                        'count' => $offlineCount,
                        'amount' => $offlineAmount,
                    ];
                }
                if ($onlineCount > 0) {
                    $methodLabels[] = 'Online Gateway / QRIS';
                    $methodSeries[] = $onlineCount;
                    $methodDetails[] = [
                        'name' => 'Online Gateway / QRIS',
                        'raw_method' => 'online',
                        'count' => $onlineCount,
                        'amount' => $onlineAmount,
                    ];
                }
            }

            // Category / Fokus Breakdown
            $categoryDonations = Category::select('categories.id', 'categories.name')
                ->join('programs', 'programs.category_id', '=', 'categories.id')
                ->join('donations', 'donations.program_id', '=', 'programs.id')
                ->where('donations.status', 'paid')
                ->selectRaw('categories.name, SUM(donations.amount) as total_amount, COUNT(donations.id) as donation_count')
                ->groupBy('categories.id', 'categories.name')
                ->orderByDesc('total_amount')
                ->get();

            $catLabels = [];
            $catSeries = [];
            $catDetails = [];
            foreach ($categoryDonations as $cd) {
                $catName = is_array($cd->name) ? ($cd->name[app()->getLocale()] ?? reset($cd->name)) : $cd->name;
                $catLabels[] = (string) $catName;
                $catSeries[] = (float) $cd->total_amount;
                $catDetails[] = [
                    'name' => (string) $catName,
                    'count' => (int) $cd->donation_count,
                    'amount' => (float) $cd->total_amount,
                ];
            }

            // Recent Paid Transactions (Live Stream)
            $recentTransactions = Donation::with(['program.category', 'payments'])
                ->where('status', 'paid')
                ->latest('paid_at')
                ->take(7)
                ->get()
                ->map(function ($d) {
                    $programTitle = is_array($d->program?->title)
                        ? ($d->program->title[app()->getLocale()] ?? reset($d->program->title))
                        : ($d->program?->title ?? 'Program Donasi');

                    $categoryName = is_array($d->program?->category?->name)
                        ? ($d->program->category->name[app()->getLocale()] ?? reset($d->program->category->name))
                        : ($d->program?->category?->name ?? 'Kategori');

                    $method = $d->payments->first()?->payment_method;
                    $methodMap = [
                        'bank_transfer_manual' => 'Manual Transfer',
                        'manual' => 'Manual Transfer',
                        'virtual_account' => 'Virtual Account',
                        'qris' => 'QRIS',
                        'ewallet' => 'E-Wallet',
                    ];

                    return [
                        'id' => $d->id,
                        'donation_code' => $d->donation_code,
                        'donor_name' => $d->is_anonymous ? 'Hamba Allah' : ($d->donor_name ?: 'Donatur'),
                        'amount' => (float) $d->amount,
                        'unique_code' => (int) ($d->unique_code ?? 0),
                        'program_title' => $programTitle,
                        'program_slug' => $d->program?->slug,
                        'category' => $categoryName,
                        'payment_method' => $methodMap[$method] ?? ($d->channel === 'offline' ? 'Manual Transfer' : 'Online'),
                        'paid_at' => $d->paid_at ? $d->paid_at->diffForHumans() : $d->created_at->diffForHumans(),
                        'paid_at_formatted' => $d->paid_at ? $d->paid_at->format('d M Y H:i') : $d->created_at->format('d M Y H:i'),
                    ];
                });

            // Urgent Campaigns Nearing Deadline (< 14 days)
            $urgentPrograms = Program::with('category')
                ->where('status', 'published')
                ->whereNotNull('deadline')
                ->where('deadline', '>=', Carbon::now())
                ->where('deadline', '<=', Carbon::now()->addDays(14))
                ->whereRaw('collected_amount < target_amount')
                ->orderBy('deadline', 'asc')
                ->take(4)
                ->get()
                ->map(function ($p) {
                    $title = is_array($p->title)
                        ? ($p->title[app()->getLocale()] ?? reset($p->title))
                        : $p->title;

                    $category = is_array($p->category?->name)
                        ? ($p->category->name[app()->getLocale()] ?? reset($p->category->name))
                        : $p->category?->name;

                    $daysRemaining = Carbon::now()->diffInDays(Carbon::parse($p->deadline), false);

                    return [
                        'id' => $p->id,
                        'title' => $title,
                        'slug' => $p->slug,
                        'category' => $category,
                        'collected_amount' => (float) $p->collected_amount,
                        'target_amount' => (float) $p->target_amount,
                        'deadline' => Carbon::parse($p->deadline)->format('d M Y'),
                        'days_remaining' => max(0, $daysRemaining),
                        'percentage' => $p->target_amount > 0 ? round(($p->collected_amount / $p->target_amount) * 100, 1) : 0,
                    ];
                });

            $averageDonation = (float) (Donation::where('status', 'paid')->avg('amount') ?? 0);
            $paymentSuccessRate = $totalDonationAttempts > 0
                ? round(($totalPaidDonations / $totalDonationAttempts) * 100, 1)
                : 0.0;
            $pendingContactMessages = ContactMessage::where('is_read', false)->count();

            $analyticsData = [
                'donationTrends' => [
                    'categories' => $dates,
                    'amounts' => $amounts,
                    'counts' => $counts,
                ],
                'utmSources' => [
                    'labels' => $sourceLabels,
                    'series' => $sourceSeries,
                    'details' => $sourceDetails,
                ],
                'paymentMethods' => [
                    'labels' => $methodLabels,
                    'series' => $methodSeries,
                    'details' => $methodDetails,
                ],
                'categoryDonations' => [
                    'labels' => $catLabels,
                    'series' => $catSeries,
                    'details' => $catDetails,
                ],
                'funnel' => [
                    'totalViews' => $totalProgramViews,
                    'totalAttempts' => $totalDonationAttempts,
                    'totalPaid' => $totalPaidDonations,
                    'conversionRate' => $overallConversionRate,
                ],
                'topPrograms' => $topPrograms,
                'recentTransactions' => $recentTransactions,
                'urgentPrograms' => $urgentPrograms,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'totalDonations' => $totalDonations,
                'donationsThisMonth' => $donationsThisMonth,
                'activePrograms' => $activePrograms,
                'pendingPrograms' => $pendingPrograms,
                'pendingCampaigners' => $pendingCampaigners,
                'totalDonors' => $totalDonors,
                'totalDisbursed' => $totalDisbursed,
                'disbursedThisMonth' => $disbursedThisMonth,
                'pendingDisbursements' => $pendingDisbursements,
                'pendingDisbursementsCount' => $pendingDisbursementsCount,
                'pendingOfflineDonations' => $pendingOfflineDonations,
                'averageDonation' => $averageDonation ?? 0,
                'paymentSuccessRate' => $paymentSuccessRate ?? 0,
                'pendingContactMessages' => $pendingContactMessages ?? 0,
            ],
            'analyticsData' => $analyticsData,
            'donorStats' => $donorStats,
            'campaignerStats' => $campaignerStats,
            'fundraiserStats' => $fundraiserStats,
            'recentCampaigns' => $recentCampaigns,
            'recommendedPrograms' => $recommendedPrograms,
            'userRoleInfo' => [
                'isAdministrator' => $isAdministrator,
                'isProgramOfficer' => $isProgramOfficer,
                'isVerifikator' => $isVerifikator,
                'isKeuangan' => $isKeuangan,
                'isCampaigner' => $isCampaigner,
                'isFundraiser' => $isFundraiser,
                'isDonor' => $isDonor,
                'isStaff' => $isStaff,
            ],
        ]);
    }
}
