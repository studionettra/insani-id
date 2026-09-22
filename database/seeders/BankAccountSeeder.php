<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use Illuminate\Database\Seeder;

class BankAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = [
            [
                'bank_name' => 'Bank Syariah Indonesia (BSI)',
                'bank_code' => 'MANUAL_BSI',
                'account_number' => '7132195026',
                'account_name' => 'Yayasan Peduli Insani Indonesia',
                'bank_type' => 'syariah',
                'instructions' => 'Transfer tepat sesuai nominal yang tertera ke rekening giro BSI Yayasan Peduli Insani Indonesia. Kirimkan bukti transfer melalui formulir konfirmasi WhatsApp.',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'bank_name' => 'Bank Rakyat Indonesia (BRI)',
                'bank_code' => 'MANUAL_BRI',
                'account_number' => '034501001366304',
                'account_name' => 'Yayasan Peduli Insani Indonesia',
                'bank_type' => 'konvensional',
                'instructions' => 'Transfer tepat sesuai nominal yang tertera ke rekening giro BRI Yayasan Peduli Insani Indonesia. Kirimkan bukti transfer melalui formulir konfirmasi WhatsApp.',
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($accounts as $account) {
            BankAccount::updateOrCreate(
                ['account_number' => $account['account_number']],
                $account
            );
        }
    }
}
