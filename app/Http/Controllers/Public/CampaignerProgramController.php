<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CampaignerProgramController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $programs = Program::with('category')
            ->where('created_by', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Public/Akun/Program/Index', [
            'programs' => $programs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Public/Akun/Program/Create', [
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

        $campaignerProfile = auth()->user()->campaignerProfile;

        $program = new Program;
        $program->program_code = 'PRG-'.date('Ymd').'-'.strtoupper(Str::random(4));
        $program->title = $request->title;
        $program->story = $request->story;
        $program->slug = Str::slug($request->title).'-'.Str::random(4);
        $program->category_id = $request->category_id;
        $program->campaigner_type = $campaignerProfile->type;
        $program->campaigner_profile_id = $campaignerProfile->id;
        $program->created_by = auth()->id();
        $program->target_amount = $request->target_amount;
        $program->deadline = $request->deadline;
        $program->cover_image = $coverImagePath;
        $program->video_url = $request->video_url;

        // Eksternal program goes to pending_verification
        $program->status = 'pending_verification';
        $program->save();

        return redirect()->route('akun.programs.index')->with('success', 'Program berhasil diajukan dan sedang menunggu verifikasi tim kami.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $program = Program::where('created_by', auth()->id())
            ->with('category')
            ->findOrFail($id);

        return Inertia::render('Public/Akun/Program/Show', [
            'program' => $program,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $program = Program::where('created_by', auth()->id())->findOrFail($id);

        // Only allow edit if draft or rejected
        if (! in_array($program->status, ['draft', 'rejected'])) {
            return redirect()->route('akun.programs.index')->with('error', 'Hanya program berstatus draft atau ditolak yang dapat diedit.');
        }

        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Public/Akun/Program/Edit', [
            'program' => $program,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $program = Program::where('created_by', auth()->id())->findOrFail($id);

        if (! in_array($program->status, ['draft', 'rejected'])) {
            return redirect()->route('akun.programs.index')->with('error', 'Hanya program berstatus draft atau ditolak yang dapat diedit.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'target_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date',
            'story' => 'required|string',
            'cover_image' => 'nullable|image|max:2048',
            'video_url' => 'nullable|url',
        ]);

        $program->setTranslation('title', 'id', $request->title);
        $program->setTranslation('story', 'id', $request->story);
        $program->category_id = $request->category_id;
        $program->target_amount = $request->target_amount;
        $program->deadline = $request->deadline;
        $program->video_url = $request->video_url;

        if ($request->hasFile('cover_image')) {
            $coverImagePath = $request->file('cover_image')->store('programs/covers', 'public');
            $program->cover_image = $coverImagePath;
        }

        // Change status back to pending_verification after edit
        $program->status = 'pending_verification';
        $program->save();

        return redirect()->route('akun.programs.index')->with('success', 'Program berhasil diperbarui dan diajukan ulang untuk verifikasi.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Cancel/Delete program is typically allowed if it's not yet published or has no donations
        $program = Program::where('created_by', auth()->id())->findOrFail($id);

        if ($program->status === 'published') {
            return redirect()->route('akun.programs.index')->with('error', 'Program yang sudah aktif tidak dapat dihapus.');
        }

        $program->delete();

        return redirect()->route('akun.programs.index')->with('success', 'Program berhasil dibatalkan/dihapus.');
    }
}
