<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramUpdate;
use Illuminate\Http\Request;

class CampaignerProgramUpdateController extends Controller
{
    public function index(Program $program)
    {
        $profileId = auth()->user()->campaignerProfile?->id;

        if (!$profileId || $program->campaigner_profile_id !== $profileId) {
            abort(403, 'Unauthorized.');
        }

        $updates = $program->updates()->latest()->paginate(10);

        return inertia('Public/Akun/Program/Updates', [
            'program' => $program,
            'updates' => $updates,
        ]);
    }

    public function store(Request $request, Program $program)
    {
        $profileId = auth()->user()->campaignerProfile?->id;

        if (!$profileId || $program->campaigner_profile_id !== $profileId) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_published' => 'boolean',
        ]);

        $program->updates()->create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'is_published' => $validated['is_published'] ?? true,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Kabar terbaru berhasil ditambahkan.');
    }

    public function update(Request $request, Program $program, ProgramUpdate $update)
    {
        $profileId = auth()->user()->campaignerProfile?->id;

        if (!$profileId || $program->campaigner_profile_id !== $profileId || $update->program_id !== $program->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_published' => 'boolean',
        ]);

        $update->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'is_published' => $validated['is_published'] ?? true,
        ]);

        return back()->with('success', 'Kabar terbaru berhasil diperbarui.');
    }

    public function destroy(Program $program, ProgramUpdate $update)
    {
        $profileId = auth()->user()->campaignerProfile?->id;

        if (!$profileId || $program->campaigner_profile_id !== $profileId || $update->program_id !== $program->id) {
            abort(403, 'Unauthorized.');
        }

        $update->delete();

        return back()->with('success', 'Kabar terbaru berhasil dihapus.');
    }
}
