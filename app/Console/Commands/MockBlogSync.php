<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MockBlogSync extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:mock-blog-sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Insert mock blog posts for testing since WordPress is not set up yet';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Seeding mock blog posts...');

        $posts = [
            [
                'wp_post_id' => 101,
                'slug' => 'berbagi-kebahagiaan-bersama-yatim',
                'title' => 'Berbagi Kebahagiaan Bersama Yatim di Pelosok Negeri',
                'excerpt' => 'Program santunan yatim bulan ini berhasil menjangkau 500 anak di berbagai pelosok.',
                'content_html' => '<p>Program santunan yatim bulan ini berhasil menjangkau 500 anak di berbagai pelosok. Terima kasih kepada seluruh donatur yang telah berpartisipasi. <br> Mari terus dukung program kebaikan ini.</p>',
                'featured_image_url' => 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'author_name' => 'Admin Insani',
                'categories' => [['id' => 1, 'name' => 'Kabar Yatim', 'slug' => 'kabar-yatim']],
                'published_at' => now()->subDays(2),
            ],
            [
                'wp_post_id' => 102,
                'slug' => 'distribusi-air-bersih-gunungkidul',
                'title' => 'Distribusi 100 Tangki Air Bersih ke Gunungkidul',
                'excerpt' => 'Kekeringan panjang di Gunungkidul mulai teratasi dengan bantuan air bersih dari para donatur.',
                'content_html' => '<p>Kekeringan panjang di Gunungkidul mulai teratasi dengan bantuan air bersih dari para donatur. Tim relawan Insani ID bergerak cepat mendistribusikan ke 10 desa terdampak.</p>',
                'featured_image_url' => 'https://images.unsplash.com/photo-1541888001429-231362e3eeb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'author_name' => 'Tim Relawan',
                'categories' => [['id' => 2, 'name' => 'Kemanusiaan', 'slug' => 'kemanusiaan']],
                'published_at' => now()->subDays(5),
            ],
            [
                'wp_post_id' => 103,
                'slug' => 'laporan-program-qurban-2026',
                'title' => 'Laporan Sukses Program Qurban 2026',
                'excerpt' => 'Distribusi daging qurban menjangkau wilayah pelosok timur Indonesia.',
                'content_html' => '<p>Tahun ini, distribusi daging qurban kita meluas hingga menjangkau wilayah pelosok timur Indonesia. Ini adalah bukti kepedulian yang nyata.</p>',
                'featured_image_url' => 'https://images.unsplash.com/photo-1529158327178-57e3dfd3e7d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'author_name' => 'Humas',
                'categories' => [['id' => 3, 'name' => 'Laporan', 'slug' => 'laporan']],
                'published_at' => now()->subDays(10),
            ],
        ];

        foreach ($posts as $post) {
            \App\Models\BlogPostCache::updateOrCreate(
                ['wp_post_id' => $post['wp_post_id']],
                $post
            );
        }

        $this->info('Mock blog posts seeded successfully!');
    }
}
