<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProgramReport;
use App\Models\ProgramReportCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgramReportController extends Controller
{
    public function index(Request $request)
    {
        $statusCounts = [
            'total' => ProgramReport::count(),
            'pending' => ProgramReport::where('status', 'pending')->count(),
            'investigating' => ProgramReport::where('status', 'investigating')->count(),
            'resolved' => ProgramReport::where('status', 'resolved')->count(),
            'dismissed' => ProgramReport::where('status', 'dismissed')->count(),
        ];

        // Identify programs with multiple unresolved reports (High-Risk alert)
        $highRiskPrograms = ProgramReport::select('program_id', DB::raw('count(*) as active_reports_count'))
            ->whereIn('status', ['pending', 'investigating'])
            ->groupBy('program_id')
            ->having('active_reports_count', '>=', 2)
            ->with('program:id,title,slug,status')
            ->get();

        $query = ProgramReport::query()
            ->with([
                'program:id,title,slug,status,cover_image,target_amount,collected_amount',
                'category:id,name,slug',
                'reviewer:id,name',
            ])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ticket_number', 'like', "%{$search}%")
                        ->orWhere('reporter_name', 'like', "%{$search}%")
                        ->orWhere('reporter_phone', 'like', "%{$search}%")
                        ->orWhere('reporter_email', 'like', "%{$search}%")
                        ->orWhereHas('program', function ($pq) use ($search) {
                            $pq->where('title', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->status && $request->status !== 'all', function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->latest();

        $reports = $query->paginate(15)->withQueryString();

        $categories = ProgramReportCategory::select('id', 'name', 'slug')->orderBy('sort_order')->get();

        return inertia('Admin/ProgramReports/Index', [
            'reports' => $reports,
            'filters' => $request->only(['search', 'status', 'category_id']),
            'statusCounts' => $statusCounts,
            'highRiskPrograms' => $highRiskPrograms,
            'categories' => $categories,
        ]);
    }

    public function updateStatus(Request $request, ProgramReport $program_report)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,investigating,resolved,dismissed',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $program_report->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $program_report->admin_notes,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Status laporan aduan berhasil diperbarui.');
    }

    public function actionTakeDown(Request $request, ProgramReport $program_report)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $program = $program_report->program;
        if (! $program) {
            return redirect()->back()->with('error', 'Program terkait tidak ditemukan.');
        }

        $program->update([
            'status' => 'closed_manual',
            'closed_at' => now(),
            'rejection_notes' => "Ditutup oleh moderator admin atas tindak lanjut laporan #{$program_report->ticket_number}. Alasan: {$validated['reason']}",
        ]);

        $program_report->update([
            'status' => 'resolved',
            'admin_notes' => ($program_report->admin_notes ? $program_report->admin_notes."\n\n" : '').
                '[TINDAKAN MODERASI '.now()->format('d/m/Y H:i').']: Program ditutup/ditakedown. Alasan: '.$validated['reason'],
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->back()->with('success', "Program '{$program->title}' berhasil ditutup dan status laporan ditandai selesai.");
    }

    public function destroy(ProgramReport $program_report)
    {
        $program_report->delete();

        return redirect()->back()->with('success', 'Laporan aduan berhasil dihapus.');
    }
}
