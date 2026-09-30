<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramUpdate;
use App\Notifications\ProgramUpdateReviewedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Mews\Purifier\Facades\Purifier;

class ProgramUpdateController extends Controller
{
    /**
     * Display a listing of updates for a program.
     */
    public function index(Program $program): Response
    {
        $this->authorizeAccess($program);

        $updates = $program->updates()->latest()->paginate(10);

        return Inertia::render('Admin/Programs/Updates', [
            'program' => [
                'id' => $program->id,
                'title' => $program->title,
                'slug' => $program->slug,
                'program_code' => $program->program_code,
                'cover_image' => $program->cover_image,
                'status' => $program->status,
                'created_by' => $program->created_by,
            ],
            'updates' => $updates,
        ]);
    }

    /**
     * Store a newly created update for the program.
     */
    public function store(Request $request, Program $program): RedirectResponse
    {
        $this->authorizeCreator($program);

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

        $program->updates()->create([
            'title' => $validated['title'],
            'content' => $cleanedContent,
            'is_published' => $validated['is_published'] ?? true,
            'created_by' => auth()->id(),
        ]);

        return back()->with('success', 'Kabar terbaru berhasil ditambahkan.');
    }

    /**
     * Update the specified update in storage.
     */
    public function update(Request $request, Program $program, ProgramUpdate $update): RedirectResponse
    {
        $this->authorizeEditor($program);

        if ($update->program_id !== $program->id) {
            abort(404);
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

        $isApprovedOrPublished = $update->is_published || $update->moderation_status === 'approved';

        if ($isApprovedOrPublished) {
            $existingTitleId = $update->getTranslation('title', 'id');
            $existingContentId = Purifier::clean($update->getTranslation('content', 'id'));

            $newTitleId = $validated['title']['id'] ?? '';
            $newContentId = $cleanedContent['id'] ?? '';

            $titleChanged = trim((string) $newTitleId) !== trim((string) $existingTitleId);
            $contentChanged = trim((string) $newContentId) !== trim((string) $existingContentId);

            if ($titleChanged || $contentChanged) {
                abort(403, 'Sesuai kebijakan integritas platform, naskah utama kabar (Bahasa Indonesia) yang telah disetujui bersifat permanen dan tidak dapat diubah. Anda hanya diperkenankan menambahkan atau memperbarui terjemahan bahasa asing (EN/AR).');
            }

            $titleTranslations = $update->getTranslations('title');
            $contentTranslations = $update->getTranslations('content');

            $titleTranslations['en'] = $validated['title']['en'] ?? null;
            $titleTranslations['ar'] = $validated['title']['ar'] ?? null;
            $contentTranslations['en'] = $cleanedContent['en'] ?? null;
            $contentTranslations['ar'] = $cleanedContent['ar'] ?? null;

            $titleTranslations = array_filter($titleTranslations, fn ($v) => ! is_null($v) && $v !== '');
            $contentTranslations = array_filter($contentTranslations, fn ($v) => ! is_null($v) && $v !== '');

            $update->update([
                'title' => $titleTranslations,
                'content' => $contentTranslations,
            ]);

            return back()->with('success', 'Terjemahan kabar terbaru berhasil diperbarui.');
        }

        $update->update([
            'title' => $validated['title'],
            'content' => $cleanedContent,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        return back()->with('success', 'Kabar terbaru berhasil diperbarui.');
    }

    /**
     * Remove the specified update from storage.
     */
    public function destroy(Program $program, ProgramUpdate $update): RedirectResponse
    {
        $this->authorizeCreator($program);

        if ($update->program_id !== $program->id) {
            abort(404);
        }

        if ($update->is_published || $update->moderation_status === 'approved') {
            abort(403, 'Sesuai kebijakan integritas platform, kabar terbaru yang telah disetujui dan dipublikasikan bersifat permanen dan tidak dapat dihapus.');
        }

        $update->delete();

        return back()->with('success', 'Kabar terbaru berhasil dihapus.');
    }

    /**
     * Update the moderation status of a program update.
     */
    public function updateModeration(Request $request, Program $program, ProgramUpdate $update): RedirectResponse
    {
        if ($update->program_id !== $program->id) {
            abort(404);
        }

        abort_unless(auth()->user()->can('program.update') || auth()->user()->hasRole('Administrator'), 403);

        $validated = $request->validate([
            'moderation_status' => 'required|in:approved,rejected,pending',
            'rejection_reason' => 'required_if:moderation_status,rejected|nullable|string|max:1000',
        ]);

        $update->update([
            'moderation_status' => $validated['moderation_status'],
            'rejection_reason' => $validated['moderation_status'] === 'rejected' ? $validated['rejection_reason'] : null,
            'is_published' => $validated['moderation_status'] === 'approved',
        ]);

        if (in_array($validated['moderation_status'], ['approved', 'rejected'])) {
            $recipient = $update->creator ?? $program->creator;
            if ($recipient) {
                $recipient->notify(new ProgramUpdateReviewedNotification($program, $update));
            }
        }

        return back()->with('success', 'Status moderasi laporan kabar terbaru berhasil diperbarui.');
    }

    /**
     * Authorize that the authenticated user has permission to edit/translate updates of this program.
     */
    protected function authorizeEditor(Program $program): void
    {
        $user = auth()->user();

        if ($user->hasRole('Administrator') || $user->can('program.update')) {
            return;
        }

        if ((int) $program->created_by === (int) $user->id) {
            return;
        }

        abort(403, 'Akses Ditolak: Anda tidak memiliki wewenang untuk menyunting kabar program ini.');
    }

    /**
     * Authorize that the authenticated user has access to view updates of this program.
     */
    protected function authorizeAccess(Program $program): void
    {
        $user = auth()->user();
        if ($user->hasRole('Administrator') || $user->can('program.view')) {
            return;
        }

        if ((int) $program->created_by === (int) $user->id) {
            return;
        }

        abort(403, 'Akses Ditolak: Anda tidak memiliki wewenang untuk melihat kabar program ini.');
    }

    /**
     * Authorize that the authenticated user is the creator of this program.
     */
    protected function authorizeCreator(Program $program): void
    {
        $user = auth()->user();

        if ((int) $program->created_by !== (int) $user->id) {
            abort(403, 'Akses Ditolak: Anda hanya memiliki hak untuk mengelola kabar pada program yang Anda buat sendiri.');
        }
    }
}
