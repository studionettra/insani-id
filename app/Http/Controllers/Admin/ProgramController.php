<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\TranslateProgramJob;
use App\Models\Category;
use App\Models\Program;
use App\Notifications\ProgramStatusUpdatedNotification;
use App\Services\TranslationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Mews\Purifier\Facades\Purifier;

class ProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $type = $request->input('type', 'semua');
        $status = $request->input('status', 'semua');
        $search = $request->input('search');
        $categoryId = $request->input('category_id');

        $query = Program::with(['category', 'creator', 'campaignerProfile'])->orderBy('created_at', 'desc');

        if ($type !== 'semua') {
            $query->where('campaigner_type', $type);
        }

        if ($status !== 'semua') {
            $query->where('status', $status);
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('program_code', 'like', "%{$search}%")
                    ->orWhere('title->id', 'like', "%{$search}%")
                    ->orWhere('title->en', 'like', "%{$search}%")
                    ->orWhereHas('creator', function ($creatorQuery) use ($search) {
                        $creatorQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('campaignerProfile', function ($profileQuery) use ($search) {
                        $profileQuery->where('nama_lembaga', 'like', "%{$search}%");
                    });
            });
        }

        $programs = $query->paginate(10)->withQueryString();

        $counts = [
            'all' => Program::count(),
            'internal' => Program::where('campaigner_type', 'internal')->count(),
            'lembaga' => Program::where('campaigner_type', 'lembaga')->count(),
            'individu' => Program::where('campaigner_type', 'individu')->count(),
            'pending_verification' => Program::where('status', 'pending_verification')->count(),
            'pending_in_tab' => $type !== 'semua'
                ? Program::where('campaigner_type', $type)->where('status', 'pending_verification')->count()
                : Program::where('status', 'pending_verification')->count(),
        ];

        $categories = Category::where('is_active', true)->select('id', 'name')->get();

        return Inertia::render('Admin/Programs/Index', [
            'programs' => $programs,
            'filters' => [
                'type' => $type,
                'status' => $status,
                'search' => $search,
                'category_id' => $categoryId ? (string) $categoryId : null,
            ],
            'counts' => $counts,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Admin/Programs/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'category_id' => 'required|exists:categories,id',
            'target_amount' => 'nullable|numeric|min:0',
            'is_continuous' => 'nullable|boolean',
            'deadline' => 'nullable|date|after:today',
            'story' => 'required',
            'cover_image' => 'required|image|max:2048',
            'video_url' => 'nullable|url',
        ]);

        $translationService = app(TranslationService::class);
        $titleInput = $request->title;
        $storyInput = $request->story;

        $titleTranslations = is_array($titleInput)
            ? $titleInput
            : ($translationService->translateFields(['title' => (string) $titleInput])['title'] ?? ['id' => (string) $titleInput]);

        $storyTranslations = is_array($storyInput)
            ? $storyInput
            : ($translationService->translateFields(['story' => (string) $storyInput], ['en', 'ar'], 'id', ['story'])['story'] ?? ['id' => (string) $storyInput]);

        foreach ($storyTranslations as $lang => $content) {
            $storyTranslations[$lang] = Purifier::clean($content);
        }

        $primaryTitle = is_array($titleInput) ? ($titleInput['id'] ?? reset($titleInput)) : (string) $titleInput;

        $coverImagePath = $request->file('cover_image')->store('programs/covers', 'public');

        $program = new Program;
        $program->program_code = 'PRG-'.date('Ymd').'-'.strtoupper(Str::random(4));
        $program->title = $titleTranslations;
        $program->story = $storyTranslations;
        $program->slug = Str::slug($primaryTitle).'-'.Str::random(4);
        $program->category_id = $request->category_id;
        $program->campaigner_type = 'internal';
        $program->created_by = auth()->id();
        $isContinuous = $request->boolean('is_continuous');
        $program->target_amount = $isContinuous ? null : $request->target_amount;
        $program->is_continuous = $isContinuous;
        $program->deadline = $request->deadline;
        $program->cover_image = $coverImagePath;
        $program->video_url = $request->video_url;

        // Internal programs go straight to published
        $program->status = 'published';
        $program->published_at = now();
        $program->save();

        return redirect()->route('admin.programs.index')->with('success', 'Program berhasil dibuat dan dipublikasikan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $program = Program::with(['category', 'creator', 'campaignerProfile', 'galleries', 'documents', 'updates' => fn ($q) => $q->latest()])->findOrFail($id);

        return Inertia::render('Admin/Programs/Show', [
            'program' => array_merge($program->toArray(), [
                'title_translations' => $program->getTranslations('title'),
                'story_translations' => $program->getTranslations('story'),
            ]),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $program = Program::findOrFail($id);
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Admin/Programs/Edit', [
            'program' => array_merge($program->toArray(), [
                'title_translations' => $program->getTranslations('title'),
                'story_translations' => $program->getTranslations('story'),
            ]),
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $program = Program::findOrFail($id);

        $request->validate([
            'title' => 'required',
            'category_id' => 'required|exists:categories,id',
            'target_amount' => 'nullable|numeric|min:0',
            'is_continuous' => 'nullable|boolean',
            'deadline' => 'nullable|date',
            'story' => 'required',
            'cover_image' => 'nullable|image|max:2048',
            'video_url' => 'nullable|url',
        ]);

        $translationService = app(TranslationService::class);
        $titleInput = $request->title;
        $storyInput = $request->story;

        $titleTranslations = is_array($titleInput)
            ? $titleInput
            : ($translationService->translateFields(['title' => (string) $titleInput])['title'] ?? ['id' => (string) $titleInput]);

        $storyTranslations = is_array($storyInput)
            ? $storyInput
            : ($translationService->translateFields(['story' => (string) $storyInput], ['en', 'ar'], 'id', ['story'])['story'] ?? ['id' => (string) $storyInput]);

        foreach ($storyTranslations as $lang => $content) {
            $storyTranslations[$lang] = Purifier::clean($content);
        }

        $program->title = $titleTranslations;
        $program->story = $storyTranslations;
        $program->category_id = $request->category_id;
        $isContinuous = $request->boolean('is_continuous');
        $program->target_amount = $isContinuous ? null : $request->target_amount;
        $program->is_continuous = $isContinuous;
        $program->deadline = $request->deadline;
        $program->video_url = $request->video_url;

        if ($request->hasFile('cover_image')) {
            $coverImagePath = $request->file('cover_image')->store('programs/covers', 'public');
            $program->cover_image = $coverImagePath;
        }

        $program->save();

        return redirect()->route('admin.programs.index')->with('success', 'Program berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $program = Program::findOrFail($id);
        $program->delete();

        return redirect()->route('admin.programs.index')->with('success', 'Program berhasil dihapus.');
    }

    /**
     * Update the status of the program (Approve, Reject, Close)
     */
    public function updateStatus(Request $request, string $id)
    {
        $program = Program::findOrFail($id);

        $request->validate([
            'status' => 'required|in:published,rejected,closed_manual',
            'rejection_notes' => 'required_if:status,rejected',
        ]);

        if ($request->status === 'published') {
            // Regex to detect common bank account numbers in Indonesia
            // Look for sequences of 10 to 16 digits, ignoring spaces or dashes
            $rawStory = is_array($program->story) ? implode(' ', $program->story) : (string) $program->story;
            $story = preg_replace('/[\s\-]/', '', strip_tags($rawStory));
            if (preg_match('/\d{10,16}/', $story)) {
                return redirect()->back()->withErrors([
                    'status' => 'Peringatan: Terdeteksi kemungkinan nomor rekening di dalam deskripsi program. Harap periksa kembali sebelum mempublikasikan.',
                ]);
            }

            $program->status = 'published';
            $program->published_at = now();
            $program->verified_by = auth()->id();
        } elseif ($request->status === 'rejected') {
            $program->status = 'rejected';
            $program->rejection_notes = $request->rejection_notes;
            $program->verified_by = auth()->id();
        } elseif ($request->status === 'closed_manual') {
            $program->status = 'closed_manual';
            $program->closed_at = now();
        }

        $program->save();

        if ($request->status === 'published') {
            TranslateProgramJob::dispatch($program);
        }

        if ($program->creator) {
            rescue(fn () => $program->creator->notify(
                new ProgramStatusUpdatedNotification($program, $request->status, $request->rejection_notes)
            ));
        }

        return redirect()->back()->with('success', 'Status program berhasil diperbarui.');
    }

    /**
     * Trigger auto-translation for a program.
     */
    public function translate(string $id)
    {
        $program = Program::findOrFail($id);

        TranslateProgramJob::dispatch($program, true);

        return redirect()->back()->with('success', 'Penerjemahan program ke Bahasa Inggris dan Arab telah dimasukkan ke dalam antrean.');
    }
}
