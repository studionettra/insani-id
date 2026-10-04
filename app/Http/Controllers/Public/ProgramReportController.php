<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramReport;
use App\Models\ProgramReportCategory;
use App\Models\User;
use App\Notifications\ProgramReportReceivedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProgramReportController extends Controller
{
    public function create(string $slug)
    {
        $program = Program::with(['category', 'campaignerProfile'])
            ->where('slug', $slug)
            ->firstOrFail();

        $categories = ProgramReportCategory::active()->get()->map(function ($cat) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'name_translations' => $cat->name_translations,
                'description' => $cat->description,
                'slug' => $cat->slug,
            ];
        });

        $campaignerName = 'Insani Indonesia';
        if ($program->campaigner_type === 'lembaga' && $program->campaignerProfile) {
            $campaignerName = $program->campaignerProfile->organization_name;
        } elseif ($program->campaigner_type === 'individu' && $program->campaignerProfile) {
            $campaignerName = $program->campaignerProfile->full_name;
        }

        return inertia('Public/Program/Report', [
            'program' => [
                'id' => $program->id,
                'title' => $program->title,
                'slug' => $program->slug,
                'cover_image' => $program->cover_image ? (str_starts_with($program->cover_image, 'http') ? $program->cover_image : Storage::url($program->cover_image)) : null,
                'campaigner_name' => $campaignerName,
            ],
            'categories' => $categories,
        ]);
    }

    public function store(Request $request, string $slug)
    {
        // Anti-spam Honeypot check
        if (! empty($request->input('website'))) {
            // Silently pretend success to fool automated spam bots
            return redirect()->back()->with('ticket_number', 'RPT-BOT-IGNORED');
        }

        $program = Program::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'reporter_name' => 'required|string|max:100',
            'reporter_phone' => 'required|string|min:8|max:30',
            'reporter_email' => 'required|email|max:100',
            'category_id' => 'required|exists:program_report_categories,id',
            'description' => 'required|string|min:10|max:1000',
            'evidence' => 'nullable|array|max:5',
            'evidence.*' => 'file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'cf-turnstile-response' => 'required|string',
        ], [
            'reporter_name.required' => 'Nama lengkap wajib diisi.',
            'reporter_phone.required' => 'Nomor handphone wajib diisi.',
            'reporter_email.required' => 'Email wajib diisi.',
            'reporter_email.email' => 'Format email tidak valid.',
            'category_id.required' => 'Silakan pilih kategori pelanggaran.',
            'description.required' => 'Detail laporan wajib diisi.',
            'description.min' => 'Detail laporan minimal 10 karakter.',
            'description.max' => 'Detail laporan maksimal 1.000 karakter.',
            'evidence.*.mimes' => 'Format file bukti harus berupa JPG, PNG, WEBP, atau PDF.',
            'evidence.*.max' => 'Ukuran maksimal file bukti adalah 5MB per file.',
            'cf-turnstile-response.required' => 'Verifikasi keamanan wajib diselesaikan.',
        ]);

        // Verify Turnstile
        $turnstileResponse = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => config('services.turnstile.secret_key'),
            'response' => $request->input('cf-turnstile-response'),
            'remoteip' => $request->ip(),
        ]);

        if (! $turnstileResponse->json('success')) {
            throw ValidationException::withMessages([
                'cf-turnstile-response' => 'Verifikasi keamanan gagal. Silakan coba lagi.',
            ]);
        }

        $uploadedFiles = [];
        if ($request->hasFile('evidence')) {
            foreach ($request->file('evidence') as $file) {
                if ($file->isValid()) {
                    $path = $file->store('reports/'.date('Ym'), 'local');
                    $uploadedFiles[] = [
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'size' => $file->getSize(),
                    ];
                }
            }
        }

        $report = ProgramReport::create([
            'program_id' => $program->id,
            'category_id' => $validated['category_id'],
            'user_id' => auth()->id(),
            'reporter_name' => $validated['reporter_name'],
            'reporter_phone' => $validated['reporter_phone'],
            'reporter_email' => $validated['reporter_email'],
            'description' => $validated['description'],
            'evidence_files' => ! empty($uploadedFiles) ? $uploadedFiles : null,
            'status' => 'pending',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        try {
            $admins = User::whereHas('roles', function ($q) {
                $q->where('name', 'Administrator');
            })->orWhereHas('permissions', function ($q) {
                $q->where('name', 'program_report.manage');
            })->get();

            if ($admins->isNotEmpty()) {
                Notification::send($admins, new ProgramReportReceivedNotification($report));
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return redirect()->back()->with([
            'success' => 'Laporan Anda telah berhasil dikirimkan.',
            'ticket_number' => $report->ticket_number,
        ]);
    }
}
