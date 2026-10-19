<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\postJson;

it('requires authentication to upload rich text images', function () {
    $file = UploadedFile::fake()->image('test.jpg');

    postJson('/upload-image', ['image' => $file])
        ->assertUnauthorized();
});

it('uploads rich text image to public disk and returns valid public url', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('diagram.png', 1200, 800);

    $response = actingAs($user)
        ->postJson('/upload-image', ['image' => $file])
        ->assertOk()
        ->assertJsonStructure(['url']);

    $url = $response->json('url');
    expect($url)->toContain('uploads/rich-text/');

    $files = Storage::disk('public')->files('uploads/rich-text');
    expect($files)->toHaveCount(1);
    expect($files[0])->toEndWith('.webp');
});

it('validates that uploaded file must be an image', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    actingAs($user)
        ->postJson('/upload-image', ['image' => $file])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['image']);
});
