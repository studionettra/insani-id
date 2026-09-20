<?php

use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use App\Services\TranslationService;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->adminRole = Role::firstOrCreate(['name' => 'Administrator']);
    $manageProgramPerm = Permission::firstOrCreate(['name' => 'manage_program']);
    $manageBlogPerm = Permission::firstOrCreate(['name' => 'manage_blog']);

    $this->adminRole->givePermissionTo([$manageProgramPerm, $manageBlogPerm]);
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $this->admin = User::factory()->create(['name' => 'Admin Penerjemah']);
    $this->admin->assignRole('Administrator');
});

it('translates text using TranslationService with fake response', function () {
    Http::fake([
        'https://translate.googleapis.com/translate_a/single*' => Http::response([
            [['Building Mosque for Quran Memorizers', 'Bangun Masjid Penghafal Al Quran', null, null, 1]],
            null,
            'id',
        ], 200),
    ]);

    $service = new TranslationService;
    $result = $service->translateText('Bangun Masjid Penghafal Al Quran', 'en', 'id');

    expect($result)->toBe('Building Mosque for Quran Memorizers');
});

it('translates HTML and preserves tags using TranslationService', function () {
    Http::fake([
        'https://translate.googleapis.com/translate_a/single*' => Http::response([
            [['Hello world', 'Halo dunia', null, null, 1]],
            null,
            'id',
        ], 200),
    ]);

    $service = new TranslationService;
    $html = '<p>Halo dunia</p>';
    $result = $service->translateHtml($html, 'en', 'id');

    expect($result)->toContain('<p>')
        ->toContain('</p>')
        ->toContain('Hello world');
});

it('blocks unauthenticated requests to auto-translate endpoint', function () {
    $this->postJson('/admin/auto-translate', [
        'fields' => ['title' => 'Judul Tes'],
    ])->assertUnauthorized();
});

it('allows authorized admin to call auto-translate endpoint', function () {
    Http::fake([
        'https://translate.googleapis.com/translate_a/single*' => Http::response([
            [['Translated text', 'Teks sumber', null, null, 1]],
            null,
            'id',
        ], 200),
    ]);

    actingAs($this->admin)
        ->postJson('/admin/auto-translate', [
            'fields' => [
                'title' => 'Teks sumber',
                'excerpt' => 'Ringkasan sumber',
            ],
        ])
        ->assertOk()
        ->assertJson([
            'success' => true,
        ])
        ->assertJsonStructure([
            'success',
            'translations' => [
                'title' => ['id', 'en', 'ar'],
                'excerpt' => ['id', 'en', 'ar'],
            ],
        ]);
});

it('validates fields payload for auto-translate endpoint', function () {
    actingAs($this->admin)
        ->postJson('/admin/auto-translate', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['fields']);
});

it('stores and retrieves multi-language fields on BlogPostCache', function () {
    $blog = BlogPostCache::create([
        'title' => [
            'id' => 'Kabar Gembira',
            'en' => 'Good News',
            'ar' => 'أخبار سارة',
        ],
        'slug' => 'kabar-gembira-test',
        'excerpt' => [
            'id' => 'Ringkasan berita.',
            'en' => 'News summary.',
            'ar' => 'ملخص الأخبار.',
        ],
        'content_html' => [
            'id' => '<p>Konten bahasa Indonesia</p>',
            'en' => '<p>English content</p>',
            'ar' => '<p>محتوى باللغة العربية</p>',
        ],
        'wp_category' => 'Kemanusiaan',
        'status' => 'published',
        'published_at' => now(),
    ]);

    expect($blog->getTranslation('title', 'id'))->toBe('Kabar Gembira');
    expect($blog->getTranslation('title', 'en'))->toBe('Good News');
    expect($blog->getTranslation('title', 'ar'))->toBe('أخبار سارة');

    expect($blog->getTranslation('excerpt', 'en'))->toBe('News summary.');
    expect($blog->getTranslation('content_html', 'ar'))->toBe('<p>محتوى باللغة العربية</p>');
});

it('stores and retrieves multi-language fields on Program', function () {
    $category = Category::firstOrCreate(
        ['slug' => 'dakwah-pendidikan'],
        ['name' => 'Dakwah & Pendidikan', 'is_active' => true]
    );

    $program = Program::create([
        'title' => [
            'id' => 'Pahala Jariyah Bangun Masjid',
            'en' => 'Continuous Reward Mosque Construction',
            'ar' => 'أجر جاري لبناء مسجد',
        ],
        'slug' => 'pahala-jariyah-bangun-masjid-test',
        'story' => [
            'id' => '<p>Cerita lengkap pembangunan masjid.</p>',
            'en' => '<p>Complete story of mosque construction.</p>',
            'ar' => '<p>القصة الكاملة لبناء المسجد.</p>',
        ],
        'category_id' => $category->id,
        'created_by' => $this->admin->id,
        'campaigner_type' => 'yayasan',
        'cover_image' => 'programs/test.jpg',
        'status' => 'published',
        'target_amount' => 500000000,
        'program_code' => 'PRG-TEST-001',
    ]);

    expect($program->getTranslation('title', 'id'))->toBe('Pahala Jariyah Bangun Masjid');
    expect($program->getTranslation('title', 'en'))->toBe('Continuous Reward Mosque Construction');
    expect($program->getTranslation('title', 'ar'))->toBe('أجر جاري لبناء مسجد');

    expect($program->getTranslation('story', 'en'))->toContain('Complete story');
    expect($program->getTranslation('story', 'ar'))->toContain('القصة الكاملة');
});
