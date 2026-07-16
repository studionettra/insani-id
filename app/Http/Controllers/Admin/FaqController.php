<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        $faqs = \App\Models\Faq::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('question', 'like', "%{$search}%");
            })
            ->orderBy('sort_order')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/Faqs/Index', [
            'faqs' => $faqs,
            'filters' => request()->only(['search']),
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
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        \App\Models\Faq::create($validated);

        return redirect()->back()->with('success', 'FAQ berhasil dibuat.');
    }

    public function update(Request $request, \App\Models\Faq $faq)
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
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $faq->update($validated);

        return redirect()->back()->with('success', 'FAQ berhasil diperbarui.');
    }

    public function destroy(\App\Models\Faq $faq)
    {
        $faq->delete();

        return redirect()->back()->with('success', 'FAQ berhasil dihapus.');
    }
}
