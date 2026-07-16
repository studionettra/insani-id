<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentModerationController extends Controller
{
    public function index(Request $request)
    {
        $query = Comment::with(['program:id,title', 'donation:id,donation_code', 'user:id,name'])->latest();

        if ($request->has('is_hidden') && $request->is_hidden !== 'all') {
            $query->where('is_hidden', $request->boolean('is_hidden'));
        }

        $comments = $query->paginate(15)->withQueryString();

        return inertia('Admin/Comments/Index', [
            'comments' => $comments,
            'filters' => $request->only(['is_hidden']),
        ]);
    }

    public function toggleHidden(Comment $comment)
    {
        $comment->update([
            'is_hidden' => !$comment->is_hidden,
        ]);

        $status = $comment->is_hidden ? 'disembunyikan' : 'ditampilkan';
        return back()->with('success', "Komentar berhasil $status.");
    }
}
