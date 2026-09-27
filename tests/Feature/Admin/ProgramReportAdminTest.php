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

    $this->cat = Category::create([
        'name' => 'Sosial',
        'slug' => 'sosial-slug',
    ]);

    $this->program = Program::create([
        'program_code' => 'PRG-ADM-001',
        'title' => 'Program Bantuan Operasi',
        'slug' => 'program-operasi',
        'category_id' => $this->cat->id,
        'campaigner_type' => 'individu',
        'created_by' => $this->admin->id,
        'target_amount' => 50000000,
        'collected_amount' => 10000000,
        'story' => 'Deskripsi program',
        'cover_image' => 'cover.jpg',
        'status' => 'published',
    ]);

    $this->reportCategory = ProgramReportCategory::create([
        'name' => ['id' => 'Penyalahgunaan dana'],
        'slug' => 'penyalahgunaan-dana',
        'is_active' => true,
        'sort_order' => 1,
    ]);
});

test('admin with permission can view program reports inbox', function () {
    ProgramReport::create([
        'program_id' => $this->program->id,
        'category_id' => $this->reportCategory->id,
        'reporter_name' => 'Siti Aminah',
        'reporter_phone' => '081234567890',
        'reporter_email' => 'siti@example.com',
        'description' => 'Ada kecurigaan penipuan pada kwitansi rumah sakit.',
        'status' => 'pending',
    ]);

    actingAs($this->admin)
        ->get('/admin/program-reports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/ProgramReports/Index')
            ->has('reports.data', 1)
            ->has('statusCounts')
            ->where('statusCounts.pending', 1)
        );
});

test('unauthorized user cannot access program reports inbox', function () {
    actingAs($this->regularUser)
        ->get('/admin/program-reports')
        ->assertForbidden();
});

test('admin can update report status and investigation notes', function () {
    $report = ProgramReport::create([
        'program_id' => $this->program->id,
        'category_id' => $this->reportCategory->id,
        'reporter_name' => 'Budi Santoso',
        'reporter_phone' => '081234567890',
        'reporter_email' => 'budi@example.com',
        'description' => 'Pasien sudah keluar dari rumah sakit minggu lalu.',
        'status' => 'pending',
    ]);

    actingAs($this->admin)
        ->put("/admin/program-reports/{$report->id}/status", [
            'status' => 'investigating',
            'admin_notes' => 'Sedang menghubungi pihak RS untuk konfirmasi tanggal keluar pasien.',
        ])
        ->assertRedirect();

    $report->refresh();
    expect($report->status)->toBe('investigating')
        ->and($report->admin_notes)->toContain('pihak RS')
        ->and($report->reviewed_by)->toBe($this->admin->id);
});

test('admin can takedown program from report action', function () {
    $report = ProgramReport::create([
        'program_id' => $this->program->id,
        'category_id' => $this->reportCategory->id,
        'reporter_name' => 'Donatur Curiga',
        'reporter_phone' => '081234567890',
        'reporter_email' => 'donatur@example.com',
        'description' => 'Laporan palsu terbukti.',
        'status' => 'investigating',
    ]);

    actingAs($this->admin)
        ->post("/admin/program-reports/{$report->id}/takedown", [
            'reason' => 'Kwitansi terbukti diedit menggunakan Photoshop.',
        ])
        ->assertRedirect();

    $this->program->refresh();
    $report->refresh();

    expect($this->program->status)->toBe('closed_manual')
        ->and($this->program->closed_at)->not->toBeNull()
        ->and($this->program->rejection_notes)->toContain('Photoshop')
        ->and($report->status)->toBe('resolved');
});

test('admin can delete a report record', function () {
    $report = ProgramReport::create([
        'program_id' => $this->program->id,
        'category_id' => $this->reportCategory->id,
        'reporter_name' => 'Spam Tester',
        'reporter_phone' => '081234567890',
        'reporter_email' => 'spam@example.com',
        'description' => 'Laporan uji coba.',
        'status' => 'dismissed',
    ]);

    actingAs($this->admin)
        ->delete("/admin/program-reports/{$report->id}")
        ->assertRedirect();

    expect(ProgramReport::where('id', $report->id)->exists())->toBeFalse();
});
