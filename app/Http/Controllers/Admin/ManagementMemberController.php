<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ManagementMemberController extends Controller
{
    public function index()
    {
        $members = \App\Models\ManagementMember::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            })
            ->orderBy('sort_order')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/Management/Index', [
            'members' => $members,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|array',
            'position.id' => 'required|string|max:255',
            'position.en' => 'nullable|string|max:255',
            'position.ar' => 'nullable|string|max:255',
            'image_url' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('image_url')) {
            $validated['image_url'] = $request->file('image_url')->store('management', 'public');
        }

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        \App\Models\ManagementMember::create($validated);

        return redirect()->back()->with('success', 'Anggota Manajemen berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\ManagementMember $management_member)
    {
        // Parameter binding for resource route uses the snake_case of the model name by default 
        // if not explicitly defined in routes/web.php
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|array',
            'position.id' => 'required|string|max:255',
            'position.en' => 'nullable|string|max:255',
            'position.ar' => 'nullable|string|max:255',
            'image_url' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('image_url')) {
            if ($management_member->image_url) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($management_member->image_url);
            }
            $validated['image_url'] = $request->file('image_url')->store('management', 'public');
        }

        $management_member->update($validated);

        return redirect()->back()->with('success', 'Anggota Manajemen berhasil diperbarui.');
    }

    public function destroy(\App\Models\ManagementMember $management_member)
    {
        if ($management_member->image_url) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($management_member->image_url);
        }
        $management_member->delete();

        return redirect()->back()->with('success', 'Anggota Manajemen berhasil dihapus.');
    }
}
