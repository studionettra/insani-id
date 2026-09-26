<?php

use App\Models\CampaignerProfile;
use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $viewPerm = Permission::firstOrCreate(['name' => 'program.view']);
    $this->adminRole->givePermissionTo($viewPerm);

    $this->admin = User::factory()->create(['name' => 'Admin Insani']);
    $this->admin->assignRole('Administrator');

    $this->categoryA = Category::create([
        'name' => ['id' => 'Kesehatan', 'en' => 'Health'],
        'slug' => 'kesehatan',
        'is_active' => true,
    ]);

    $this->categoryB = Category::create([
        'name' => ['id' => 'Pendidikan', 'en' => 'Education'],
        'slug' => 'pendidikan',
        'is_active' => true,
    ]);

    // Internal Program
    $this->internalProgram = Program::create([
        'title' => ['id' => 'Program Operasi Katarak Gratis'],
        'slug' => 'program-operasi-katarak-gratis',
        'program_code' => 'PRG-INT-001',
        'story' => ['id' => 'Deskripsi program'],
        'category_id' => $this->categoryA->id,
        'created_by' => $this->admin->id,
        'campaigner_type' => 'internal',
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);

    // Lembaga Program
    $lembagaUser = User::factory()->create(['name' => 'Staff Yayasan Mitra']);
    $lembagaProfile = CampaignerProfile::create([
        'user_id' => $lembagaUser->id,
        'type' => 'lembaga',
        'verification_status' => 'verified',
        'nama_lembaga' => 'Yayasan Peduli Yatim',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Yayasan Peduli Yatim',
    ]);

    $this->lembagaProgram = Program::create([
        'title' => ['id' => 'Santunan 1000 Anak Yatim'],
        'slug' => 'santunan-1000-anak-yatim',
        'program_code' => 'PRG-LMB-001',
        'story' => ['id' => 'Deskripsi santunan'],
        'category_id' => $this->categoryB->id,
        'created_by' => $lembagaUser->id,
        'campaigner_profile_id' => $lembagaProfile->id,
        'campaigner_type' => 'lembaga',
        'status' => 'pending_verification',
        'cover_image' => 'cover.jpg',
    ]);

    // Individu Program
    $individuUser = User::factory()->create(['name' => 'Budi Santoso']);
    $this->individuProgram = Program::create([
        'title' => ['id' => 'Bantu Biaya Berobat Adik Dafa'],
        'slug' => 'bantu-biaya-berobat-adik-dafa',
        'program_code' => 'PRG-IND-001',
        'story' => ['id' => 'Deskripsi berobat'],
        'category_id' => $this->categoryA->id,
        'created_by' => $individuUser->id,
        'campaigner_type' => 'individu',
        'status' => 'completed',
        'cover_image' => 'cover.jpg',
    ]);
});

it('renders program index with counts, categories, and filters', function () {
    actingAs($this->admin)
        ->get('/admin/programs')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Programs/Index')
            ->has('programs.data', 3)
            ->where('counts.all', 3)
            ->where('counts.internal', 1)
            ->where('counts.lembaga', 1)
            ->where('counts.individu', 1)
            ->where('counts.pending_verification', 1)
            ->has('categories', 2)
        );
});

it('filters programs by campaigner type internal', function () {
    actingAs($this->admin)
        ->get('/admin/programs?type=internal')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('programs.data', 1)
            ->where('programs.data.0.program_code', 'PRG-INT-001')
        );
});

it('filters programs by campaigner type lembaga', function () {
    actingAs($this->admin)
        ->get('/admin/programs?type=lembaga')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('programs.data', 1)
            ->where('programs.data.0.program_code', 'PRG-LMB-001')
        );
});

it('filters programs by status pending_verification', function () {
    actingAs($this->admin)
        ->get('/admin/programs?status=pending_verification')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('programs.data', 1)
            ->where('programs.data.0.program_code', 'PRG-LMB-001')
        );
});

it('filters programs by search keyword on title, code, and lembaga name', function () {
    actingAs($this->admin)
        ->get('/admin/programs?search=Katarak')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('programs.data', 1)
            ->where('programs.data.0.program_code', 'PRG-INT-001')
        );

    actingAs($this->admin)
        ->get('/admin/programs?search=Peduli Yatim')
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('programs.data', 1)
            ->where('programs.data.0.program_code', 'PRG-LMB-001')
        );
});

it('filters programs by category', function () {
    actingAs($this->admin)
        ->get('/admin/programs?category_id='.$this->categoryB->id)
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('programs.data', 1)
            ->where('programs.data.0.program_code', 'PRG-LMB-001')
        );
});
