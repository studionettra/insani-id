<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CampaignerProfile;
use App\Models\VerificationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CampaignerVerificationController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');

        $campaigners = CampaignerProfile::with('user')
            ->where('verification_status', $status)
            ->latest()
            ->paginate(10);

        return inertia('Admin/Campaigners/Index', [
            'campaigners' => $campaigners,
            'filters' => $request->only(['status']),
        ]);
    }

    public function show($id)
    {
        $campaigner = CampaignerProfile::with(['user', 'documents'])->findOrFail($id);

        return inertia('Admin/Campaigners/Show', [
            'campaigner' => $campaigner,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:verified,rejected,suspended',
            'notes' => 'required_if:status,rejected|nullable|string',
            'document_statuses' => 'nullable|array',
            'document_notes' => 'nullable|array',
        ]);

        $campaigner = CampaignerProfile::with('user', 'documents')->findOrFail($id);

        DB::transaction(function () use ($validated, $campaigner) {
            $campaigner->verification_status = $validated['status'];
            $campaigner->save();

            if (! empty($validated['document_statuses'])) {
                foreach ($validated['document_statuses'] as $docId => $status) {
                    $doc = VerificationDocument::find($docId);
                    if ($doc && $doc->campaigner_profile_id === $campaigner->id) {
                        $doc->status = $status;
                        $doc->notes = $validated['document_notes'][$docId] ?? null;
                        $doc->save();
                    }
                }
            }

            if ($validated['status'] === 'verified') {
                $roleName = $campaigner->type === 'lembaga' ? 'Campaigner Lembaga' : 'Campaigner Individu';
                $campaigner->user->assignRole($roleName);
                Log::info("Campaigner {$campaigner->user->name} verified and assigned role {$roleName}");
            } elseif ($validated['status'] === 'rejected') {
                Log::info("Campaigner {$campaigner->user->name} rejected. Notes: {$validated['notes']}");
            }
        });

        return redirect()->route('admin.campaigners.index')->with('success', 'Status verifikasi berhasil diperbarui.');
    }
}
