<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        $faqs = Faq::query()
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('question', 'like', "%{$search}%")
                        ->orWhere('keywords', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->when(request('category'), function ($query, $category) {
                $query->where('category', $category);
            })
            ->orderBy('sort_order')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('Admin/Faqs/Index', [
            'faqs' => $faqs,
            'filters' => request()->only(['search', 'category']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|array',
            'question.id' => 'required|string',
            'question.en' => 'nullable|string',
            'question.ar' => 'nullable|string',
            'answer_html' => 'required|array',
            'answer_html.id' => 'required|string',
            'answer_html.en' => 'nullable|string',
            'answer_html.ar' => 'nullable|string',
            'category' => 'required|string|max:50',
            'keywords' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['category'] = $validated['category'] ?? 'umum';

        Faq::create($validated);

        return redirect()->back()->with('success', 'FAQ berhasil dibuat.');
    }

    public function update(Request $request, Faq $faq)
    {
        $validated = $request->validate([
            'question' => 'required|array',
            'question.id' => 'required|string',
            'question.en' => 'nullable|string',
            'question.ar' => 'nullable|string',
            'answer_html' => 'required|array',
            'answer_html.id' => 'required|string',
            'answer_html.en' => 'nullable|string',
            'answer_html.ar' => 'nullable|string',
            'category' => 'required|string|max:50',
            'keywords' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $faq->update($validated);

        return redirect()->back()->with('success', 'FAQ berhasil diperbarui.');
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return redirect()->back()->with('success', 'FAQ berhasil dihapus.');
    }
}
