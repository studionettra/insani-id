<?php

use App\Models\BlogPostCache;
use Database\Seeders\KabarArchiveSeeder;
use Illuminate\Support\Facades\File;

it('ensures kabar_archive.json exists and contains 141 valid posts', function () {
    $jsonPath = database_path('data/kabar_archive.json');

    expect(File::exists($jsonPath))->toBeTrue();

    $content = File::get($jsonPath);
    $data = json_decode($content, true);

    expect($data)->toBeArray()
        ->and(count($data))->toBe(141);

    $first = $data[0];
    expect($first)->toHaveKeys([
        'slug',
        'title',
        'excerpt',
        'content_html',
        'featured_image_url',
        'wp_category',
        'status',
        'published_at',
    ]);
});

it('can run export command to generate archive file', function () {
    $this->seed(KabarArchiveSeeder::class);

    $tempFile = storage_path('framework/testing/test_kabar_export.json');
    File::ensureDirectoryExists(dirname($tempFile));

    $this->artisan('kabar:export-archive', ['--output' => $tempFile])
        ->assertSuccessful();

    expect(File::exists($tempFile))->toBeTrue();

    $data = json_decode(File::get($tempFile), true);
    expect($data)->toBeArray()
        ->and(count($data))->toBe(141);

    File::delete($tempFile);
});

it('seeds kabar archive accurately and idempotently', function () {
    // Jalankan seeder pertama kali
    $this->seed(KabarArchiveSeeder::class);

    $countFirst = BlogPostCache::count();
    expect($countFirst)->toBe(141);

    $samplePost = BlogPostCache::where('slug', 'berbagi-kebahagiaan-bersama-yatim')->first();
    expect($samplePost)->not->toBeNull();
    expect($samplePost->title)->toBe('Berbagi Kebahagiaan Bersama Yatim di Pelosok Negeri');
    expect($samplePost->wp_category)->toBe('Kabar Yatim');
    expect($samplePost->status)->toBe('published');

    // Pastikan translatable id/en/ar tersimpan
    $translations = $samplePost->getTranslations('title');
    expect($translations)->toHaveKey('id')
        ->and($translations['id'])->toBe('Berbagi Kebahagiaan Bersama Yatim di Pelosok Negeri');

    // Jalankan seeder kedua kali untuk membuktikan idempotensi
    $this->seed(KabarArchiveSeeder::class);

    $countSecond = BlogPostCache::count();
    expect($countSecond)->toBe($countFirst);
});
