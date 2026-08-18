<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Program>
 */
class ProgramFactory extends Factory
{
    protected $model = Program::class;

    public function definition(): array
    {
        return [
            'program_code' => 'PRG-'.date('Ymd').'-'.strtoupper(Str::random(4)),
            'title' => fake()->sentence(3),
            'slug' => Str::slug(fake()->sentence(3)).'-'.Str::random(4),
            'category_id' => Category::factory(),
            'campaigner_type' => fake()->randomElement(['individu', 'lembaga', 'internal']),
            'campaigner_profile_id' => null,
            'created_by' => User::factory(),
            'verified_by' => null,
            'target_amount' => fake()->numberBetween(100000, 100000000),
            'collected_amount' => 0,
            'deadline' => fake()->dateTimeBetween('+1 month', '+1 year')->format('Y-m-d'),
            'story' => fake()->paragraphs(3, true),
            'cover_image' => 'programs/covers/default.jpg',
            'video_url' => fake()->optional()->url(),
            'status' => 'draft',
            'rejection_notes' => null,
            'published_at' => null,
            'closed_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending_verification',
        ]);
    }
}
