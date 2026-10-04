<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\ProgramReport;
use App\Models\ProgramReportCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    Storage::fake('public');

    Role::firstOrCreate(['name' => 'Administrator']);
    Permission::firstOrCreate(['name' => 'program_report.manage']);

    $category = Category::factory()->create();
    $this->program = Program::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
    ]);

    $this->reportCategory = ProgramReportCategory::create([
        'name' => 'Dugaan Penipuan',
        'slug' => 'dugaan-penipuan',
        'description' => 'Laporan terkait dugaan penipuan',
        'sort_order' => 1,
        'is_active' => true,
    ]);
});

test('whistleblower evidence file is stored on local private disk and not public disk', function () {
    $file = UploadedFile::fake()->image('bukti_chat.jpg');
    $path = $file->store('reports/'.date('Ym'), 'local');

    $report = ProgramReport::create([
        'program_id' => $this->program->id,
        'category_id' => $this->reportCategory->id,
        'reporter_name' => 'Pelapor Rahasia',
        'reporter_phone' => '081234567890',
        'reporter_email' => 'pelapor@example.com',
        'description' => 'Kecurigaan penyalahgunaan donasi.',
        'evidence_files' => [
            [
                'path' => $path,
                'original_name' => 'bukti_chat.jpg',
                'mime_type' => 'image/jpeg',
                'size' => 1024,
            ],
        ],
        'status' => 'pending',
    ]);

    expect($report->evidence_files)->toBeArray();
    Storage::disk('local')->assertExists($path);
    Storage::disk('public')->assertMissing($path);
});

test('guest cannot access admin program report evidence endpoint', function () {
    $path = UploadedFile::fake()->image('bukti.jpg')->store('reports/'.date('Ym'), 'local');

    $report = ProgramReport::create([
        'program_id' => $this->program->id,
        'category_id' => $this->reportCategory->id,
        'reporter_name' => 'Pelapor',
        'reporter_phone' => '081234567891',
        'reporter_email' => 'pelapor1@example.com',
        'description' => 'Deskripsi laporan.',
        'evidence_files' => [
            [
                'path' => $path,
                'original_name' => 'bukti.jpg',
                'mime_type' => 'image/jpeg',
                'size' => 1024,
            ],
        ],
        'status' => 'pending',
    ]);

    $response = $this->get(route('admin.program-reports.evidence', ['program_report' => $report->id, 'index' => 0]));
    $response->assertRedirect('/login');
});

test('user without program_report.manage permission cannot access evidence', function () {
    $regularUser = User::factory()->create();
    $path = UploadedFile::fake()->image('bukti.jpg')->store('reports/'.date('Ym'), 'local');

    $report = ProgramReport::create([
        'program_id' => $this->program->id,
        'category_id' => $this->reportCategory->id,
        'reporter_name' => 'Pelapor',
        'reporter_phone' => '081234567892',
        'reporter_email' => 'pelapor2@example.com',
        'description' => 'Deskripsi laporan.',
        'evidence_files' => [
            [
                'path' => $path,
                'original_name' => 'bukti.jpg',
                'mime_type' => 'image/jpeg',
                'size' => 1024,
            ],
        ],
        'status' => 'pending',
    ]);

    $response = $this->actingAs($regularUser)->get(
        route('admin.program-reports.evidence', ['program_report' => $report->id, 'index' => 0])
    );
    $response->assertForbidden();
});

test('admin with program_report.manage permission can view evidence', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');
    $admin->givePermissionTo('program_report.manage');

    $path = UploadedFile::fake()->image('bukti.jpg')->store('reports/'.date('Ym'), 'local');

    $report = ProgramReport::create([
        'program_id' => $this->program->id,
        'category_id' => $this->reportCategory->id,
        'reporter_name' => 'Pelapor',
        'reporter_phone' => '081234567893',
        'reporter_email' => 'pelapor3@example.com',
        'description' => 'Deskripsi laporan.',
        'evidence_files' => [
            [
                'path' => $path,
                'original_name' => 'bukti.jpg',
                'mime_type' => 'image/jpeg',
                'size' => 1024,
            ],
        ],
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->get(
        route('admin.program-reports.evidence', ['program_report' => $report->id, 'index' => 0])
    );
    $response->assertOk();
});

test('accessing invalid index or missing evidence file returns 404', function () {
    $admin = User::factory()->create();
    $admin->assignRole('Administrator');
    $admin->givePermissionTo('program_report.manage');

    $report = ProgramReport::create([
        'program_id' => $this->program->id,
        'category_id' => $this->reportCategory->id,
        'reporter_name' => 'Pelapor',
        'reporter_phone' => '081234567894',
        'reporter_email' => 'pelapor4@example.com',
        'description' => 'Deskripsi laporan.',
        'evidence_files' => [
            [
                'path' => 'reports/202610/missing_file.jpg',
                'original_name' => 'missing_file.jpg',
                'mime_type' => 'image/jpeg',
                'size' => 1024,
            ],
        ],
        'status' => 'pending',
    ]);

    // Invalid index -> 404
    $invalidIndexResponse = $this->actingAs($admin)->get(
        route('admin.program-reports.evidence', ['program_report' => $report->id, 'index' => 99])
    );
    $invalidIndexResponse->assertNotFound();

    // Physical file missing -> 404
    $missingFileResponse = $this->actingAs($admin)->get(
        route('admin.program-reports.evidence', ['program_report' => $report->id, 'index' => 0])
    );
    $missingFileResponse->assertNotFound();
});
