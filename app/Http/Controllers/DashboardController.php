<?php

namespace App\Http\Controllers;

use App\Models\CampaignerProfile;
use App\Models\Disbursement;
use App\Models\Donation;
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

        // Recent active campaigns
        $recentCampaigns = Program::with('category')
            ->where('status', 'published')
            ->latest()
            ->take(5)
            ->get();

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
            'campaignerStats' => $campaignerStats,
            'recentCampaigns' => $recentCampaigns,
            'userRoleInfo' => [
                'isAdministrator' => $isAdministrator,
                'isProgramOfficer' => $isProgramOfficer,
                'isVerifikator' => $isVerifikator,
                'isKeuangan' => $isKeuangan,
                'isCampaigner' => $isCampaigner,
            ],
        ]);
    }
}
