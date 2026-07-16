<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramListingController extends Controller
{
    public function index(Request $request)
    {
        $categoryId = $request->query('category');
        $search = $request->query('search');
        $sort = $request->query('sort', 'terbaru');

        $query = Program::with('category')
            ->where('status', 'published');

        if ($sort === 'terlama') {
            $query->orderBy('published_at', 'asc');
        } elseif ($sort === 'terbanyak') {
            $query->orderBy('collected_amount', 'desc');
        } else {
            $query->orderBy('published_at', 'desc');
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        $programs = $query->paginate(12)->withQueryString();
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Public/Program/Listing', [
            'programs' => $programs,
            'categories' => $categories,
            'filters' => [
                'category' => $categoryId,
                'search' => $search,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(string $slug)
    {
        $program = Program::with([
                'category', 
                'creator', 
                'campaignerProfile',
                'updates' => function ($query) {
                    $query->where('is_published', true)->latest();
                },
                'comments' => function ($query) {
                    $query->where('is_hidden', false)->latest();
                }
            ])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return Inertia::render('Public/Program/Show', [
            'program' => $program,
        ]);
    }
}
