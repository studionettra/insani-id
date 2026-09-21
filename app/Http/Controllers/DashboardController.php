<?php

namespace App\Http\Controllers;

use App\Models\CampaignerProfile;
use App\Models\Disbursement;
use App\Models\Donation;
use App\Models\Fundraiser;
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
        $pendingDisbursements = (float) Disbursement::where('status', 'pending')->sum('requested_amount');
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
                'funnel' => [
                    'totalViews' => $totalProgramViews,
                    'totalAttempts' => $totalDonationAttempts,
                    'totalPaid' => $totalPaidDonations,
                    'conversionRate' => $overallConversionRate,
                ],
                'topPrograms' => $topPrograms,
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
                'pendingDisbursements' => $pendingDisbursements,
                'pendingOfflineDonations' => $pendingOfflineDonations,
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
