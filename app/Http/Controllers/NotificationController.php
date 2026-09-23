<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display a listing of user notifications with filters and pagination.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = $user->notifications();

        // Filter status: all, unread, read
        $status = $request->input('status', 'all');
        if ($status === 'unread') {
            $query->whereNull('read_at');
        } elseif ($status === 'read') {
            $query->whereNotNull('read_at');
        }

        // Filter category
        if ($request->filled('category')) {
            $category = $request->input('category');
            $query->where('data->category', $category);
        }

        // Search in data title / message
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('data->title', 'like', "%{$search}%")
                    ->orWhere('data->message', 'like', "%{$search}%");
            });
        }

        $notifications = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($n) => [
                'id' => $n->id,
                'data' => $n->data,
                'read_at' => $n->read_at?->toISOString(),
                'created_at' => $n->created_at->diffForHumans(),
                'created_at_iso' => $n->created_at->toISOString(),
            ]);

        $stats = [
            'total' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'read' => $user->readNotifications()->count(),
        ];

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filters' => [
                'status' => $status,
                'category' => $request->input('category', ''),
                'search' => $request->input('search', ''),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Mark a specific notification as read and redirect to its target URL.
     */
    public function readAndRedirect(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        $targetUrl = $notification->data['url'] ?? route('dashboard');

        return redirect()->to($targetUrl);
    }

    /**
     * Mark a specific notification as read without redirecting away.
     */
    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }

    /**
     * Mark a specific notification as unread.
     */
    public function markAsUnread(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->update(['read_at' => null]);

        return back();
    }

    /**
     * Mark all unread notifications of the authenticated user as read.
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('success', 'Semua notifikasi telah ditandai sebagai dibaca.');
    }

    /**
     * Delete a single notification.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->delete();

        return back()->with('success', 'Notifikasi berhasil dihapus.');
    }

    /**
     * Perform bulk actions on selected notifications.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:mark_read,mark_unread,delete',
            'ids' => 'required|array',
            'ids.*' => 'string',
        ]);

        $query = $request->user()->notifications()->whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'mark_read':
                $query->update(['read_at' => now()]);
                $message = 'Notifikasi terpilih berhasil ditandai sebagai dibaca.';
                break;
            case 'mark_unread':
                $query->update(['read_at' => null]);
                $message = 'Notifikasi terpilih berhasil ditandai belum dibaca.';
                break;
            case 'delete':
                $query->delete();
                $message = 'Notifikasi terpilih berhasil dihapus.';
                break;
            default:
                $message = 'Aksi berhasil dilakukan.';
        }

        return back()->with('success', $message);
    }

    /**
     * Delete all read notifications of the authenticated user.
     */
    public function clearRead(Request $request): RedirectResponse
    {
        $request->user()->readNotifications()->delete();

        return back()->with('success', 'Semua notifikasi yang telah dibaca berhasil dibersihkan.');
    }
}
