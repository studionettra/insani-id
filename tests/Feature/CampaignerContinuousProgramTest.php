<?php

use App\Models\CampaignerProfile;
use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    Storage::fake('public');
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->campaignerRole = Role::firstOrCreate(['name' => 'Campaigner Individu']);
    $createPerm = Permission::firstOrCreate(['name' => 'program.create']);
    $this->campaignerRole->givePermissionTo($createPerm);

    $this->category = Category::firstOrCreate([
        'slug' => 'kemanusiaan-test',
    ], [
        'name' => ['id' => 'Kemanusiaan'],
        'is_active' => true,
    ]);

    $this->user = User::factory()->create(['name' => 'Ahmad Campaigner']);
    $this->user->assignRole('Campaigner Individu');
    $this->profile = CampaignerProfile::create([
        'user_id' => $this->user->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'bank_name' => 'BSI',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Ahmad Campaigner',
    ]);
});

test('campaigner can create a continuous program without target_amount', function () {
    $file = UploadedFile::fake()->image('cover.jpg');

    $response = $this->actingAs($this->user)->post('/akun/programs', [
        'title' => 'Program Sedekah Subuh Rutin',
        'category_id' => $this->category->id,
        'is_continuous' => true,
        'target_amount' => '',
        'deadline' => '',
        'story' => '<p>Deskripsi program sedekah subuh yang berkelanjutan setiap hari.</p>',
        'cover_image' => $file,
    ]);

    $response->assertRedirect('/akun/programs');

    $program = Program::where('title->id', 'Program Sedekah Subuh Rutin')
        ->orWhere('title', 'like', '%Program Sedekah Subuh Rutin%')
        ->first();

    expect($program)->not->toBeNull()
        ->and($program->is_continuous)->toBeTrue()
        ->and($program->target_amount)->toBeNull();
});

test('campaigner fails validation when creating non-continuous program without target_amount', function () {
    $file = UploadedFile::fake()->image('cover.jpg');

    $response = $this->actingAs($this->user)->post('/akun/programs', [
        'title' => 'Program Bantuan Operasi',
        'category_id' => $this->category->id,
        'is_continuous' => false,
        'target_amount' => '',
        'story' => '<p>Deskripsi program bantuan operasi.</p>',
        'cover_image' => $file,
    ]);

    $response->assertSessionHasErrors(['target_amount']);
});

test('campaigner can create a non-continuous program with valid target_amount', function () {
    $file = UploadedFile::fake()->image('cover.jpg');

    $response = $this->actingAs($this->user)->post('/akun/programs', [
        'title' => 'Program Bangun Madrasah',
        'category_id' => $this->category->id,
        'is_continuous' => false,
        'target_amount' => 50000000,
        'story' => '<p>Deskripsi program pembangunan madrasah.</p>',
        'cover_image' => $file,
    ]);

    $response->assertRedirect('/akun/programs');

    $program = Program::where('title->id', 'Program Bangun Madrasah')
        ->orWhere('title', 'like', '%Program Bangun Madrasah%')
        ->first();

    expect($program)->not->toBeNull()
        ->and($program->is_continuous)->toBeFalse()
        ->and((float) $program->target_amount)->toEqual(50000000.0);
});

test('campaigner can update program from target to continuous', function () {
    $program = Program::create([
        'program_code' => 'PRG-TEST-001',
        'title' => 'Program Renovasi Masjid',
        'slug' => 'program-renovasi-masjid-001',
        'category_id' => $this->category->id,
        'campaigner_type' => 'individu',
        'campaigner_profile_id' => $this->profile->id,
        'created_by' => $this->user->id,
        'target_amount' => 25000000,
        'is_continuous' => false,
        'story' => '<p>Deskripsi program renovasi.</p>',
        'cover_image' => 'programs/covers/test.jpg',
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->user)->put("/akun/programs/{$program->id}", [
        'title' => 'Program Operasional Masjid Berkelanjutan',
        'category_id' => $this->category->id,
        'is_continuous' => true,
        'target_amount' => '',
        'story' => '<p>Deskripsi program operasional masjid berkelanjutan.</p>',
    ]);

    $response->assertRedirect('/akun/programs');

    $program->refresh();
    expect($program->is_continuous)->toBeTrue()
        ->and($program->target_amount)->toBeNull();
});
