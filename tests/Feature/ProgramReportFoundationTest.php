<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\ProgramReport;
use App\Models\ProgramReportCategory;
use App\Models\User;
use Database\Seeders\ProgramReportCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('program report category seeder populates 14 multilingual categories', function () {
    $this->seed(ProgramReportCategorySeeder::class);

    expect(ProgramReportCategory::count())->toBe(14);

    $first = ProgramReportCategory::where('slug', 'penyalahgunaan-dana')->first();
    expect($first)->not->toBeNull()
        ->and($first->getTranslation('name', 'id'))->toBe('Penyalahgunaan dana')
        ->and($first->getTranslation('name', 'en'))->toBe('Misuse of funds')
        ->and($first->getTranslation('name', 'ar'))->toBe('إساءة استخدام الأموال')
        ->and($first->is_active)->toBeTrue()
        ->and($first->sort_order)->toBe(1);
});

test('program report generates a unique ticket number on creation', function () {
    $user = User::factory()->create();
    $cat = Category::create([
        'name' => 'Kesehatan',
        'slug' => 'kesehatan',
    ]);

    $program = Program::create([
        'program_code' => 'PRG-TEST-001',
        'title' => 'Bantu Pembangunan Sumur',
        'slug' => 'bantu-sumur',
        'category_id' => $cat->id,
        'campaigner_type' => 'individu',
        'created_by' => $user->id,
        'target_amount' => 10000000,
        'collected_amount' => 0,
        'story' => 'Deskripsi program sumur',
        'cover_image' => 'programs/sumur.jpg',
        'status' => 'published',
    ]);

    $reportCat = ProgramReportCategory::create([
        'name' => [
            'id' => 'Penyalahgunaan dana',
            'en' => 'Misuse of funds',
        ],
        'slug' => 'penyalahgunaan-dana',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $report = ProgramReport::create([
        'program_id' => $program->id,
        'category_id' => $reportCat->id,
        'reporter_name' => 'Budi Santoso',
        'reporter_phone' => '081234567890',
        'reporter_email' => 'budi@example.com',
        'description' => 'Diduga ada kecurigaan pemalsuan nota pembelian semen.',
        'status' => 'pending',
    ]);

    expect($report->ticket_number)->not->toBeEmpty()
        ->and($report->ticket_number)->toStartWith('RPT-')
        ->and($report->program->id)->toBe($program->id)
        ->and($report->category->id)->toBe($reportCat->id);

    // Test program has reports relation
    expect($program->reports()->count())->toBe(1);
});
