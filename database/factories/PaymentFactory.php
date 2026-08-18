<?php

namespace Database\Factories;

use App\Models\Donation;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'donation_id' => Donation::factory(),
            'payment_method' => fake()->randomElement(['virtual_account', 'ewallet', 'qris', 'credit_card', 'bank_transfer_manual']),
            'gateway' => fake()->randomElement(['xendit', 'midtrans', 'manual']),
            'gateway_reference_id' => fake()->optional()->uuid(),
            'gateway_status' => fake()->randomElement(['PENDING', 'PAID', 'EXPIRED', 'FAILED']),
            'paid_amount' => null,
            'paid_at' => null,
            'confirmed_by' => null,
            'raw_payload' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'gateway_status' => 'PAID',
            'paid_amount' => fake()->numberBetween(10000, 5000000),
            'paid_at' => now(),
        ]);
    }
}
