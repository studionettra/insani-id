<?php

namespace Database\Factories;

use App\Models\Fundraiser;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Fundraiser>
 */
class FundraiserFactory extends Factory
{
    protected $model = Fundraiser::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'program_id' => Program::factory(),
            'referral_code' => Str::slug(fake()->userName()).'-'.Str::lower(Str::random(5)),
            'target_amount' => fake()->numberBetween(500000, 10000000),
            'personal_message' => fake()->sentence(),
            'collected_amount' => 0,
            'donors_count' => 0,
            'is_active' => true,
        ];
    }
}
