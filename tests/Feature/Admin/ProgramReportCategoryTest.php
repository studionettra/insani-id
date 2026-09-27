<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\ProgramReport;
use App\Models\ProgramReportCategory;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $managePerm = Permission::firstOrCreate(['name' => 'program_report.manage']);
    $this->adminRole->givePermissionTo($managePerm);

    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');

    $this->regularUser = User::factory()->create();
});

test('admin with permission can view program report categories', function () {
    ProgramReportCategory::create([
        'name' => [
            'id' => 'Penyalahgunaan dana',
            'en' => 'Misuse of funds',
        ],
        'slug' => 'penyalahgunaan-dana',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->get('/admin/program-report-categories')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/ProgramReports/Categories')
            ->has('categories.data', 1)
        );
});

test('unauthorized user cannot access program report categories', function () {
    actingAs($this->regularUser)
        ->get('/admin/program-report-categories')
        ->assertForbidden();
});

test('admin can create a new program report category with translations', function () {
    actingAs($this->admin)
        ->post('/admin/program-report-categories', [
            'name' => [
                'id' => 'Informasi Palsu',
                'en' => 'False Information',
                'ar' => 'معلومات كاذبة',
            ],
            'description' => [
                'id' => 'Deskripsi informasi palsu',
                'en' => 'False info description',
            ],
            'is_active' => true,
            'sort_order' => 2,
        ])
        ->assertRedirect();

    $category = ProgramReportCategory::where('slug', 'informasi-palsu')->first();
    expect($category)->not->toBeNull()
        ->and($category->getTranslation('name', 'id'))->toBe('Informasi Palsu')
        ->and($category->getTranslation('name', 'en'))->toBe('False Information')
        ->and($category->getTranslation('name', 'ar'))->toBe('معلومات كاذبة')
        ->and($category->sort_order)->toBe(2);
});

test('admin can update program report category and toggle active status', function () {
    $category = ProgramReportCategory::create([
        'name' => [
            'id' => 'Kategori Awal',
            'en' => 'Initial Category',
        ],
        'slug' => 'kategori-awal',
        'is_active' => true,
        'sort_order' => 5,
    ]);

    // Update
    actingAs($this->admin)
        ->put("/admin/program-report-categories/{$category->id}", [
            'name' => [
                'id' => 'Kategori Diperbarui',
                'en' => 'Updated Category',
            ],
            'description' => [
                'id' => 'Deskripsi baru',
            ],
            'is_active' => true,
            'sort_order' => 10,
        ])
        ->assertRedirect();

    $category->refresh();
    expect($category->getTranslation('name', 'id'))->toBe('Kategori Diperbarui')
        ->and($category->sort_order)->toBe(10);

    // Toggle Active
    actingAs($this->admin)
        ->patch("/admin/program-report-categories/{$category->id}/toggle-active")
        ->assertRedirect();

    $category->refresh();
    expect($category->is_active)->toBeFalse();
});

test('admin cannot delete category if reports exist', function () {
    $user = User::factory()->create();
    $cat = Category::create([
        'name' => 'Kesehatan',
        'slug' => 'kesehatan-cat',
    ]);

    $program = Program::create([
        'program_code' => 'PRG-TEST-002',
        'title' => 'Program Uji',
        'slug' => 'program-uji',
        'category_id' => $cat->id,
        'campaigner_type' => 'individu',
        'created_by' => $user->id,
        'target_amount' => 5000000,
        'collected_amount' => 0,
        'story' => 'Deskripsi cerita',
        'cover_image' => 'cover.jpg',
        'status' => 'published',
    ]);

    $reportCat = ProgramReportCategory::create([
        'name' => ['id' => 'Kategori Terkait'],
        'slug' => 'kategori-terkait',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    ProgramReport::create([
        'program_id' => $program->id,
        'category_id' => $reportCat->id,
        'reporter_name' => 'Pelapor A',
        'reporter_phone' => '08123456789',
        'reporter_email' => 'pelapor@example.com',
        'description' => 'Ada kecurigaan',
        'status' => 'pending',
    ]);

    // Try deleting
    actingAs($this->admin)
        ->delete("/admin/program-report-categories/{$reportCat->id}")
        ->assertSessionHas('error');

    expect(ProgramReportCategory::where('id', $reportCat->id)->exists())->toBeTrue();
});

test('admin can delete category if no reports exist', function () {
    $reportCat = ProgramReportCategory::create([
        'name' => ['id' => 'Kategori Bebas'],
        'slug' => 'kategori-bebas',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    actingAs($this->admin)
        ->delete("/admin/program-report-categories/{$reportCat->id}")
        ->assertSessionHas('success');

    expect(ProgramReportCategory::where('id', $reportCat->id)->exists())->toBeFalse();
});
