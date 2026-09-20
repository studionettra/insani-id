<?php

use App\Models\Category;
use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('authenticated donor can access their personal donations dashboard', function () {
    Role::firstOrCreate(['name' => 'Donatur', 'guard_name' => 'web']);

    $donor = User::factory()->create(['email' => 'donatur1@example.com']);
    $donor->assignRole('Donatur');

    $category = Category::create([
        'name' => 'Kemanusiaan',
        'slug' => 'kemanusiaan',
        'platform_fee_percent' => 5,
    ]);

    $program = Program::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    Donation::factory()->create([
        'donor_user_id' => $donor->id,
        'donor_email' => $donor->email,
        'program_id' => $program->id,
        'amount' => 100000,
        'status' => 'paid',
    ]);

    $response = $this->actingAs($donor)->get(route('akun.donations.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Akun/Donasi/Index')
        ->has('donations.data', 1)
        ->where('donations.data.0.amount', '100000.00')
    );
});

test('unauthenticated guest is redirected to login when trying to access /akun/donasi-saya', function () {
    $response = $this->get(route('akun.donations.index'));
    $response->assertRedirect(route('login'));
});

test('guest can access public /cek-donasi lookup page', function () {
    $response = $this->get(route('donation.lookup'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Donation/Lookup')
        ->where('search', '')
        ->where('donations', null)
    );
});

test('guest can search donations by email on /cek-donasi', function () {
    $category = Category::create([
        'name' => 'Sosial',
        'slug' => 'sosial',
        'platform_fee_percent' => 5,
    ]);

    $program = Program::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    Donation::factory()->create([
        'donor_email' => 'guest_donor@example.com',
        'donor_name' => 'Budi Guest',
        'program_id' => $program->id,
        'amount' => 75000,
        'status' => 'paid',
    ]);

    $response = $this->get(route('donation.lookup', ['q' => 'guest_donor@example.com']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Donation/Lookup')
        ->where('search', 'guest_donor@example.com')
        ->has('donations.data', 1)
        ->where('donations.data.0.amount', '75000.00')
    );
});

test('searching with exact donation code on /cek-donasi redirects directly to status page', function () {
    $category = Category::create([
        'name' => 'Kesehatan',
        'slug' => 'kesehatan',
        'platform_fee_percent' => 5,
    ]);

    $program = Program::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    $donation = Donation::factory()->create([
        'donation_code' => 'DON-TEST123XYZ',
        'donor_email' => 'test@example.com',
        'program_id' => $program->id,
        'amount' => 50000,
        'status' => 'pending',
    ]);

    $response = $this->get(route('donation.lookup', ['q' => 'DON-TEST123XYZ']));

    $response->assertRedirect(route('donation.status', ['donationCode' => 'DON-TEST123XYZ']));
});
