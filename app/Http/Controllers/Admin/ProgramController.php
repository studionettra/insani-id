<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->input('status', 'semua');
        $query = Program::with(['category', 'creator', 'campaignerProfile'])->orderBy('created_at', 'desc');

        if ($status !== 'semua') {
            $query->where('status', $status);
        }

        $programs = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Programs/Index', [
            'programs' => $programs,
            'filters' => ['status' => $status],
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
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'target_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date|after:today',
            'story' => 'required|string',
            'cover_image' => 'required|image|max:2048',
            'video_url' => 'nullable|url',
        ]);

        $coverImagePath = $request->file('cover_image')->store('programs/covers', 'public');

        $program = new Program;
        $program->program_code = 'PRG-'.date('Ymd').'-'.strtoupper(Str::random(4));
        $program->title = $request->title;
        $program->story = $request->story;
        $program->slug = Str::slug($request->title).'-'.Str::random(4);
        $program->category_id = $request->category_id;
        $program->campaigner_type = 'internal';
        $program->created_by = auth()->id();
        $program->target_amount = $request->target_amount;
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
        $program = Program::with(['category', 'creator', 'campaignerProfile', 'galleries', 'documents'])->findOrFail($id);

        return Inertia::render('Admin/Programs/Show', [
            'program' => $program,
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
            'program' => $program,
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
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'target_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date',
            'story' => 'required|string',
            'cover_image' => 'nullable|image|max:2048',
            'video_url' => 'nullable|url',
        ]);

        $program->title = $request->title;
        $program->story = $request->story;
        $program->category_id = $request->category_id;
        $program->target_amount = $request->target_amount;
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
            // Regex to detect common bank account numbers in Indonesia (simple version)
            // Look for sequences of 10 to 16 digits, ignoring spaces or dashes
            $story = preg_replace('/[\s\-]/', '', $program->story);
            if (preg_match('/\d{10,16}/', $story)) {
                return redirect()->back()->withErrors([
                    'status' => 'Peringatan: Terdeteksi kemungkinan nomor rekening di dalam deskripsi program. Harap periksa kembali sebelum mempublikasikan.'
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

        return redirect()->back()->with('success', 'Status program berhasil diperbarui.');
    }
}
