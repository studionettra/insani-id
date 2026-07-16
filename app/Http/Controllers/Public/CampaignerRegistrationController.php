<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CampaignerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CampaignerRegistrationController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();
        if ($user->campaignerProfile) {
            return redirect()->route('campaigner.status');
        }

        return inertia('Public/CampaignerRegistration/Create');
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->campaignerProfile) {
            return redirect()->route('campaigner.status');
        }

        $validated = $request->validate([
            'type' => 'required|in:individu,lembaga',
            'nama_lembaga' => 'required_if:type,lembaga|nullable|string|max:255',
            'nomor_sk' => 'required_if:type,lembaga|nullable|string|max:255',
            'npwp' => 'required_if:type,lembaga|nullable|string|max:255',
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:255',
            'bank_account_name' => 'required|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|max:30',

            // Documents
            'ktp' => 'required|file|image|max:2048',
            'selfie_ktp' => 'required|file|image|max:2048',
            'buku_rekening' => 'required|file|image|max:2048',
            'sk_lembaga' => 'required_if:type,lembaga|nullable|file|mimes:pdf,jpg,png|max:5120',
            'npwp_lembaga' => 'required_if:type,lembaga|nullable|file|image|max:2048',
        ]);

        if ($validated['type'] === 'lembaga' && strtolower($validated['bank_account_name']) === strtolower($user->name)) {
            return back()->withErrors(['bank_account_name' => 'Untuk lembaga, nama rekening tidak boleh sama dengan nama pribadi.']);
        }

        DB::transaction(function () use ($validated, $request, $user) {
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
                    $path = $file->store("verification_documents/{$user->id}", 'public');
                    $profile->documents()->create([
                        'document_type' => $type,
                        'file_path' => $path,
                        'status' => 'pending',
                    ]);
                }
            }
        });

        return redirect()->route('campaigner.status')->with('success', 'Pendaftaran berhasil. Silakan tunggu proses verifikasi dari tim kami.');
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
}
