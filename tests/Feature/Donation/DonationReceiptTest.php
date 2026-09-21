<?php

use App\Models\Category;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = Category::create([
        'name' => 'Kemanusiaan',
        'slug' => 'kemanusiaan',
        'is_active' => true,
    ]);

    $this->creator = User::factory()->create();

    $this->program = Program::create([
        'program_code' => 'PRG-TEST-001',
        'title' => 'Bantuan Peduli Bencana',
        'slug' => 'bantuan-peduli-bencana',
        'category_id' => $this->category->id,
        'campaigner_type' => 'internal',
        'created_by' => $this->creator->id,
        'target_amount' => 50000000,
        'collected_amount' => 0,
        'status' => 'published',
        'story' => 'Cerita program bantuan',
        'cover_image' => 'programs/covers/test.jpg',
    ]);
});

test('it displays official donation receipt when donation is paid', function () {
    $donation = Donation::create([
        'donation_code' => 'DON-RECEIPT-01',
        'program_id' => $this->program->id,
        'donor_name' => 'Budi Santoso',
        'donor_email' => 'budi@example.com',
        'donor_phone' => '081299988877',
        'amount' => 250000,
        'channel' => 'online',
        'status' => 'paid',
        'paid_at' => now(),
    ]);

    Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'virtual_account',
        'payment_channel' => 'BCA',
        'gateway' => 'xendit',
        'gateway_reference_id' => 'EXT-12345',
        'gateway_status' => 'PAID',
        'paid_amount' => 250000,
        'paid_at' => now(),
    ]);

    $response = $this->get(route('donation.receipt', $donation->donation_code));

    $response->assertOk();
    $response->assertViewIs('receipt');
    $response->assertSee('DON-RECEIPT-01');
    $response->assertSee('Budi Santoso');
    $response->assertSee('250.000');
    $response->assertSee('BCA');
    $response->assertSee('Lunas / Paid');
});

test('it redirects to status page with error if donation is not paid', function () {
    $donation = Donation::create([
        'donation_code' => 'DON-UNPAID-01',
        'program_id' => $this->program->id,
        'donor_name' => 'Ahmad',
        'donor_email' => 'ahmad@example.com',
        'donor_phone' => '081299988877',
        'amount' => 100000,
        'channel' => 'online',
        'status' => 'pending',
    ]);

    $response = $this->get(route('donation.receipt', $donation->donation_code));

    $response->assertRedirect(route('donation.status', ['donationCode' => $donation->donation_code]));
    $response->assertSessionHas('error');
});
