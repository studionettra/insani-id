<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $nameId = fake()->unique()->words(2, true);

        return [
            'name' => [
                'id' => $nameId,
                'en' => Str::studly($nameId),
                'ar' => fake()->word(),
            ],
            'slug' => Str::slug($nameId).'-'.Str::random(4),
            'description' => [
                'id' => fake()->sentence(),
                'en' => fake()->sentence(),
                'ar' => fake()->sentence(),
            ],
            'icon' => fake()->optional()->word(),
            'platform_fee_percent' => fake()->randomFloat(2, 0, 10),
            'is_disaster_category' => false,
            'is_focus_program' => false,
            'pillar_image' => null,
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
