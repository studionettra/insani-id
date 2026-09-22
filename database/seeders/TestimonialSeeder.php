<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $testimonials = [
            [
                'name' => 'Dr. H. Ahmad Fauzi',
                'role' => 'Donatur Rutin Program Kemanusiaan',
                'content' => 'Alhamdulillah, penyaluran donasi melalui Insani Indonesia sangat transparan dan akuntabel. Laporan Kabar Terbaru beserta kuitansi resminya selalu dikirimkan berkala ke email.',
                'rating' => 5,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Siti Rahmawati, S.Pd',
                'role' => 'Relawan Fundraiser Peduli Pendidikan',
                'content' => 'Fitur Fundraiser sangat memudahkan saya mengajak teman-teman kantor patungan membangun ruang kelas anak yatim. Dasbor pelacakannya real-time dan mudah dipantau.',
                'rating' => 5,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Budi Prasetyo',
                'role' => 'Donatur Tanggap Bencana',
                'content' => 'Sistem pembayarannya sangat cepat dengan QRIS dan virtual account tanpa ribet upload bukti transfer. Respon adminnya juga sangat cepat dan ramah.',
                'rating' => 5,
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($testimonials as $item) {
            Testimonial::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }
    }
}
