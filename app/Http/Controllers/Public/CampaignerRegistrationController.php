<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CampaignerProfile;
use App\Models\User;
use App\Models\VerificationDocument;
use App\Notifications\CampaignerRegisteredNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

class CampaignerRegistrationController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();

        if ($user->can('campaigner.verify') || $user->hasAnyRole(['Administrator', 'Program Officer', 'Verifikator', 'Keuangan', 'Superadmin', 'admin'])) {
            return redirect()->route('admin.campaigners.index')
                ->with('info', 'Anda masuk sebagai Pengelola Sistem (Admin). Anda dapat mengelola pendaftaran penggalang dana di sini.');
        }

        $profile = $user->campaignerProfile()->with('documents')->first();

        if ($profile && $profile->verification_status !== 'rejected') {
            return redirect()->route('campaigner.status');
        }

        return inertia('Public/CampaignerRegistration/Create', [
            'existingProfile' => $profile,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->can('campaigner.verify') || $user->hasAnyRole(['Administrator', 'Program Officer', 'Verifikator', 'Keuangan', 'Superadmin', 'admin'])) {
            return redirect()->route('admin.campaigners.index')
                ->with('error', 'Akun staf internal/Admin tidak diizinkan mendaftar sebagai campaigner eksternal.');
        }

        $existingProfile = $user->campaignerProfile;

        if ($existingProfile && $existingProfile->verification_status !== 'rejected') {
            return redirect()->route('campaigner.status');
        }

        $hasKtp = (bool) $existingProfile?->documents()->where('document_type', 'ktp')->exists();
        $hasSelfie = (bool) $existingProfile?->documents()->where('document_type', 'selfie_ktp')->exists();
        $hasBuku = (bool) $existingProfile?->documents()->where('document_type', 'buku_rekening')->exists();
        $hasSk = (bool) $existingProfile?->documents()->where('document_type', 'sk_lembaga')->exists();
        $hasNpwp = (bool) $existingProfile?->documents()->where('document_type', 'npwp')->exists();

        $validated = $request->validate([
            'type' => 'required|in:individu,lembaga',
            'nama_lembaga' => 'required_if:type,lembaga|nullable|string|max:255',
            'nomor_sk' => 'required_if:type,lembaga|nullable|string|max:255',
            'npwp' => 'required_if:type,lembaga|nullable|string|max:255',
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:255',
            'bank_account_name' => 'required|string|max:255',
            'address' => 'required|string|max:1000',
            'phone' => 'required|string|max:30',

            // Documents: nullable if resubmitting with existing document, required otherwise
            'ktp' => [$hasKtp ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'selfie_ktp' => [$hasSelfie ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'buku_rekening' => [$hasBuku ? 'nullable' : 'required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'sk_lembaga' => [$hasSk ? 'nullable' : 'required_if:type,lembaga', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:5120'],
            'npwp_lembaga' => [$hasNpwp ? 'nullable' : 'required_if:type,lembaga', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($validated['type'] === 'lembaga' && strtolower($validated['bank_account_name']) === strtolower($user->name)) {
            return back()->withErrors(['bank_account_name' => 'Untuk lembaga, nama rekening tidak boleh sama dengan nama pribadi.']);
        }

        $profile = DB::transaction(function () use ($validated, $request, $user, $existingProfile) {
            if ($existingProfile) {
                $existingProfile->update([
                    'type' => $validated['type'],
                    'verification_status' => 'pending',
                    'nama_lembaga' => $validated['nama_lembaga'] ?? null,
                    'nomor_sk' => $validated['nomor_sk'] ?? null,
                    'npwp' => $validated['npwp'] ?? null,
                    'bank_name' => $validated['bank_name'],
                    'bank_account_number' => $validated['bank_account_number'],
                    'bank_account_name' => $validated['bank_account_name'],
                    'address' => $validated['address'],
                    'phone' => $validated['phone'],
                ]);
                $profile = $existingProfile;
            } else {
                $profile = CampaignerProfile::create([
                    'user_id' => $user->id,
                    'type' => $validated['type'],
                    'verification_status' => 'pending',
                    'nama_lembaga' => $validated['nama_lembaga'] ?? null,
                    'nomor_sk' => $validated['nomor_sk'] ?? null,
                    'npwp' => $validated['npwp'] ?? null,
                    'bank_name' => $validated['bank_name'],
                    'bank_account_number' => $validated['bank_account_number'],
                    'bank_account_name' => $validated['bank_account_name'],
                    'address' => $validated['address'],
                    'phone' => $validated['phone'],
                ]);
            }

            $documents = [
                'ktp' => $request->file('ktp'),
                'selfie_ktp' => $request->file('selfie_ktp'),
                'buku_rekening' => $request->file('buku_rekening'),
            ];

            if ($validated['type'] === 'lembaga') {
                $documents['sk_lembaga'] = $request->file('sk_lembaga');
                $documents['npwp'] = $request->file('npwp_lembaga');
            }

            foreach ($documents as $type => $file) {
                if ($file) {
                    $existingDoc = $profile->documents()->where('document_type', $type)->first();
                    if ($existingDoc && Storage::disk('local')->exists($existingDoc->file_path)) {
                        Storage::disk('local')->delete($existingDoc->file_path);
                    }

                    $path = $file->store("verification_documents/{$user->id}", 'local');
                    $profile->documents()->updateOrCreate(
                        ['document_type' => $type],
                        [
                            'file_path' => $path,
                            'status' => 'pending',
                            'notes' => null,
                        ]
                    );
                } elseif ($existingProfile) {
                    $profile->documents()->where('document_type', $type)->update([
                        'status' => 'pending',
                        'notes' => null,
                    ]);
                }
            }

            return $profile;
        });

        $recipients = rescue(fn () => User::permission('campaigner.verify')->get(), collect(), false);
        if ($recipients->isEmpty()) {
            $recipients = rescue(fn () => User::role('Administrator')->get(), collect(), false);
        }
        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new CampaignerRegisteredNotification($profile));
        }

        $message = $existingProfile
            ? 'Pengajuan revisi berkas pendaftaran berhasil dikirim. Silakan tunggu proses peninjauan kembali oleh tim kami.'
            : 'Pendaftaran berhasil. Silakan tunggu proses verifikasi dari tim kami.';

        return redirect()->route('campaigner.status')->with('success', $message);
    }

    public function status(Request $request)
    {
        $profile = $request->user()->campaignerProfile()->with('documents')->first();
        if (! $profile) {
            return redirect()->route('campaigner.register');
        }

        return inertia('Public/CampaignerRegistration/Status', [
            'profile' => $profile,
        ]);
    }

    public function viewDocument(Request $request, $id)
    {
        $document = VerificationDocument::with('campaignerProfile')->find($id);

        if (! $document || ! $document->campaignerProfile) {
            abort(404, 'Dokumen tidak ditemukan.');
        }

        $user = $request->user();
        $isOwner = $document->campaignerProfile->user_id === $user->id;
        $canVerify = $user->can('campaigner.verify') || $user->hasRole('Administrator');

        if (! $isOwner && ! $canVerify) {
            abort(404, 'Dokumen tidak ditemukan.');
        }

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'Dokumen tidak ditemukan.');
        }

        return Storage::disk('local')->response($document->file_path);
    }
}
