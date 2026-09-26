<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PopupMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class PopupMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PopupMessage::query()
            ->when($request->input('search'), function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title->id', 'like', "%{$search}%")
                        ->orWhere('title->en', 'like', "%{$search}%")
                        ->orWhere('title->ar', 'like', "%{$search}%")
                        ->orWhere('content->id', 'like', "%{$search}%")
                        ->orWhere('content->en', 'like', "%{$search}%")
                        ->orWhere('content->ar', 'like', "%{$search}%");
                });
            })
            ->when($request->input('status'), function ($q, $status) {
                if ($status === 'active') {
                    $q->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $q->where('is_active', false);
                }
            })
            ->latest('id');

        $popups = $query->paginate(10)->withQueryString();

        return inertia('Admin/PopupMessages/Index', [
            'popups' => $popups,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'display_type' => 'required|in:image_only,hybrid',
            'image_path' => 'nullable|image|max:5120',
            'cta_url' => 'nullable|string|max:500',
            'open_in_new_tab' => 'boolean',
            'delay_seconds' => 'integer|min:0|max:60',
            'auto_close_seconds' => 'integer|min:0|max:120',
            'frequency' => 'required|in:once_per_day,once_per_session,always',
            'target_page' => 'required|in:all,home_only',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'is_active' => 'boolean',
        ];

        if (is_array($request->input('title'))) {
            $rules['title'] = 'required|array';
            $rules['title.id'] = 'required|string|max:255';
            $rules['title.en'] = 'nullable|string|max:255';
            $rules['title.ar'] = 'nullable|string|max:255';
        } else {
            $rules['title'] = 'required|string|max:255';
        }

        if (is_array($request->input('content'))) {
            $rules['content'] = 'nullable|array';
            $rules['content.id'] = 'nullable|string';
            $rules['content.en'] = 'nullable|string';
            $rules['content.ar'] = 'nullable|string';
        } else {
            $rules['content'] = 'nullable|string';
        }

        if (is_array($request->input('cta_text'))) {
            $rules['cta_text'] = 'nullable|array';
            $rules['cta_text.id'] = 'nullable|string|max:100';
            $rules['cta_text.en'] = 'nullable|string|max:100';
            $rules['cta_text.ar'] = 'nullable|string|max:100';
        } else {
            $rules['cta_text'] = 'nullable|string|max:100';
        }

        $validated = $request->validate($rules, [
            'title.id.required' => 'Judul pop-up dalam Bahasa Indonesia wajib diisi.',
        ]);

        if (is_string($validated['title'])) {
            $validated['title'] = ['id' => $validated['title']];
        }

        if (isset($validated['content']) && is_string($validated['content'])) {
            $validated['content'] = ['id' => $validated['content']];
        }

        if (isset($validated['cta_text']) && is_string($validated['cta_text'])) {
            $validated['cta_text'] = ['id' => $validated['cta_text']];
        }

        if ($request->hasFile('image_path')) {
            $validated['image_path'] = $request->file('image_path')->store('popups', 'public');
        }

        $validated['open_in_new_tab'] = $request->boolean('open_in_new_tab');
        $validated['is_active'] = $request->has('is_active') ? $request->boolean('is_active') : true;
        $validated['delay_seconds'] = $request->input('delay_seconds', 2);
        $validated['auto_close_seconds'] = $request->input('auto_close_seconds', 0);

        PopupMessage::create($validated);

        Cache::forget('active_event_popup');

        return redirect()->back()->with('success', 'Pesan pop-up berhasil ditambahkan.');
    }

    public function update(Request $request, PopupMessage $popup_message): RedirectResponse
    {
        $rules = [
            'display_type' => 'required|in:image_only,hybrid',
            'image_path' => 'nullable|image|max:5120',
            'cta_url' => 'nullable|string|max:500',
            'open_in_new_tab' => 'boolean',
            'delay_seconds' => 'integer|min:0|max:60',
            'auto_close_seconds' => 'integer|min:0|max:120',
            'frequency' => 'required|in:once_per_day,once_per_session,always',
            'target_page' => 'required|in:all,home_only',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'is_active' => 'boolean',
        ];

        if (is_array($request->input('title'))) {
            $rules['title'] = 'required|array';
            $rules['title.id'] = 'required|string|max:255';
            $rules['title.en'] = 'nullable|string|max:255';
            $rules['title.ar'] = 'nullable|string|max:255';
        } else {
            $rules['title'] = 'required|string|max:255';
        }

        if (is_array($request->input('content'))) {
            $rules['content'] = 'nullable|array';
            $rules['content.id'] = 'nullable|string';
            $rules['content.en'] = 'nullable|string';
            $rules['content.ar'] = 'nullable|string';
        } else {
            $rules['content'] = 'nullable|string';
        }

        if (is_array($request->input('cta_text'))) {
            $rules['cta_text'] = 'nullable|array';
            $rules['cta_text.id'] = 'nullable|string|max:100';
            $rules['cta_text.en'] = 'nullable|string|max:100';
            $rules['cta_text.ar'] = 'nullable|string|max:100';
        } else {
            $rules['cta_text'] = 'nullable|string|max:100';
        }

        $validated = $request->validate($rules, [
            'title.id.required' => 'Judul pop-up dalam Bahasa Indonesia wajib diisi.',
        ]);

        if (is_string($validated['title'])) {
            $validated['title'] = ['id' => $validated['title']];
        }

        if (isset($validated['content']) && is_string($validated['content'])) {
            $validated['content'] = ['id' => $validated['content']];
        }

        if (isset($validated['cta_text']) && is_string($validated['cta_text'])) {
            $validated['cta_text'] = ['id' => $validated['cta_text']];
        }

        if ($request->hasFile('image_path')) {
            if ($popup_message->image_path && Storage::disk('public')->exists($popup_message->image_path)) {
                Storage::disk('public')->delete($popup_message->image_path);
            }
            $validated['image_path'] = $request->file('image_path')->store('popups', 'public');
        } else {
            unset($validated['image_path']);
        }

        $validated['open_in_new_tab'] = $request->boolean('open_in_new_tab');
        $validated['is_active'] = $request->boolean('is_active');

        $popup_message->update($validated);

        Cache::forget('active_event_popup');

        return redirect()->back()->with('success', 'Pesan pop-up berhasil diperbarui.');
    }

    public function destroy(PopupMessage $popup_message): RedirectResponse
    {
        if ($popup_message->image_path && Storage::disk('public')->exists($popup_message->image_path)) {
            Storage::disk('public')->delete($popup_message->image_path);
        }

        $popup_message->delete();

        Cache::forget('active_event_popup');

        return redirect()->back()->with('success', 'Pesan pop-up berhasil dihapus.');
    }

    public function toggleActive(PopupMessage $popup_message): RedirectResponse
    {
        $popup_message->update([
            'is_active' => ! $popup_message->is_active,
        ]);

        Cache::forget('active_event_popup');

        $status = $popup_message->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Status pop-up berhasil {$status}.");
    }
}
