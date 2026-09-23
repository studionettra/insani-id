<?php

use App\Models\FinancialReport;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $managePerm = Permission::firstOrCreate(['name' => 'manage_financial_reports']);

    $this->adminRole->givePermissionTo($managePerm);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create();
    $this->admin->assignRole('Administrator');
});

it('can display financial reports index page for admin', function () {
    actingAs($this->admin)
        ->get('/admin/financial-reports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/FinancialReports/Index')
            ->has('reports.data')
            ->has('availableYears')
        );
});

it('can create a financial report with uploaded pdf and cover files', function () {
    Storage::fake('public');

    $pdfFile = UploadedFile::fake()->create('annual_report_2024.pdf', 2048, 'application/pdf');
    $coverFile = UploadedFile::fake()->image('cover_2024.jpg', 600, 800);

    actingAs($this->admin)
        ->post('/admin/financial-reports', [
            'title' => [
                'id' => 'Laporan Tahunan 2024 Yayasan Insani',
                'en' => 'Annual Report 2024 Insani Foundation',
            ],
            'report_year' => 2024,
            'category' => 'annual_report',
            'audit_status' => 'WTP (Wajar Tanpa Pengecualian)',
            'auditor_name' => 'KAP Heliantono & Rekan',
            'file' => $pdfFile,
            'cover_file' => $coverFile,
            'summary' => [
                'id' => 'Ringkasan laporan kinerja yayasan 2024.',
                'en' => 'Summary of foundation performance 2024.',
            ],
            'total_revenue' => 5000000000,
            'total_disbursement' => 4500000000,
            'beneficiaries_count' => 30000,
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $report = FinancialReport::where('report_year', 2024)->first();
    expect($report)->not->toBeNull();
    expect($report->getTranslation('title', 'id'))->toBe('Laporan Tahunan 2024 Yayasan Insani');
    expect($report->file_path)->not->toBeNull();
    expect($report->cover_image)->not->toBeNull();
    expect($report->total_revenue)->toBe(5000000000.0);

    Storage::disk('public')->assertExists($report->file_path);
    Storage::disk('public')->assertExists($report->cover_image);
});

it('can update financial report and clean up old file when replaced', function () {
    Storage::fake('public');

    $oldFile = UploadedFile::fake()->create('old_report.pdf', 1000, 'application/pdf');
    $oldPath = $oldFile->store('financial-reports/files', 'public');

    $report = FinancialReport::create([
        'title' => [
            'id' => 'Laporan Lama',
        ],
        'slug' => 'laporan-lama-2023',
        'report_year' => 2023,
        'category' => 'annual_report',
        'file_path' => $oldPath,
        'file_size' => 1000,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    Storage::disk('public')->assertExists($oldPath);

    $newFile = UploadedFile::fake()->create('new_report.pdf', 2000, 'application/pdf');

    actingAs($this->admin)
        ->put("/admin/financial-reports/{$report->id}", [
            'title' => [
                'id' => 'Laporan Baru Terupdate',
            ],
            'report_year' => 2023,
            'category' => 'audited_financial',
            'audit_status' => 'WTP (Wajar Tanpa Pengecualian)',
            'auditor_name' => 'KAP Baru',
            'file' => $newFile,
            'is_active' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $report->refresh();
    expect($report->getTranslation('title', 'id'))->toBe('Laporan Baru Terupdate');
    expect($report->category)->toBe('audited_financial');

    // Old file is removed, new file exists
    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($report->file_path);
});

it('can delete financial report along with storage files', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->create('to_delete.pdf', 500, 'application/pdf');
    $filePath = $file->store('financial-reports/files', 'public');

    $cover = UploadedFile::fake()->image('cover_to_delete.jpg');
    $coverPath = $cover->store('financial-reports/covers', 'public');

    $report = FinancialReport::create([
        'title' => ['id' => 'Laporan Dihapus'],
        'slug' => 'laporan-dihapus-2021',
        'report_year' => 2021,
        'category' => 'annual_report',
        'file_path' => $filePath,
        'cover_image' => $coverPath,
        'is_active' => true,
        'sort_order' => 99,
    ]);

    Storage::disk('public')->assertExists($filePath);
    Storage::disk('public')->assertExists($coverPath);

    actingAs($this->admin)
        ->delete("/admin/financial-reports/{$report->id}")
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(FinancialReport::find($report->id))->toBeNull();
    Storage::disk('public')->assertMissing($filePath);
    Storage::disk('public')->assertMissing($coverPath);
});

it('public about page provides dynamic financial reports', function () {
    $report = FinancialReport::factory()->create([
        'is_active' => true,
    ]);

    $response = get('/tentang-kami');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Public/About/Index')
        ->has('financialReports')
    );
});

it('download endpoint increments download counter and streams file', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->create('report_download.pdf', 800, 'application/pdf');
    $filePath = $file->store('financial-reports/files', 'public');

    $report = FinancialReport::create([
        'title' => ['id' => 'Laporan Download Test'],
        'slug' => 'laporan-download-test',
        'report_year' => 2024,
        'category' => 'annual_report',
        'file_path' => $filePath,
        'download_count' => 5,
        'is_active' => true,
    ]);

    $response = get("/laporan-keuangan/{$report->slug}/unduh");

    $response->assertOk();
    $report->refresh();
    expect($report->download_count)->toBe(6);
});

it('prevents unauthorized user from accessing admin financial reports', function () {
    $regularUser = User::factory()->create();

    actingAs($regularUser)
        ->get('/admin/financial-reports')
        ->assertForbidden();
});
