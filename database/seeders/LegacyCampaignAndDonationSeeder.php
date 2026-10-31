<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Donation;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Spatie\Activitylog\Facades\Activity;

class LegacyCampaignAndDonationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $campaignsPath = database_path('data/campaigns_archive.json');
        $donationsPath = database_path('data/donations_archive.json');

        if (! File::exists($campaignsPath)) {
            $this->command?->warn("File arsip kampanye tidak ditemukan: {$campaignsPath}");

            return;
        }

        if (! File::exists($donationsPath)) {
            $this->command?->warn("File arsip donasi tidak ditemukan: {$donationsPath}");

            return;
        }

        $campaigns = json_decode(File::get($campaignsPath), true);
        $donations = json_decode(File::get($donationsPath), true);

        if (! is_array($campaigns) || ! is_array($donations)) {
            $this->command?->error('Format data JSON arsip kampanye atau donasi tidak valid.');

            return;
        }

        $admin = User::first();
        $adminId = $admin ? $admin->id : 1;

        $this->command?->info('Memulai seeding '.count($campaigns).' kampanye dan '.count($donations).' donasi legacy...');

        // Disable model events and activity logging to prevent observer storm and notification dispatching
        Program::withoutEvents(function () use ($campaigns, $donations, $adminId) {
            Donation::withoutEvents(function () use ($campaigns, $donations, $adminId) {
                Payment::withoutEvents(function () use ($campaigns, $donations, $adminId) {
                    Comment::withoutEvents(function () use ($campaigns, $donations, $adminId) {
                        activity()->disableLogging();

                        // 1. Seed Programs
                        $programMap = [];
                        foreach ($campaigns as $campData) {
                            $catId = $campData['category_id'] ?? null;
                            if (! empty($campData['category_slug'])) {
                                $matchedCategory = Category::where('slug', $campData['category_slug'])->first();
                                if ($matchedCategory) {
                                    $catId = $matchedCategory->id;
                                }
                            }
                            if (! $catId || ! Category::where('id', $catId)->exists()) {
                                $catId = Category::first()?->id ?? 1;
                            }

                            $program = Program::updateOrCreate(
                                ['slug' => $campData['slug']],
                                [
                                    'program_code' => $campData['program_code'],
                                    'title' => $campData['title'],
                                    'category_id' => $catId,
                                    'campaigner_type' => $campData['campaigner_type'] ?? 'internal',
                                    'created_by' => $adminId,
                                    'target_amount' => $campData['target_amount'] ?? null,
                                    'is_continuous' => (bool) ($campData['is_continuous'] ?? true),
                                    'deadline' => $campData['deadline'] ?? null,
                                    'cover_image' => $campData['cover_image'] ?? 'programs/covers/default.png',
                                    'story' => $campData['story'],
                                    'status' => $campData['status'] ?? 'published',
                                    'published_at' => ! empty($campData['published_at'])
                                        ? Carbon::parse($campData['published_at'])
                                        : now(),
                                ]
                            );

                            $programMap[$campData['slug']] = $program;
                        }

                        $this->command?->info('Berhasil seeding '.count($programMap).' kampanye legacy.');

                        // 2. Seed Donations, Payments, and Comments
                        $seededDonationsCount = 0;
                        foreach ($donations as $donData) {
                            $slug = $donData['program_slug'];
                            if (! isset($programMap[$slug])) {
                                continue;
                            }

                            $program = $programMap[$slug];
                            $createdAt = Carbon::parse($donData['created_at']);
                            $paidAt = Carbon::parse($donData['paid_at']);

                            // Create or update Donation record
                            $donation = Donation::updateOrCreate(
                                ['donation_code' => $donData['donation_code']],
                                [
                                    'program_id' => $program->id,
                                    'donor_name' => $donData['donor_name'],
                                    'donor_email' => $donData['donor_email'],
                                    'donor_phone' => $donData['donor_phone'],
                                    'is_anonymous' => (bool) ($donData['is_anonymous'] ?? false),
                                    'amount' => $donData['amount'],
                                    'channel' => $donData['channel'] ?? 'online',
                                    'status' => $donData['status'] ?? 'paid',
                                    'message' => $donData['message'] ?? null,
                                    'utm_source' => $donData['utm_source'] ?? null,
                                    'utm_medium' => $donData['utm_medium'] ?? null,
                                    'paid_at' => $paidAt,
                                    'created_at' => $createdAt,
                                    'updated_at' => $paidAt,
                                ]
                            );

                            // Create or update Payment record
                            Payment::updateOrCreate(
                                ['donation_id' => $donation->id],
                                [
                                    'payment_method' => $donData['payment_method'] ?? 'bank_transfer_manual',
                                    'payment_channel' => 'Transfer Bank',
                                    'gateway' => $donData['gateway'] ?? 'legacy_woocommerce',
                                    'gateway_reference_id' => $donData['order_id'] ?? $donation->donation_code,
                                    'gateway_status' => $donData['gateway_status'] ?? 'SETTLED',
                                    'paid_amount' => $donData['amount'],
                                    'gateway_fee' => $donData['gateway_fee'] ?? 0.00,
                                    'paid_at' => $paidAt,
                                    'created_at' => $createdAt,
                                    'updated_at' => $paidAt,
                                ]
                            );

                            // Create or update Comment record for Tab Donatur
                            Comment::updateOrCreate(
                                ['donation_id' => $donation->id],
                                [
                                    'program_id' => $program->id,
                                    'name' => $donation->is_anonymous ? 'Inisiator Kebaikan' : $donation->donor_name,
                                    'body' => ! empty($donation->message) ? $donation->message : '',
                                    'is_hidden' => false,
                                    'created_at' => $createdAt,
                                    'updated_at' => $createdAt,
                                ]
                            );

                            $seededDonationsCount++;
                        }

                        // 3. Recalculate collected amount for each seeded program
                        foreach ($programMap as $prog) {
                            $totalCollected = Donation::where('program_id', $prog->id)
                                ->where('status', 'paid')
                                ->sum('amount');

                            $prog->update(['collected_amount' => $totalCollected]);
                        }

                        activity()->enableLogging();
                        $this->command?->info("Berhasil seeding {$seededDonationsCount} transaksi donasi legacy beserta bukti bayar dan komentar donatur.");
                    });
                });
            });
        });
    }
}
