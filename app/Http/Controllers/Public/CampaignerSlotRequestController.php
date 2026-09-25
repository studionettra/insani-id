<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CampaignSlotRequest;
use App\Models\User;
use App\Notifications\CampaignSlotRequestedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class CampaignerSlotRequestController extends Controller
{
    /**
     * Store a newly created slot request.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $profile = $user->campaignerProfile;

        if (! $profile || $profile->type !== 'lembaga') {
            return back()->with('error', 'Hanya mitra lembaga yang dapat mengajukan penambahan kuota slot campaign.');
        }

        if ($profile->hasPendingSlotRequest()) {
            return back()->with('error', 'Anda masih memiliki permohonan penambahan slot yang sedang dalam proses peninjauan oleh Superadmin.');
        }

        $currentSlots = $profile->max_campaign_slots ?? 3;

        $validated = $request->validate([
            'requested_slots' => 'required|integer|min:'.($currentSlots + 1).'|max:50',
            'reason' => 'required|string|min:10|max:1000',
            'planned_programs' => 'nullable|string|max:1000',
        ], [
            'requested_slots.min' => "Jumlah slot yang diajukan harus lebih besar dari kuota saat ini ({$currentSlots} slot).",
            'requested_slots.max' => 'Pengajuan slot maksimal 50 slot.',
            'reason.required' => 'Mohon sertakan alasan pengajuan penambahan slot campaign.',
            'reason.min' => 'Alasan pengajuan minimal 10 karakter.',
        ]);

        $slotRequest = CampaignSlotRequest::create([
            'campaigner_profile_id' => $profile->id,
            'requested_by' => $user->id,
            'current_slots' => $currentSlots,
            'requested_slots' => $validated['requested_slots'],
            'reason' => $validated['reason'],
            'planned_programs' => $validated['planned_programs'] ?? null,
            'status' => 'pending',
        ]);

        // Send notification to Verifikators / Administrators
        $admins = rescue(fn () => User::permission('campaigner.verify')->get(), collect(), false);
        if ($admins->isEmpty()) {
            $admins = rescue(fn () => User::role(['Administrator', 'Superadmin'])->get(), collect(), false);
        }
        if ($admins->isNotEmpty()) {
            Notification::send($admins->unique('id'), new CampaignSlotRequestedNotification($slotRequest));
        }

        return back()->with('success', "Pengajuan penambahan menjadi {$validated['requested_slots']} slot campaign berhasil dikirim. Tim Superadmin akan segera meninjau permohonan Anda.");
    }
}
