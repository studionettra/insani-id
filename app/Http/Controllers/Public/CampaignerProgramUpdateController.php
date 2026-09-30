<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramUpdate;
use App\Models\User;
use App\Notifications\ProgramUpdateSubmittedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Mews\Purifier\Facades\Purifier;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

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

        $update = $program->updates()->create([
            'program_id' => $program->id,
            'disbursement_id' => $disbursementId,
            'title' => $validated['title'],
            'content' => $cleanedContent,
            'is_published' => false,
            'moderation_status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        $recipients = collect();
        if (Permission::where('name', 'program.update')->exists()) {
            $recipients = rescue(fn () => User::permission('program.update')->get(), collect(), false);
        }

        if ($recipients->isEmpty()) {
            $existingRoles = Role::whereIn('name', ['Administrator', 'Program Officer'])->pluck('name')->toArray();
            if (! empty($existingRoles)) {
                $recipients = rescue(fn () => User::role($existingRoles)->get(), collect(), false);
            }
        }

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients->unique('id'), new ProgramUpdateSubmittedNotification($program, $update));
        }

        return back()->with('success', 'Kabar terbaru berhasil ditambahkan dan sedang menunggu peninjauan admin.');
    }

    public function update(Request $request, Program $program, ProgramUpdate $update)
    {
        abort(403, 'Sesuai kebijakan integritas platform, kabar terbaru yang telah dikirim bersifat permanen dan tidak dapat diubah maupun dihapus.');
    }

    public function destroy(Program $program, ProgramUpdate $update)
    {
        abort(403, 'Sesuai kebijakan integritas platform, kabar terbaru yang telah dikirim bersifat permanen dan tidak dapat diubah maupun dihapus.');
    }
}
