<?php

namespace Database\Factories;

use App\Models\Donation;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Donation>
 */
class DonationFactory extends Factory
{
    protected $model = Donation::class;

    public function definition(): array
    {
        $amount = fake()->numberBetween(10000, 5000000);
        $channel = fake()->randomElement(['online', 'offline']);
        $uniqueCode = $channel === 'offline' ? fake()->numberBetween(101, 999) : null;

        return [
            'donation_code' => 'DON-'.strtoupper(Str::random(10)),
            'program_id' => Program::factory(),
            'donor_user_id' => User::factory(),
            'donor_name' => fake()->name(),
            'donor_email' => fake()->unique()->safeEmail(),
            'donor_phone' => '08'.fake()->numerify('##########'),
            'is_anonymous' => fake()->boolean(),
            'message' => fake()->optional()->sentence(),
            'amount' => $amount + ($uniqueCode ?? 0),
            'unique_code' => $uniqueCode,
            'channel' => $channel,
            'status' => fake()->randomElement(['pending', 'paid', 'expired', 'failed', 'refunded']),
            'paid_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
