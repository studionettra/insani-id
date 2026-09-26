<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\ProgramUpdate;
use App\Models\User;
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

    $this->otherUser = User::factory()->create();

    $this->category = Category::create([
        'name' => ['id' => 'Kategori Kebaikan'],
        'slug' => 'kategori-kebaikan',
    ]);

    // Program created by Superadmin
    $this->adminProgram = Program::create([
        'title' => ['id' => 'Program Internal Superadmin'],
        'slug' => 'program-internal-superadmin',
        'program_code' => 'PRG-ADM-01',
        'story' => ['id' => 'Cerita program admin'],
        'category_id' => $this->category->id,
        'created_by' => $this->admin->id,
        'campaigner_type' => 'internal',
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);

    // Program created by other campaigner (external)
    $this->externalProgram = Program::create([
        'title' => ['id' => 'Program Milik Campaigner Luar'],
        'slug' => 'program-milik-campaigner-luar',
        'program_code' => 'PRG-EXT-01',
        'story' => ['id' => 'Cerita program eksternal'],
        'category_id' => $this->category->id,
        'created_by' => $this->otherUser->id,
        'campaigner_type' => 'individual',
        'status' => 'published',
        'cover_image' => 'cover.jpg',
    ]);
});

it('allows superadmin to view updates on a program they created', function () {
    actingAs($this->admin)
        ->get(route('admin.programs.updates.index', $this->adminProgram->id))
        ->assertSuccessful();
});

it('allows superadmin to create an update on a program they created', function () {
    actingAs($this->admin)
        ->post(route('admin.programs.updates.store', $this->adminProgram->id), [
            'title' => 'Penyaluran Tahap 1 Sukses',
            'content' => '<p>Alhamdulillah dana telah disalurkan kepada penerima manfaat.</p>',
            'is_published' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('program_updates', [
        'program_id' => $this->adminProgram->id,
        'title->id' => 'Penyaluran Tahap 1 Sukses',
        'created_by' => $this->admin->id,
        'is_published' => true,
    ]);
});

it('allows superadmin to store multilingual updates with ID, EN, and AR', function () {
    actingAs($this->admin)
        ->post(route('admin.programs.updates.store', $this->adminProgram->id), [
            'title' => [
                'id' => 'Penyaluran Bantuan Sembako',
                'en' => 'Distribution of Food Aid',
                'ar' => 'توزيع المساعدات الغذائية',
            ],
            'content' => [
                'id' => '<p>Bantuan disalurkan di lokasi A.</p>',
                'en' => '<p>Aid was distributed at location A.</p>',
                'ar' => '<p>تم توزيع المساعدات في الموقع أ.</p>',
            ],
            'is_published' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('program_updates', [
        'program_id' => $this->adminProgram->id,
        'title->id' => 'Penyaluran Bantuan Sembako',
        'title->en' => 'Distribution of Food Aid',
        'title->ar' => 'توزيع المساعدات الغذائية',
        'created_by' => $this->admin->id,
    ]);
});

it('allows superadmin to edit and delete an update on a program they created', function () {
    $update = ProgramUpdate::create([
        'program_id' => $this->adminProgram->id,
        'title' => 'Judul Awal',
        'content' => '<p>Konten awal</p>',
        'is_published' => false,
        'created_by' => $this->admin->id,
    ]);

    actingAs($this->admin)
        ->put(route('admin.programs.updates.update', [$this->adminProgram->id, $update->id]), [
            'title' => 'Judul Diperbarui',
            'content' => '<p>Konten diperbarui</p>',
            'is_published' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('program_updates', [
        'id' => $update->id,
        'title->id' => 'Judul Diperbarui',
        'is_published' => true,
    ]);

    actingAs($this->admin)
        ->delete(route('admin.programs.updates.destroy', [$this->adminProgram->id, $update->id]))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('program_updates', [
        'id' => $update->id,
    ]);
});

it('strictly forbids superadmin from viewing or managing updates on programs created by other campaigners', function () {
    // 1. Cannot view updates of other campaigner
    actingAs($this->admin)
        ->get(route('admin.programs.updates.index', $this->externalProgram->id))
        ->assertForbidden();

    // 2. Cannot store update on other campaigner's program
    actingAs($this->admin)
        ->post(route('admin.programs.updates.store', $this->externalProgram->id), [
            'title' => 'Update Ilegal',
            'content' => '<p>Mencoba update program orang lain</p>',
            'is_published' => true,
        ])
        ->assertForbidden();

    // Create an update on other campaigner's program
    $otherUpdate = ProgramUpdate::create([
        'program_id' => $this->externalProgram->id,
        'title' => 'Kabar Asli Campaigner',
        'content' => '<p>Laporan asli</p>',
        'is_published' => true,
        'created_by' => $this->otherUser->id,
    ]);

    // 3. Cannot edit other campaigner's update
    actingAs($this->admin)
        ->put(route('admin.programs.updates.update', [$this->externalProgram->id, $otherUpdate->id]), [
            'title' => 'Percobaan Bajak Judul',
            'content' => '<p>Konten dibajak</p>',
            'is_published' => true,
        ])
        ->assertForbidden();

    // 4. Cannot delete other campaigner's update
    actingAs($this->admin)
        ->delete(route('admin.programs.updates.destroy', [$this->externalProgram->id, $otherUpdate->id]))
        ->assertForbidden();

    // Verify database remains untouched
    $this->assertDatabaseHas('program_updates', [
        'id' => $otherUpdate->id,
        'title->id' => 'Kabar Asli Campaigner',
    ]);
});
