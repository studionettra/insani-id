<?php

use App\Models\Comment;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Database\Seeders\LegacyCampaignAndDonationSeeder;
use Illuminate\Support\Facades\File;

it('ensures campaigns_archive.json and donations_archive.json exist with valid data', function () {
    $campaignsPath = database_path('data/campaigns_archive.json');
    $donationsPath = database_path('data/donations_archive.json');

    expect(File::exists($campaignsPath))->toBeTrue();
    expect(File::exists($donationsPath))->toBeTrue();

    $campaigns = json_decode(File::get($campaignsPath), true);
    $donations = json_decode(File::get($donationsPath), true);

    expect($campaigns)->toBeArray()->and(count($campaigns))->toBe(11);
    expect($donations)->toBeArray()->and(count($donations))->toBe(76);

    $totalSum = array_sum(array_column($donations, 'amount'));
    expect((float) $totalSum)->toBe(15333301.0);
});

it('seeds legacy campaigns and donations accurately and idempotently', function () {
    // Pastikan kategori dan admin tersedia
    $this->seed(CategorySeeder::class);
    $admin = User::firstOrCreate(
        ['email' => 'admin@insani.id'],
        [
            'name' => 'Super Administrator',
            'phone' => '081122334455',
            'password' => bcrypt('password'),
            'must_change_password' => false,
        ]
    );

    // Jalankan seeder pertama kali
    $this->seed(LegacyCampaignAndDonationSeeder::class);

    expect(Program::where('program_code', 'like', 'PRG-LEGACY-%')->count())->toBe(11);
    expect(Donation::where('donation_code', 'like', 'DON-WC-%')->count())->toBe(76);
    expect(Payment::where('gateway', 'legacy_woocommerce')->count())->toBe(76);
    expect(Comment::whereHas('donation', fn ($q) => $q->where('donation_code', 'like', 'DON-WC-%'))->count())->toBe(76);

    // Verifikasi perolehan total
    $totalCollected = Program::where('program_code', 'like', 'PRG-LEGACY-%')->sum('collected_amount');
    expect((float) $totalCollected)->toBe(15333301.0);

    // Verifikasi sampel program Sulteng
    $sulteng = Program::where('slug', 'sulteng-untuk-palestina')->first();
    expect($sulteng)->not->toBeNull();
    expect((float) $sulteng->collected_amount)->toBe(11800000.0);
    expect($sulteng->status)->toBe('published');
    expect($sulteng->is_continuous)->toBeTrue();
    expect($sulteng->comments()->count())->toBe(16);

    // Verifikasi sampel program Semeru (closed)
    $semeru = Program::where('slug', 'erupsi-semeru-bantu-warga-terdampak-segera')->first();
    expect($semeru)->not->toBeNull();
    expect((float) $semeru->collected_amount)->toBe(10000.0);
    expect($semeru->status)->toBe('completed');
    expect($semeru->is_continuous)->toBeFalse();

    // Jalankan seeder kedua kali untuk membuktikan idempotensi penuh
    $this->seed(LegacyCampaignAndDonationSeeder::class);

    expect(Program::where('program_code', 'like', 'PRG-LEGACY-%')->count())->toBe(11);
    expect(Donation::where('donation_code', 'like', 'DON-WC-%')->count())->toBe(76);
    $totalCollectedSecond = Program::where('program_code', 'like', 'PRG-LEGACY-%')->sum('collected_amount');
    expect((float) $totalCollectedSecond)->toBe(15333301.0);
});

it('ensures legacy ad and campaign URLs redirect with 301 and forward query parameters', function () {
    // 1. Sulteng Landing Page redirect
    $response = $this->get('/sulteng-pl?fbclid=TEST_FBCLID_123&utm_source=meta_ads');
    $response->assertRedirect('/program/sulteng-untuk-palestina?fbclid=TEST_FBCLID_123&utm_source=meta_ads');
    $response->assertStatus(301);

    // 2. Gorontalo Landing Page redirect
    $response = $this->get('/gorontalo-pl?utm_campaign=ramadhan');
    $response->assertRedirect('/program/gorontalo-untuk-palestina?utm_campaign=ramadhan');
    $response->assertStatus(301);

    // 3. Galang dana id index redirect
    $response = $this->get('/galang-dana-id');
    $response->assertRedirect('/program');
    $response->assertStatus(301);

    // 4. Galang dana wintergaza redirect
    $response = $this->get('/galang-dana/wintergaza?ref=sahabat');
    $response->assertRedirect('/program/bantu-mereka-bertahan-ditengah-musim-dingin-ekstrem?ref=sahabat');
    $response->assertStatus(301);
});

it('prevents continuous legacy programs from being closed when receiving new donations', function () {
    $this->seed(CategorySeeder::class);
    $admin = User::firstOrCreate(
        ['email' => 'admin@insani.id'],
        [
            'name' => 'Super Administrator',
            'phone' => '081122334455',
            'password' => bcrypt('password'),
            'must_change_password' => false,
        ]
    );

    $this->seed(LegacyCampaignAndDonationSeeder::class);

    $program = Program::where('slug', 'sulteng-untuk-palestina')->first();
    expect($program->is_continuous)->toBeTrue();
    expect($program->status)->toBe('published');

    // Buat donasi baru yang membuat collected_amount melampaui target
    $newAmount = ($program->target_amount ?? 50000000) + 100000;
    $program->update(['collected_amount' => $newAmount]);

    $program->refresh();
    // Program harus tetap published karena is_continuous = true
    expect($program->status)->toBe('published');
});
