<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Program;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, Program $program)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        Comment::create([
            'program_id' => $program->id,
            'user_id' => auth()->id(),
            'name' => auth()->user()->name,
            'body' => $validated['body'],
            'is_hidden' => false,
        ]);

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }
}
