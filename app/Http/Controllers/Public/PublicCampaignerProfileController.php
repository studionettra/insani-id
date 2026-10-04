<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CampaignerProfile;
use App\Models\Donation;
use App\Models\Program;
use Inertia\Inertia;
use Inertia\Response;

class PublicCampaignerProfileController extends Controller
{
    public function show(CampaignerProfile $campaignerProfile): Response
    {
        // Only verified campaigners have a public profile
        if ($campaignerProfile->verification_status !== 'verified') {
            abort(404);
        }

        $campaignerProfile->load(['user:id,name,created_at']);

        // Find all published programs by this campaigner
        $programs = Program::with(['category:id,name,icon'])
            ->where(function ($query) use ($campaignerProfile) {
                $query->where('campaigner_profile_id', $campaignerProfile->id)
                    ->orWhere('created_by', $campaignerProfile->user_id);
            })
            ->where('status', 'published')
            ->latest('published_at')
            ->get();

        // Calculate statistics
        $totalCollected = (float) $programs->sum('collected_amount');
        $totalPrograms = $programs->count();

        // Donors count across all programs
        $programIds = $programs->pluck('id');
        $totalDonors = Donation::whereIn('program_id', $programIds)
            ->where('status', 'paid')
            ->distinct('donor_email')
            ->count('donor_email');

        // Split programs into active vs completed
        $activePrograms = $programs->filter(function ($program) {
            if ($program->is_continuous) {
                return true;
            }
            if ($program->deadline && $program->deadline->startOfDay()->isPast()) {
                return false;
            }

            return true;
        })->values();

        $completedPrograms = $programs->filter(function ($program) {
            if ($program->is_continuous) {
                return false;
            }
            if ($program->deadline && $program->deadline->startOfDay()->isPast()) {
                return true;
            }
            if ($program->target_amount && (float) $program->target_amount > 0 && (float) $program->collected_amount >= (float) $program->target_amount) {
                return true;
            }

            return false;
        })->values();

        // Safe location extraction (City / Regency level only, never expose full house/RT/RW address)
        $cleanLocation = $this->extractCleanLocation($campaignerProfile->address);

        // Strictly sanitized campaigner payload (KYC & financial data never exposed)
        $safeProfile = [
            'id' => $campaignerProfile->id,
            'type' => $campaignerProfile->type,
            'nama_lembaga' => $campaignerProfile->nama_lembaga,
            'nomor_sk' => $campaignerProfile->nomor_sk,
            'has_npwp' => ! empty($campaignerProfile->npwp),
            'npwp_display' => $this->maskNpwp($campaignerProfile->npwp),
            'location' => $campaignerProfile->type === 'lembaga' ? $cleanLocation : null,
            'created_at' => $campaignerProfile->created_at?->toISOString(),
            'name' => $campaignerProfile->type === 'lembaga'
                ? ($campaignerProfile->nama_lembaga ?: $campaignerProfile->user?->name)
                : $campaignerProfile->user?->name,
            'user' => [
                'name' => $campaignerProfile->user?->name,
            ],
        ];

        return Inertia::render('Public/Campaigner/Show', [
            'campaigner' => $safeProfile,
            'stats' => [
                'total_collected' => $totalCollected,
                'total_programs' => $totalPrograms,
                'total_donors' => $totalDonors,
                'active_programs_count' => $activePrograms->count(),
                'completed_programs_count' => $completedPrograms->count(),
            ],
            'activePrograms' => $activePrograms,
            'completedPrograms' => $completedPrograms,
        ]);
    }

    private function extractCleanLocation(?string $address): ?string
    {
        if (empty($address)) {
            return null;
        }

        $lines = preg_split('/[\r\n,]+/', $address);
        $lines = array_values(array_filter(array_map('trim', $lines)));

        if (count($lines) >= 2) {
            $lastParts = array_slice($lines, -2);

            return implode(', ', $lastParts);
        }

        return $lines[0] ?? null;
    }

    private function maskNpwp(?string $npwp): ?string
    {
        if (empty($npwp)) {
            return null;
        }

        $clean = preg_replace('/[^0-9]/', '', $npwp);
        if (strlen($clean) >= 15) {
            return substr($clean, 0, 4).'.***.***.*-***.'.substr($clean, -3);
        }

        return 'Terverifikasi';
    }
}
