<?php

namespace Database\Factories;

use App\Models\Program;
use App\Models\ProgramUpdate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProgramUpdate>
 */
class ProgramUpdateFactory extends Factory
{
    protected $model = ProgramUpdate::class;

    public function definition(): array
    {
        return [
            'program_id' => Program::factory(),
            'title' => fake()->sentence(4),
            'content' => fake()->paragraphs(3, true),
            'created_by' => User::factory(),
            'is_published' => true,
        ];
    }
}
