<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function index()
    {
        $messages = \App\Models\ContactMessage::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/ContactMessages/Index', [
            'messages' => $messages,
            'filters' => request()->only(['search']),
        ]);
    }

    public function show(\App\Models\ContactMessage $contact_message)
    {
        if (!$contact_message->is_read) {
            $contact_message->update([
                'is_read' => true,
                'read_at' => now(),
                'read_by' => auth()->id(),
            ]);
        }

        return inertia('Admin/ContactMessages/Show', [
            'message' => $contact_message,
        ]);
    }

    public function destroy(\App\Models\ContactMessage $contact_message)
    {
        $contact_message->delete();

        return redirect()->route('admin.contact_messages.index')->with('success', 'Pesan berhasil dihapus.');
    }
}
