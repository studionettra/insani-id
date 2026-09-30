<?php

use App\Models\CampaignerProfile;
use App\Models\Category;
use App\Models\Program;
use App\Models\ProgramUpdate;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $viewProgramPerm = Permission::firstOrCreate(['name' => 'program.view']);
    $this->adminRole->givePermissionTo($viewProgramPerm);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->category = Category::create([
        'name' => ['id' => 'Kategori Kebaikan'],
        'slug' => 'kategori-kebaikan',
    ]);
});

it('allows admin to view an internal program detail without updates', function () {
    $program = Program::create([
        'title' => ['id' => 'Program Internal Superadmin'],
        'slug' => 'program-internal-superadmin',
        'program_code' => 'PRG-ADM-001',
        'story' => ['id' => 'Cerita program admin'],
        'category_id' => $this->category->id,
        'created_by' => $this->admin->id,
        'campaigner_type' => 'internal',
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);

    actingAs($this->admin)
        ->get(route('admin.programs.show', $program->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Programs/Show')
            ->has('program')
            ->where('program.id', $program->id)
            ->where('program.updates', [])
        );
});

it('allows admin to view an individual campaigner program detail with translatable updates without serialization error', function () {
    $campaigner = User::factory()->create(['name' => 'Ubi Campaigner']);
    $profile = CampaignerProfile::create([
        'user_id' => $campaigner->id,
        'type' => 'individu',
        'verification_status' => 'verified',
        'phone' => '08123456789',
        'bank_name' => 'BCA',
        'bank_account_number' => '1234567890',
        'bank_account_name' => 'Ubi Campaigner',
    ]);

    $program = Program::create([
        'title' => ['id' => 'Bantu Pendidikan Anak Bangsa'],
        'slug' => 'bantu-pendidikan-anak-bangsa',
        'program_code' => 'PRG-IND-001',
        'story' => ['id' => 'Cerita lengkap kebutuhan donasi'],
        'category_id' => $this->category->id,
        'created_by' => $campaigner->id,
        'campaigner_profile_id' => $profile->id,
        'campaigner_type' => 'individual',
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);

    $update = ProgramUpdate::create([
        'program_id' => $program->id,
        'title' => [
            'id' => 'Penyaluran Tahap Pertama',
            'en' => 'First Phase Distribution',
        ],
        'content' => [
            'id' => '<p>Bantuan telah disalurkan sebesar 5 juta rupiah.</p>',
            'en' => '<p>Aid has been distributed amounting to 5 million rupiah.</p>',
        ],
        'created_by' => $campaigner->id,
        'is_published' => true,
    ]);

    actingAs($this->admin)
        ->get(route('admin.programs.show', $program->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Programs/Show')
            ->where('program.id', $program->id)
            ->has('program.updates', 1)
            ->where('program.updates.0.title', 'Penyaluran Tahap Pertama')
            ->where('program.updates.0.title_translations.id', 'Penyaluran Tahap Pertama')
            ->where('program.updates.0.title_translations.en', 'First Phase Distribution')
        );
});

it('allows admin to view a lembaga campaigner program detail with multiple updates', function () {
    $campaigner = User::factory()->create(['name' => 'PIC Lembaga']);
    $profile = CampaignerProfile::create([
        'user_id' => $campaigner->id,
        'type' => 'lembaga',
        'nama_lembaga' => 'Yayasan Insan Mandiri',
        'verification_status' => 'verified',
        'phone' => '08987654321',
        'bank_name' => 'Bank Mandiri',
        'bank_account_number' => '9876543210',
        'bank_account_name' => 'Yayasan Insan Mandiri',
    ]);

    $program = Program::create([
        'title' => ['id' => 'Program Pembangunan Fasilitas Air Bersih'],
        'slug' => 'fasilitas-air-bersih',
        'program_code' => 'PRG-LMB-001',
        'story' => ['id' => 'Cerita pembangunan sumur bor'],
        'category_id' => $this->category->id,
        'created_by' => $campaigner->id,
        'campaigner_profile_id' => $profile->id,
        'campaigner_type' => 'institution',
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);

    for ($i = 1; $i <= 4; $i++) {
        ProgramUpdate::create([
            'program_id' => $program->id,
            'title' => ['id' => "Laporan Kabar Perkembangan #{$i}"],
            'content' => ['id' => "<p>Progres pembangunan ke-{$i} telah mencapai tahap berikutnya.</p>"],
            'created_by' => $campaigner->id,
            'is_published' => true,
        ]);
    }

    actingAs($this->admin)
        ->get(route('admin.programs.show', $program->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Programs/Show')
            ->where('program.id', $program->id)
            ->has('program.updates', 4)
            ->where('program.campaigner_profile.nama_lembaga', 'Yayasan Insan Mandiri')
        );
});

it('serializes program update to array using active locale string for title and content', function () {
    $program = Program::create([
        'title' => ['id' => 'Program Test'],
        'slug' => 'program-test',
        'program_code' => 'PRG-TST-001',
        'story' => ['id' => 'Cerita test'],
        'category_id' => $this->category->id,
        'created_by' => $this->admin->id,
        'campaigner_type' => 'internal',
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);

    $update = ProgramUpdate::create([
        'program_id' => $program->id,
        'title' => [
            'id' => 'Judul Bahasa Indonesia',
            'en' => 'English Title',
        ],
        'content' => [
            'id' => '<p>Konten ID</p>',
            'en' => '<p>Content EN</p>',
        ],
        'created_by' => $this->admin->id,
        'is_published' => true,
    ]);

    $array = $update->fresh()->toArray();

    expect($array['title'])->toBe('Judul Bahasa Indonesia')
        ->and($array['content'])->toBe('<p>Konten ID</p>')
        ->and($array['title_translations']['en'])->toBe('English Title')
        ->and($array['content_translations']['en'])->toBe('<p>Content EN</p>');
});
