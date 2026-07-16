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
            'name' => 'required|string|max:255',
            'body' => 'required|string|max:1000',
        ]);

        $comment = new Comment([
            'program_id' => $program->id,
            'name' => $validated['name'],
            'body' => $validated['body'],
            'is_hidden' => false,
        ]);

        if (auth()->check()) {
            $comment->user_id = auth()->id();
            // If logged in user name differs, we still save the guest name they typed, or use auth name.
            // Let's just use what they typed.
        }

        $comment->save();

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }
}
