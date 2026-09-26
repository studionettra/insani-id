<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LegalDocumentController extends Controller
{
    public function index(): Response
    {
        $documents = LegalDocument::query()
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title->id', 'like', "%{$search}%")
                        ->orWhere('title->en', 'like', "%{$search}%")
                        ->orWhere('title->ar', 'like', "%{$search}%")
                        ->orWhere('document_number', 'like', "%{$search}%")
                        ->orWhere('issuer_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/LegalDocuments/Index', [
            'documents' => $documents,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        if (is_string($request->input('title'))) {
            $request->merge(['title' => ['id' => $request->input('title')]]);
        }
        if (is_string($request->input('description'))) {
            $request->merge(['description' => ['id' => $request->input('description')]]);
        }

        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'document_number' => 'nullable|string|max:255',
            'issuer_name' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'external_url' => 'nullable|url|max:500',
            'icon_type' => 'nullable|string|in:scale,shield,building,map-pin,award,file-text',
            'publisher_logo' => 'nullable|string|max:255',
            'publisher_logo_file' => 'nullable|image|max:2048',
            'description' => 'nullable|array',
            'description.id' => 'nullable|string|max:1000',
            'description.en' => 'nullable|string|max:1000',
            'description.ar' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ], [
            'title.id.required' => 'Nama dokumen dalam Bahasa Indonesia wajib diisi.',
        ]);

        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store('legal-documents', 'public');
        }

        if ($request->hasFile('publisher_logo_file')) {
            $logoPath = $request->file('publisher_logo_file')->store('legal-documents/logos', 'public');
            $validated['publisher_logo'] = Storage::disk('public')->url($logoPath);
        }

        unset($validated['file'], $validated['publisher_logo_file']);

        $validated['icon_type'] = $validated['icon_type'] ?? 'file-text';
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        LegalDocument::create($validated);

        return redirect()->back()->with('success', 'Dokumen legalitas berhasil ditambahkan.');
    }

    public function update(Request $request, LegalDocument $legal_document)
    {
        if (is_string($request->input('title'))) {
            $request->merge(['title' => ['id' => $request->input('title')]]);
        }
        if (is_string($request->input('description'))) {
            $request->merge(['description' => ['id' => $request->input('description')]]);
        }

        $validated = $request->validate([
            'title' => 'required|array',
            'title.id' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'title.ar' => 'nullable|string|max:255',
            'document_number' => 'nullable|string|max:255',
            'issuer_name' => 'nullable|string|max:255',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'external_url' => 'nullable|url|max:500',
            'icon_type' => 'nullable|string|in:scale,shield,building,map-pin,award,file-text',
            'publisher_logo' => 'nullable|string|max:255',
            'publisher_logo_file' => 'nullable|image|max:2048',
            'description' => 'nullable|array',
            'description.id' => 'nullable|string|max:1000',
            'description.en' => 'nullable|string|max:1000',
            'description.ar' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ], [
            'title.id.required' => 'Nama dokumen dalam Bahasa Indonesia wajib diisi.',
        ]);

        if ($request->hasFile('file')) {
            if ($legal_document->file_path && Storage::disk('public')->exists($legal_document->file_path)) {
                Storage::disk('public')->delete($legal_document->file_path);
            }
            $validated['file_path'] = $request->file('file')->store('legal-documents', 'public');
        }

        if ($request->hasFile('publisher_logo_file')) {
            $logoPath = $request->file('publisher_logo_file')->store('legal-documents/logos', 'public');
            $validated['publisher_logo'] = Storage::disk('public')->url($logoPath);
        }

        unset($validated['file'], $validated['publisher_logo_file']);

        $legal_document->update($validated);

        return redirect()->back()->with('success', 'Dokumen legalitas berhasil diperbarui.');
    }

    public function destroy(LegalDocument $legal_document)
    {
        if ($legal_document->file_path && Storage::disk('public')->exists($legal_document->file_path)) {
            Storage::disk('public')->delete($legal_document->file_path);
        }

        $legal_document->delete();

        return redirect()->back()->with('success', 'Dokumen legalitas berhasil dihapus.');
    }
}
