<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Donation;
use App\Models\Fundraiser;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->category = Category::create([
        'name' => ['id' => 'Kemanusiaan', 'en' => 'Humanity'],
        'slug' => 'kemanusiaan',
        'platform_fee_percent' => 5.0,
    ]);

    $this->program = Program::factory()->published()->create([
        'category_id' => $this->category->id,
        'title' => 'Program Bantuan Gempa',
        'slug' => 'program-bantuan-gempa',
        'target_amount' => 50000000,
    ]);
});

test('user can register as fundraiser for a published program and role is assigned', function () {
    (new PermissionSeeder)->run();
    (new RoleSeeder)->run();

    $user = User::factory()->create(['name' => 'Ahmad Dahlan']);

    $response = $this->actingAs($user)
        ->from(route('program.show', $this->program->slug))
        ->post(route('program.fundraiser.store', $this->program->slug), [
            'target_amount' => 5000000,
            'personal_message' => 'Mari bersama bantu saudara kita.',
        ]);

    $response->assertRedirect(route('program.show', $this->program->slug));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('fundraisers', [
        'user_id' => $user->id,
        'program_id' => $this->program->id,
        'target_amount' => 5000000,
        'personal_message' => 'Mari bersama bantu saudara kita.',
        'is_active' => true,
    ]);

    $fundraiser = Fundraiser::where('user_id', $user->id)->first();
    expect($fundraiser)->not->toBeNull()
        ->and($fundraiser->referral_code)->not->toBeEmpty();

    $freshUser = $user->fresh();
    expect($freshUser->hasRole('Fundraiser'))->toBeTrue();
    expect($freshUser->hasPermissionTo('fundraiser.view'))->toBeFalse();
    expect($freshUser->getAllPermissions()->pluck('name')->contains('fundraiser.view'))->toBeFalse();
});

test('fundraiser cannot register twice for the same program and gets redirected with info', function () {
    $user = User::factory()->create(['name' => 'Siti Nurhaliza']);

    $fundraiser = Fundraiser::factory()->create([
        'user_id' => $user->id,
        'program_id' => $this->program->id,
    ]);

    $response = $this->actingAs($user)
        ->from(route('program.show', $this->program->slug))
        ->post(route('program.fundraiser.store', $this->program->slug), [
            'target_amount' => 10000000,
        ]);

    $response->assertRedirect(route('program.show', $this->program->slug));
    $response->assertSessionHas('info');
    expect(Fundraiser::where('user_id', $user->id)->where('program_id', $this->program->id)->count())->toBe(1);
});

test('referral link captures ref code and attributes donation to fundraiser', function () {
    $fundraiserUser = User::factory()->create(['name' => 'Relawan Baik']);
    $fundraiser = Fundraiser::factory()->create([
        'user_id' => $fundraiserUser->id,
        'program_id' => $this->program->id,
        'referral_code' => 'relawan-baik-xyz12',
    ]);

    // Visit program page with referral code
    $viewResponse = $this->get(route('program.show', [
        'slug' => $this->program->slug,
        'ref' => $fundraiser->referral_code,
    ]));

    $viewResponse->assertOk();
    $viewResponse->assertSessionHas('referral_code', 'relawan-baik-xyz12');

    // Create donation from donor
    $donor = User::factory()->create(['name' => 'Dermawan']);
    $donateResponse = $this->actingAs($donor)
        ->withSession(['referral_code' => 'relawan-baik-xyz12'])
        ->post(route('donation.store', $this->program->slug), [
            'amount' => 100000,
            'donor_name' => 'Dermawan',
            'donor_email' => 'dermawan@example.com',
            'donor_phone' => '081234567890',
            'channel' => 'offline',
        ]);

    $donateResponse->assertRedirect();

    $this->assertDatabaseHas('donations', [
        'program_id' => $this->program->id,
        'donor_user_id' => $donor->id,
        'fundraiser_id' => $fundraiser->id,
        'fundraiser_user_id' => $fundraiserUser->id,
    ]);
});

test('successful payment updates fundraiser collected amount and donors count', function () {
    $fundraiserUser = User::factory()->create(['name' => 'Relawan Aktif']);
    $fundraiser = Fundraiser::factory()->create([
        'user_id' => $fundraiserUser->id,
        'program_id' => $this->program->id,
        'collected_amount' => 0,
        'donors_count' => 0,
    ]);

    $donation = Donation::factory()->create([
        'program_id' => $this->program->id,
        'fundraiser_id' => $fundraiser->id,
        'fundraiser_user_id' => $fundraiserUser->id,
        'amount' => 250000,
        'status' => 'pending',
    ]);

    $payment = Payment::create([
        'donation_id' => $donation->id,
        'payment_method' => 'bank_transfer_manual',
        'gateway' => 'manual',
        'gateway_reference_id' => 'REF-FR-999',
        'gateway_status' => 'PENDING',
    ]);

    // Mark payment as PAID
    $payment->update([
        'gateway_status' => 'PAID',
    ]);

    expect($donation->fresh()->status)->toBe('paid');
    expect((float) $fundraiser->fresh()->collected_amount)->toEqual(250000);
    expect($fundraiser->fresh()->donors_count)->toBe(1);
});

test('user can view my fundraisers list in account area', function () {
    $user = User::factory()->create();
    Fundraiser::factory()->create([
        'user_id' => $user->id,
        'program_id' => $this->program->id,
    ]);

    $response = $this->actingAs($user)->get(route('akun.fundraiser.index'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/Akun/Fundraiser/Index')
        ->has('fundraisers.data', 1)
        ->has('stats')
    );
});

test('guest cannot access my fundraisers area', function () {
    $response = $this->get(route('akun.fundraiser.index'));
    $response->assertRedirect(route('login'));
});

test('admin and program officer can access admin fundraisers overview while non-admin and fundraiser roles are forbidden', function () {
    (new PermissionSeeder)->run();
    (new RoleSeeder)->run();

    $admin = User::factory()->create();
    $admin->assignRole('Administrator');

    $programOfficer = User::factory()->create();
    $programOfficer->assignRole('Program Officer');

    $regularUser = User::factory()->create();

    $fundraiserUser = User::factory()->create();
    $fundraiserUser->assignRole('Fundraiser');

    $campaignerFundraiserUser = User::factory()->create();
    $campaignerFundraiserUser->assignRole(['Campaigner Individu', 'Fundraiser']);

    // Regular user forbidden
    $this->actingAs($regularUser)
        ->get(route('admin.fundraisers.index'))
        ->assertForbidden();

    // Fundraiser user forbidden
    $this->actingAs($fundraiserUser)
        ->get(route('admin.fundraisers.index'))
        ->assertForbidden();

    // Campaigner who is also fundraiser forbidden
    $this->actingAs($campaignerFundraiserUser)
        ->get(route('admin.fundraisers.index'))
        ->assertForbidden();

    // Program Officer allowed
    $this->actingAs($programOfficer)
        ->get(route('admin.fundraisers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Fundraisers/Index')
            ->has('fundraisers')
            ->has('stats')
        );

    // Admin allowed
    $this->actingAs($admin)
        ->get(route('admin.fundraisers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Fundraisers/Index')
            ->has('fundraisers')
            ->has('stats')
        );
});
