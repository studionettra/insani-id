<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramUpdate;
use Illuminate\Http\Request;
use Mews\Purifier\Facades\Purifier;

class CampaignerProgramUpdateController extends Controller
{
    public function index(Program $program)
    {
        $profileId = auth()->user()->campaignerProfile?->id;

        if (! $profileId || $program->campaigner_profile_id !== $profileId) {
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

        if (! $profileId || $program->campaigner_profile_id !== $profileId) {
            abort(403, 'Unauthorized.');
        }

        if (is_string($request->input('title'))) {
            $request->merge(['title' => ['id' => $request->input('title')]]);
        }
        if (is_string($request->input('content'))) {
            $request->merge(['content' => ['id' => $request->input('content')]]);
        }

        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'content' => 'required|array',
            'content.id' => 'required|string',
            'content.en' => 'nullable|string',
            'content.ar' => 'nullable|string',
            'is_published' => 'boolean',
        ], [
            'title.id.required' => 'Judul kabar dalam Bahasa Indonesia wajib diisi.',
            'content.id.required' => 'Isi kabar dalam Bahasa Indonesia wajib diisi.',
        ]);

        $cleanedContent = [];
        foreach ($validated['content'] as $locale => $text) {
            if (! empty($text)) {
                $cleanedContent[$locale] = Purifier::clean($text);
            }
        }

        $disbursementId = $request->input('disbursement_id');
        if (! $disbursementId) {
            $latestUnlinkedDisbursement = $program->disbursements()
                ->where('status', 'transferred')
                ->whereDoesntHave('programUpdate')
                ->latest('transferred_at')
                ->first();
            $disbursementId = $latestUnlinkedDisbursement?->id;
        }

        $program->updates()->create([
            'program_id' => $program->id,
            'disbursement_id' => $disbursementId,
            'title' => $validated['title'],
            'content' => $cleanedContent,
            'is_published' => false,
            'moderation_status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Kabar terbaru berhasil ditambahkan dan sedang menunggu peninjauan admin.');
    }

    public function update(Request $request, Program $program, ProgramUpdate $update)
    {
        $profileId = auth()->user()->campaignerProfile?->id;

        if (! $profileId || $program->campaigner_profile_id !== $profileId || $update->program_id !== $program->id) {
            abort(403, 'Unauthorized.');
        }

        if (is_string($request->input('title'))) {
            $request->merge(['title' => ['id' => $request->input('title')]]);
        }
        if (is_string($request->input('content'))) {
            $request->merge(['content' => ['id' => $request->input('content')]]);
        }

        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'content' => 'required|array',
            'content.id' => 'required|string',
            'content.en' => 'nullable|string',
            'content.ar' => 'nullable|string',
            'is_published' => 'boolean',
        ], [
            'title.id.required' => 'Judul kabar dalam Bahasa Indonesia wajib diisi.',
            'content.id.required' => 'Isi kabar dalam Bahasa Indonesia wajib diisi.',
        ]);

        $cleanedContent = [];
        foreach ($validated['content'] as $locale => $text) {
            if (! empty($text)) {
                $cleanedContent[$locale] = Purifier::clean($text);
            }
        }

        $update->update([
            'title' => $validated['title'],
            'content' => $cleanedContent,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        return back()->with('success', 'Kabar terbaru berhasil diperbarui.');
    }

    public function destroy(Program $program, ProgramUpdate $update)
    {
        $profileId = auth()->user()->campaignerProfile?->id;

        if (! $profileId || $program->campaigner_profile_id !== $profileId || $update->program_id !== $program->id) {
            abort(403, 'Unauthorized.');
        }

        $update->delete();

        return back()->with('success', 'Kabar terbaru berhasil dihapus.');
    }
}
