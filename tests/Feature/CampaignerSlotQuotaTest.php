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

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Storage::fake('public');
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->campaignerRole = Role::firstOrCreate(['name' => 'Campaigner Individu']);
    $createPerm = Permission::firstOrCreate(['name' => 'program.create']);
    $this->campaignerRole->givePermissionTo($createPerm);

    $this->lembagaRole = Role::firstOrCreate(['name' => 'Campaigner Lembaga']);
    $this->lembagaRole->givePermissionTo($createPerm);

    $this->category = Category::create([
        'name' => ['id' => 'Kemanusiaan'],
        'slug' => 'kemanusiaan',
        'is_active' => true,
    ]);

    // Individu User & Profile
    $this->individuUser = User::factory()->create(['name' => 'Ahmad Individu']);
    $this->individuUser->assignRole('Campaigner Individu');
    $this->individuProfile = CampaignerProfile::create([
        'user_id' => $this->individuUser->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'bank_name' => 'BSI',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Ahmad Individu',
    ]);

    // Lembaga User & Profile
    $this->lembagaUser = User::factory()->create(['name' => 'Yayasan Berkah']);
    $this->lembagaUser->assignRole('Campaigner Lembaga');
    $this->lembagaProfile = CampaignerProfile::create([
        'user_id' => $this->lembagaUser->id,
        'type' => 'lembaga',
        'verification_status' => 'verified',
        'nama_lembaga' => 'Yayasan Berkah Umat',
        'bank_name' => 'BSI',
        'bank_account_number' => '9876543210',
        'bank_account_name' => 'Yayasan Berkah Umat',
    ]);
});

it('sets default max_campaign_slots to 1 for individu and 3 for lembaga', function () {
    expect($this->individuProfile->max_campaign_slots)->toBe(1);
    expect($this->lembagaProfile->max_campaign_slots)->toBe(3);
});

it('allows individu campaigner to create a program when under quota', function () {
    actingAs($this->individuUser)
        ->get(route('akun.programs.create'))
        ->assertSuccessful();

    actingAs($this->individuUser)
        ->post(route('akun.programs.store'), [
            'title' => 'Program Pertama Individu',
            'category_id' => $this->category->id,
            'story' => 'Cerita program pertama yang sangat menyentuh.',
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
        ])
        ->assertRedirect(route('akun.programs.index'))
        ->assertSessionHas('success');

    expect($this->individuProfile->fresh()->active_programs_count)->toBe(1);
    expect($this->individuProfile->fresh()->hasAvailableSlot())->toBeFalse();
});

it('blocks individu campaigner from creating another program when 1 slot is occupied', function () {
    // Create 1 active program (pending_verification)
    Program::create([
        'title' => ['id' => 'Program Sedang Aktif'],
        'slug' => 'program-sedang-aktif',
        'program_code' => 'PRG-AKTIF-01',
        'story' => ['id' => 'Deskripsi program'],
        'category_id' => $this->category->id,
        'created_by' => $this->individuUser->id,
        'campaigner_type' => 'individu',
        'campaigner_profile_id' => $this->individuProfile->id,
        'status' => 'pending_verification',
        'cover_image' => 'cover.jpg',
    ]);

    // Attempt to access create page
    actingAs($this->individuUser)
        ->get(route('akun.programs.create'))
        ->assertRedirect(route('akun.programs.index'))
        ->assertSessionHas('error');

    // Attempt to submit store request
    actingAs($this->individuUser)
        ->post(route('akun.programs.store'), [
            'title' => 'Program Kedua Yang Harus Ditolak',
            'category_id' => $this->category->id,
            'story' => 'Cerita program kedua.',
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
        ])
        ->assertSessionHasErrors('title');
});

it('frees up slot when program is completed or closed manual', function () {
    // Create a completed program
    $program = Program::create([
        'title' => ['id' => 'Program Selesai'],
        'slug' => 'program-selesai',
        'program_code' => 'PRG-DONE-01',
        'story' => ['id' => 'Deskripsi program selesai'],
        'category_id' => $this->category->id,
        'created_by' => $this->individuUser->id,
        'campaigner_type' => 'individu',
        'campaigner_profile_id' => $this->individuProfile->id,
        'status' => 'completed',
        'cover_image' => 'cover.jpg',
    ]);

    expect($this->individuProfile->fresh()->active_programs_count)->toBe(0);
    expect($this->individuProfile->fresh()->hasAvailableSlot())->toBeTrue();

    // Now they can create a new program
    actingAs($this->individuUser)
        ->get(route('akun.programs.create'))
        ->assertSuccessful();
});

it('allows lembaga campaigner to create up to 3 programs and blocks 4th', function () {
    // Create 3 active programs
    for ($i = 1; $i <= 3; $i++) {
        Program::create([
            'title' => ['id' => "Program Lembaga {$i}"],
            'slug' => "program-lembaga-{$i}",
            'program_code' => "PRG-LMB-0{$i}",
            'story' => ['id' => "Deskripsi {$i}"],
            'category_id' => $this->category->id,
            'created_by' => $this->lembagaUser->id,
            'campaigner_type' => 'lembaga',
            'campaigner_profile_id' => $this->lembagaProfile->id,
            'status' => 'published',
            'cover_image' => 'cover.jpg',
        ]);
    }

    expect($this->lembagaProfile->fresh()->active_programs_count)->toBe(3);
    expect($this->lembagaProfile->fresh()->hasAvailableSlot())->toBeFalse();

    // 4th attempt should be blocked
    actingAs($this->lembagaUser)
        ->get(route('akun.programs.create'))
        ->assertRedirect(route('akun.programs.index'))
        ->assertSessionHas('error');

    actingAs($this->lembagaUser)
        ->post(route('akun.programs.store'), [
            'title' => 'Program Keempat Lembaga',
            'category_id' => $this->category->id,
            'story' => 'Cerita program.',
            'cover_image' => UploadedFile::fake()->image('cover.jpg'),
        ])
        ->assertSessionHasErrors('title');
});
