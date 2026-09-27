<?php

use App\Models\Category;
use App\Models\Program;
use App\Models\ProgramReport;
use App\Models\ProgramReportCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\get;
use function Pest\Laravel\post;

beforeEach(function () {
    $this->turnstileSuccess = true;
    Http::fake([
        'challenges.cloudflare.com/*' => fn () => Http::response(['success' => $this->turnstileSuccess]),
    ]);

    $this->user = User::factory()->create();
    $this->cat = Category::create([
        'name' => 'Kemanusiaan',
        'slug' => 'kemanusiaan',
    ]);

    $this->program = Program::create([
        'program_code' => 'PRG-PUB-001',
        'title' => 'Bantu Korban Bencana',
        'slug' => 'bantu-korban-bencana',
        'category_id' => $this->cat->id,
        'campaigner_type' => 'individu',
        'created_by' => $this->user->id,
        'target_amount' => 20000000,
        'collected_amount' => 5000000,
        'story' => 'Deskripsi bantuan bencana alam.',
        'cover_image' => 'cover.jpg',
        'status' => 'published',
    ]);

    $this->reportCategory = ProgramReportCategory::create([
        'name' => [
            'id' => 'Penyalahgunaan dana',
            'en' => 'Misuse of funds',
        ],
        'slug' => 'penyalahgunaan-dana',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $this->inactiveCategory = ProgramReportCategory::create([
        'name' => [
            'id' => 'Kategori Nonaktif',
        ],
        'slug' => 'kategori-nonaktif',
        'is_active' => false,
        'sort_order' => 99,
    ]);
});

test('public user can view report form with active categories only', function () {
    get("/program/{$this->program->slug}/lapor")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Public/Program/Report')
            ->has('categories', 1)
            ->where('categories.0.slug', 'penyalahgunaan-dana')
            ->where('program.slug', 'bantu-korban-bencana')
        );
});

test('public user can submit a valid report with file attachments and turnstile token', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('bukti_transfer.jpg');

    post("/program/{$this->program->slug}/lapor", [
        'reporter_name' => 'Ahmad Fauzi',
        'reporter_phone' => '081298765432',
        'reporter_email' => 'ahmad@example.com',
        'category_id' => $this->reportCategory->id,
        'description' => 'Saya menemukan bukti bahwa foto yang digunakan diambil dari internet tahun 2018.',
        'evidence' => [$file],
        'cf-turnstile-response' => 'valid-turnstile-token',
    ])
        ->assertRedirect()
        ->assertSessionHas('ticket_number');

    $report = ProgramReport::first();
    expect($report)->not->toBeNull()
        ->and($report->reporter_name)->toBe('Ahmad Fauzi')
        ->and($report->reporter_phone)->toBe('081298765432')
        ->and($report->program_id)->toBe($this->program->id)
        ->and($report->category_id)->toBe($this->reportCategory->id)
        ->and($report->status)->toBe('pending')
        ->and($report->evidence_files)->toBeArray()
        ->and(count($report->evidence_files))->toBe(1);

    Storage::disk('public')->assertExists($report->evidence_files[0]['path']);
});

test('report submission fails validation if turnstile token is missing', function () {
    post("/program/{$this->program->slug}/lapor", [
        'reporter_name' => 'Ahmad Fauzi',
        'reporter_phone' => '081298765432',
        'reporter_email' => 'ahmad@example.com',
        'category_id' => $this->reportCategory->id,
        'description' => 'Detail laporan lengkap panjang lebih dari 10 karakter.',
    ])
        ->assertSessionHasErrors(['cf-turnstile-response']);

    expect(ProgramReport::count())->toBe(0);
});

test('report submission fails if turnstile verification fails from cloudflare', function () {
    $this->turnstileSuccess = false;

    $response = $this->from("/program/{$this->program->slug}/lapor")
        ->post("/program/{$this->program->slug}/lapor", [
            'reporter_name' => 'Ahmad Fauzi',
            'reporter_phone' => '081298765432',
            'reporter_email' => 'ahmad@example.com',
            'category_id' => $this->reportCategory->id,
            'description' => 'Detail laporan lengkap panjang lebih dari 10 karakter.',
            'cf-turnstile-response' => 'invalid-token',
        ]);

    $response->assertSessionHasErrors(['cf-turnstile-response']);

    expect(ProgramReport::count())->toBe(0);
});

test('report submission fails validation if description is too short or email invalid', function () {
    post("/program/{$this->program->slug}/lapor", [
        'reporter_name' => 'Ahmad',
        'reporter_phone' => '081234',
        'reporter_email' => 'invalid-email',
        'category_id' => $this->reportCategory->id,
        'description' => 'Pendek',
        'cf-turnstile-response' => 'token',
    ])
        ->assertSessionHasErrors(['reporter_phone', 'reporter_email', 'description']);

    expect(ProgramReport::count())->toBe(0);
});

test('honeypot triggers silent rejection for bot submissions', function () {
    post("/program/{$this->program->slug}/lapor", [
        'reporter_name' => 'Spam Bot',
        'reporter_phone' => '081234567890',
        'reporter_email' => 'bot@spammer.com',
        'category_id' => $this->reportCategory->id,
        'description' => 'Spamming advertisement link here',
        'website' => 'http://spam-link.com', // Honeypot filled
        'cf-turnstile-response' => 'token',
    ])
        ->assertRedirect()
        ->assertSessionHas('ticket_number', 'RPT-BOT-IGNORED');

    expect(ProgramReport::count())->toBe(0);
});
