<?php

use App\Models\CampaignerProfile;
use App\Models\Category;
use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders public profile for verified campaigner with statistics and program catalog', function () {
    $user = User::factory()->create(['name' => 'Ahmad Penggalang']);
    $profile = CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'lembaga',
        'verification_status' => 'verified',
        'nama_lembaga' => 'Yayasan Peduli Umat',
        'nomor_sk' => 'AHU-0012345.AH.01.04.2024',
        'npwp' => '012345678901234',
        'bank_name' => 'BSI',
        'bank_account_number' => '7123456789',
        'bank_account_name' => 'Yayasan Peduli Umat',
        'address' => 'Jl. Kemanusiaan No. 1, Jakarta Selatan, DKI Jakarta',
        'phone' => '081234567890',
    ]);

    $category = Category::factory()->create(['name' => ['id' => 'Kesehatan']]);

    $program = Program::factory()->published()->create([
        'campaigner_profile_id' => $profile->id,
        'created_by' => $user->id,
        'category_id' => $category->id,
        'title' => ['id' => 'Operasi Medis Dhuafa'],
        'target_amount' => 50000000,
        'collected_amount' => 15000000,
        'is_continuous' => true,
    ]);

    Donation::factory()->create([
        'program_id' => $program->id,
        'amount' => 5000000,
        'status' => 'paid',
        'donor_email' => 'donatur1@example.com',
    ]);

    $response = $this->get("/campaigner/{$profile->id}");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Campaigner/Show')
        ->has('campaigner')
        ->where('campaigner.id', $profile->id)
        ->where('campaigner.type', 'lembaga')
        ->where('campaigner.nama_lembaga', 'Yayasan Peduli Umat')
        ->where('campaigner.nomor_sk', 'AHU-0012345.AH.01.04.2024')
        ->where('campaigner.has_npwp', true)
        ->where('stats.total_programs', 1)
        ->where('stats.total_collected', 15000000)
        ->where('stats.total_donors', 1)
        ->has('activePrograms', 1)
    );
});

it('returns 404 for unverified, pending, or rejected campaigner profiles', function () {
    $user = User::factory()->create();

    $pendingProfile = CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'individu',
        'verification_status' => 'pending',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Budi',
        'address' => 'Bandung',
        'phone' => '081234567890',
    ]);

    $response = $this->get("/campaigner/{$pendingProfile->id}");
    $response->assertNotFound();

    $pendingProfile->update(['verification_status' => 'rejected']);
    $responseRejected = $this->get("/campaigner/{$pendingProfile->id}");
    $responseRejected->assertNotFound();
});

it('strictly excludes sensitive KYC and bank account details from inertia payload', function () {
    $user = User::factory()->create();
    $profile = CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'lembaga',
        'verification_status' => 'verified',
        'nama_lembaga' => 'Yayasan Insan Mulia',
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '99887766554433',
        'bank_account_name' => 'Yayasan Insan Mulia',
        'address' => 'Jl. Melati No. 5, Surabaya, Jawa Timur',
        'phone' => '089876543210',
    ]);

    $response = $this->get("/campaigner/{$profile->id}");
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Campaigner/Show')
        ->missing('campaigner.bank_name')
        ->missing('campaigner.bank_account_number')
        ->missing('campaigner.bank_account_name')
        ->missing('campaigner.phone')
        ->missing('campaigner.ktp')
        ->missing('campaigner.selfie_ktp')
    );
});

it('redirects /penggalang/{id} alias to /campaigner/{id}', function () {
    $user = User::factory()->create();
    $profile = CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Ahmad',
        'address' => 'Yogyakarta',
        'phone' => '081234567890',
    ]);

    $response = $this->get("/penggalang/{$profile->id}");
    $response->assertRedirect("/campaigner/{$profile->id}");
});

it('hides address/location for individual campaigners for privacy', function () {
    $user = User::factory()->create(['name' => 'Budi Relawan']);
    $profile = CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Budi Relawan',
        'address' => 'Jl. Rumah Pribadi No 99, Bandung',
        'phone' => '081234567890',
    ]);

    $response = $this->get("/campaigner/{$profile->id}");
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Public/Campaigner/Show')
        ->where('campaigner.type', 'individu')
        ->where('campaigner.location', null)
    );
});

it('provides supportedLocales for switching languages on campaigner profile page', function () {
    $user = User::factory()->create();
    $profile = CampaignerProfile::create([
        'user_id' => $user->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Budi',
        'address' => 'Bandung',
        'phone' => '081234567890',
    ]);

    $response = $this->get("/campaigner/{$profile->id}");
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('supportedLocales.en')
        ->has('supportedLocales.ar')
        ->has('supportedLocales.id')
    );
});
