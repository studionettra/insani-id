<?php

namespace Database\Factories;

use App\Models\Disbursement;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Disbursement>
 */
class DisbursementFactory extends Factory
{
    protected $model = Disbursement::class;

    public function definition(): array
    {
        $requestedAmount = fake()->numberBetween(10000, 5000000);
        $platformFeePercent = fake()->randomFloat(2, 0, 10);
        $platformFeeAmount = $requestedAmount * ($platformFeePercent / 100);
        $nettAmount = $requestedAmount - $platformFeeAmount;

        return [
            'program_id' => Program::factory(),
            'requested_amount' => $requestedAmount,
            'bank_name' => fake()->randomElement(['BCA', 'Mandiri', 'BNI', 'BRI', 'Permata']),
            'bank_account_number' => fake()->numerify('################'),
            'bank_account_name' => fake()->name(),
            'platform_fee_percent' => $platformFeePercent,
            'platform_fee_amount' => $platformFeeAmount,
            'nett_amount' => $nettAmount,
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'transferred']),
            'notes' => fake()->optional()->sentence(),
            'rejection_reason' => null,
            'transfer_proof' => null,
            'approved_by' => null,
            'transferred_at' => null,
        ];
    }
}
