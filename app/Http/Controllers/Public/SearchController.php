<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogPostCache;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Page;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Public instant search for programs, focus pillars, articles, static pages, and Help Center FAQs.
     */
    public function search(Request $request): JsonResponse
    {
        $rawQ = trim((string) $request->query('q', ''));

        if (mb_strlen($rawQ) < 2) {
            return response()->json([
                'programs' => [],
                'focusPrograms' => [],
                'blogs' => [],
                'pages' => [],
                'faqs' => [],
            ]);
        }

        $locale = app()->getLocale();
        $qLower = mb_strtolower($rawQ);

        // Dictionary of short terms, common acronyms, and semantic synonyms
        $synonymMap = [
            // Brand & Logo
            'logo' => ['panduan logo', 'brand guideline', 'unduh logo', 'aset visual', 'identitas brand', 'warna logo', 'vektor', 'png', 'svg'],
            'brand' => ['logo', 'panduan logo', 'brand guideline', 'identitas visual'],
            'icon' => ['logo', 'aset visual', 'panduan logo', 'lambang', 'insani icon'],
            'png' => ['unduh logo', 'format png', 'aset logo', 'panduan logo'],
            'svg' => ['berkas vektor', 'aset logo', 'panduan logo', 'unduh logo'],

            // Customer Service & Communication
            'cs' => ['customer service', 'layanan cs', 'kontak', 'hubungi kami', 'bantuan'],
            'wa' => ['whatsapp', 'wa cs', 'kontak whatsapp', 'nomor wa'],
            'chat' => ['whatsapp', 'kontak', 'customer service', 'layanan cs'],
            'hub' => ['hubungi kami', 'kontak', 'layanan cs'],
            'pos' => ['kantor', 'alamat sekretariat', 'kontak'],

            // Legal & Terms
            'sk' => ['syarat ketentuan', 'syarat & ketentuan', 'sk kemenkumham', 'legalitas', 'badan hukum'],
            'tos' => ['terms of service', 'syarat dan ketentuan', 'syarat ketentuan'],
            'faq' => ['pusat bantuan', 'tanya jawab', 'pertanyaan', 'panduan'],
            'qa' => ['faq', 'tanya jawab', 'pusat bantuan'],

            // Financial & Payment
            'rek' => ['rekening', 'nomor rekening', 'transfer bank', 'pembayaran', 'cara donasi'],
            'atm' => ['transfer bank', 'pembayaran', 'cara donasi'],
            'bca' => ['bank bca', 'transfer bca', 'metode pembayaran', 'cara donasi'],
            'bri' => ['bank bri', 'transfer bri', 'metode pembayaran', 'cara donasi'],
            'bni' => ['bank bni', 'transfer bni', 'metode pembayaran', 'cara donasi'],
            'bsi' => ['bank bsi', 'bank syariah', 'metode pembayaran', 'cara donasi'],
            'qris' => ['qris', 'gopay', 'ovo', 'dana', 'linkaja', 'shopeepay', 'cara donasi'],
            'kap' => ['kantor akuntan publik', 'audit', 'laporan keuangan', 'transparansi'],
            'audit' => ['laporan keuangan', 'kantor akuntan publik', 'kap', 'transparansi'],

            // Partnerships & Foundation Info
            'csr' => ['kemitraan csr', 'kerjasama korporasi', 'proposal', 'sponsorship'],
            'tim' => ['manajemen', 'struktur organisasi', 'pengurus yayasan'],
            'ceo' => ['pimpinan', 'direktur', 'manajemen yayasan'],
            '3t' => ['terdepan terluar tertinggal', 'daerah 3t', 'pelosok', 'wilayah penyaluran'],
            'visi' => ['visi misi', 'tentang kami', 'profil yayasan'],
            'misi' => ['visi misi', 'tentang kami', 'tujuan yayasan'],
            'resi' => ['cek donasi', 'kuitansi donasi', 'status transaksi'],
            'lacak' => ['cek donasi', 'status donasi', 'riwayat donasi'],
            'slot' => ['slot kampanye', 'kuota program', 'tambah slot', 'buat program'],
            'kuota' => ['kuota program', 'slot program', 'buat program'],
            'mitra' => ['kemitraan', 'csr', 'campaigner', 'kerjasama'],
            'duta' => ['fundraiser', 'relawan', 'duta kebaikan'],
        ];

        $expandedTerms = $synonymMap[$qLower] ?? [];
        $searchTerms = array_values(array_unique(array_filter(array_merge([$rawQ], $expandedTerms))));

        // 1. Search Published Programs (by title, story, and category name)
        $programs = Program::with('category')
            ->where('status', 'published')
            ->where(function ($query) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $query->orWhere('title', 'like', "%{$term}%")
                        ->orWhere('story', 'like', "%{$term}%")
                        ->orWhereHas('category', function ($catQuery) use ($term) {
                            $catQuery->where('name', 'like', "%{$term}%");
                        });
                }
            })
            ->latest('published_at')
            ->take(5)
            ->get()
            ->map(function ($p) {
                $target = (float) ($p->target_amount ?? 0);
                $collected = (float) ($p->collected_amount ?? 0);
                $percentage = $target > 0 ? min(100, round(($collected / $target) * 100)) : 0;

                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'cover_image' => $p->cover_image,
                    'collected_amount' => $collected,
                    'target_amount' => $target,
                    'percentage' => $percentage,
                    'category_name' => $p->category?->name,
                    'url' => route('program.show', $p->slug),
                ];
            });

        // 2. Search Active Focus Programs / Pillars
        $focusPrograms = Category::where('is_focus_program', true)
            ->where('is_active', true)
            ->where(function ($query) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $query->orWhere('name', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%");
                }
            })
            ->take(3)
            ->get()
            ->map(function ($c) {
                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'pillar_image' => $c->pillar_image,
                    'url' => route('focus.show', $c->slug),
                ];
            });

        // 3. Search Published Blog Posts
        $blogs = BlogPostCache::published()
            ->where(function ($query) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $query->orWhere('title', 'like', "%{$term}%")
                        ->orWhere('excerpt', 'like', "%{$term}%");
                }
            })
            ->latest('published_at')
            ->take(3)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'title' => $b->title,
                    'slug' => $b->slug,
                    'featured_image_url' => $b->featured_image_url,
                    'published_at' => $b->published_at ? $b->published_at->format('d M Y') : null,
                    'url' => route('blog.show', $b->slug),
                ];
            });

        // 4. Search Help Center FAQs
        $faqs = Faq::where('is_active', true)
            ->where(function ($query) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $query->orWhere('question', 'like', "%{$term}%")
                        ->orWhere('answer_html', 'like', "%{$term}%")
                        ->orWhere('keywords', 'like', "%{$term}%")
                        ->orWhere('category', 'like', "%{$term}%");
                }
            })
            ->orderBy('sort_order')
            ->take(4)
            ->get()
            ->map(function ($f) use ($locale) {
                $question = $f->getTranslation('question', $locale) ?: $f->question;

                return [
                    'id' => $f->id,
                    'question' => $question,
                    'category' => $f->category ?: 'umum',
                    'url' => route('page.pusat-bantuan').'?q='.urlencode($question),
                ];
            });

        // 5. Clean Route Mapping for Canonical Static Pages
        $cleanRouteMap = [
            'logo' => route('page.logo'),
            'pusat-bantuan' => route('page.pusat-bantuan'),
            'syarat-ketentuan' => route('page.syarat-ketentuan'),
            'kebijakan-privasi' => route('page.kebijakan-privasi'),
            'cara-donasi' => route('page.cara-donasi'),
        ];

        // 6. Comprehensive System Navigation & Static Public Pages Index
        $systemPages = [
            [
                'title' => 'Panduan Logo & Identitas Brand',
                'slug' => 'logo',
                'meta_description' => 'Panduan resmi penggunaan logo, filosofi warna, dan pusat unduhan aset logo resmi Insani Indonesia.',
                'url' => route('page.logo'),
                'badge' => 'Identitas',
                'keywords' => ['logo', 'brand', 'guideline', 'unduh logo', 'download logo', 'aset visual', 'identitas', 'warna', 'palet', 'vektor', 'png', 'svg', 'lambang', 'simbol', 'icon', 'master asset'],
            ],
            [
                'title' => 'Pusat Bantuan & FAQ',
                'slug' => 'pusat-bantuan',
                'meta_description' => 'Pusat bantuan resmi, tanya jawab (FAQ), panduan donatur, dan narahubung platform.',
                'url' => route('page.pusat-bantuan'),
                'badge' => 'Bantuan',
                'keywords' => ['faq', 'qa', 'bantuan', 'help', 'pusat bantuan', 'tanya jawab', 'pertanyaan', 'panduan', 'cs', 'customer service', 'kendala', 'solusi', 'problem'],
            ],
            [
                'title' => 'Cara Berdonasi',
                'slug' => 'cara-donasi',
                'meta_description' => 'Panduan tata cara pembayaran donasi via Transfer Bank (BCA, BRI, BNI, Mandiri, BSI), QRIS, dan e-Wallet.',
                'url' => route('page.cara-donasi'),
                'badge' => 'Panduan',
                'keywords' => ['cara donasi', 'rekening', 'rek', 'transfer', 'bank', 'bca', 'bri', 'bni', 'mandiri', 'bsi', 'qris', 'gopay', 'ovo', 'dana', 'ewallet', 'metode pembayaran', 'bayar donasi', 'atm', 'manual'],
            ],
            [
                'title' => 'Syarat & Ketentuan',
                'slug' => 'syarat-ketentuan',
                'meta_description' => 'Syarat dan ketentuan layanan platform donasi dan penggalangan dana Insani Indonesia.',
                'url' => route('page.syarat-ketentuan'),
                'badge' => 'Kebijakan',
                'keywords' => ['syarat', 'ketentuan', 'sk', 'tos', 'terms', 'aturan', 'kebijakan pengguna', 'regulasi', 'ketentuan layanan', 'hukum'],
            ],
            [
                'title' => 'Kebijakan Privasi',
                'slug' => 'kebijakan-privasi',
                'meta_description' => 'Kebijakan privasi dan perlindungan data pribadi pengguna platform Insani Indonesia.',
                'url' => route('page.kebijakan-privasi'),
                'badge' => 'Kebijakan',
                'keywords' => ['privasi', 'privacy', 'data pribadi', 'keamanan data', 'perlindungan data', 'rahasia', 'keamanan', 'informasi pribadi'],
            ],
            [
                'title' => 'Tentang Kami',
                'slug' => 'tentang-kami',
                'meta_description' => 'Profil, visi-misi, legalitas SK Kemenkumham, dan struktur dewan pengurus Yayasan Insani Indonesia.',
                'url' => route('about.index'),
                'badge' => 'Lembaga',
                'keywords' => ['tentang', 'tentang kami', 'profil', 'yayasan', 'visi', 'misi', 'sejarah', 'legalitas', 'sk', 'kemenkumham', 'izin', 'struktur', 'pengurus', 'tim', 'manajemen', 'ceo', 'dewan pembina', 'latar belakang'],
            ],
            [
                'title' => 'Kontak & Layanan CS',
                'slug' => 'kontak',
                'meta_description' => 'Hubungi Customer Service via WhatsApp, Telepon, Email, atau kunjungi kantor sekretariat kami.',
                'url' => route('contact.create'),
                'badge' => 'Kontak',
                'keywords' => ['kontak', 'cs', 'customer service', 'wa', 'whatsapp', 'alamat', 'kantor', 'pos', 'lokasi', 'telp', 'telepon', 'call', 'email', 'hubungi', 'layanan', 'jam kerja', 'operasional', 'layanan cs', 'pesan'],
            ],
            [
                'title' => 'Laporan Keuangan & Audit',
                'slug' => 'laporan-keuangan',
                'meta_description' => 'Transparansi laporan keuangan yayasan dan hasil audit independen Kantor Akuntan Publik (KAP).',
                'url' => route('financial-reports.index'),
                'badge' => 'Transparansi',
                'keywords' => ['laporan', 'keuangan', 'laporan keuangan', 'audit', 'kap', 'kantor akuntan publik', 'akuntan', 'transparansi', 'akuntabilitas', 'neraca', 'pembukuan', 'annual report', 'dana yayasan'],
            ],
            [
                'title' => 'Cek Status Donasi & Kuitansi',
                'slug' => 'cek-donasi',
                'meta_description' => 'Lacak status donasi, cek riwayat pembayaran, dan unduh kuitansi resmi elektronik.',
                'url' => route('donation.lookup'),
                'badge' => 'Donatur',
                'keywords' => ['cek', 'cek donasi', 'lacak', 'status', 'kuitansi', 'kwitansi', 'resi', 'bukti donasi', 'riwayat', 'unduh kuitansi', 'cetak kuitansi', 'lacak transaksi'],
            ],
            [
                'title' => 'Semua Program Donasi',
                'slug' => 'program',
                'meta_description' => 'Daftar semua program penggalangan dana aktif, sedekah, zakat, dan kemanusiaan.',
                'url' => route('program.index'),
                'badge' => 'Donasi',
                'keywords' => ['program', 'semua program', 'katalog', 'donasi', 'sedekah', 'infaq', 'zakat', 'wakaf', 'kampanye', 'daftar donasi', 'galang dana'],
            ],
            [
                'title' => 'Fokus Program Utama',
                'slug' => 'fokus-program',
                'meta_description' => 'Pilar strategis kebaikan Insani Indonesia: Pendidikan, Kesehatan, Kemanusiaan, dan Dakwah.',
                'url' => route('focus.index'),
                'badge' => 'Pilar',
                'keywords' => ['fokus', 'fokus program', 'pilar', 'kategori', 'program utama', 'strategis', 'pilar kebaikan'],
            ],
            [
                'title' => 'Berita & Artikel Publikasi',
                'slug' => 'berita',
                'meta_description' => 'Kabar terbaru penyaluran bantuan, artikel inspiratif, dan rilis resmi yayasan.',
                'url' => route('blog.index'),
                'badge' => 'Kabar',
                'keywords' => ['berita', 'kabar', 'artikel', 'cerita', 'penyaluran', 'publikasi', 'rilis', 'kabar terbaru', 'cerita kebaikan'],
            ],
            [
                'title' => 'Daftar Campaigner (Buat Program)',
                'slug' => 'buat-program',
                'meta_description' => 'Daftar sebagai campaigner resmi, buka penggalangan dana baru, dan ajukan slot program.',
                'url' => route('buat-program'),
                'badge' => 'Campaigner',
                'keywords' => ['campaigner', 'buat program', 'galang dana', 'buka donasi', 'slot', 'kuota', 'mitra', 'komunitas', 'lembaga', 'verifikasi campaigner', 'penggalang dana', 'ajukan program'],
            ],
            [
                'title' => 'Relawan Fundraiser',
                'slug' => 'fundraiser',
                'meta_description' => 'Menjadi relawan kebaikan pembawa manfaat dengan menyebarluaskan program donasi pilihan.',
                'url' => route('akun.fundraiser.index'),
                'badge' => 'Fundraiser',
                'keywords' => ['fundraiser', 'relawan', 'duta', 'duta kebaikan', 'referral', 'ajak donasi', 'komisi', 'duta program', 'sebar kebaikan'],
            ],
        ];

        $matchedSystemPages = collect($systemPages)->filter(function ($page) use ($searchTerms, $qLower) {
            $titleLower = mb_strtolower($page['title']);
            $descLower = mb_strtolower($page['meta_description']);
            $slugLower = mb_strtolower($page['slug']);
            $pageKeywords = array_map('mb_strtolower', $page['keywords'] ?? []);

            // Check exact or partial match on title, description, or slug
            if (str_contains($titleLower, $qLower) || str_contains($descLower, $qLower) || str_contains($slugLower, $qLower)) {
                return true;
            }

            // Check against expanded search terms & keywords
            foreach ($searchTerms as $term) {
                $termLower = mb_strtolower($term);
                if (str_contains($titleLower, $termLower) || str_contains($descLower, $termLower) || str_contains($slugLower, $termLower)) {
                    return true;
                }

                foreach ($pageKeywords as $kw) {
                    if (str_contains($kw, $termLower) || str_contains($termLower, $kw)) {
                        return true;
                    }
                }
            }

            return false;
        })->map(function ($page, $index) {
            return [
                'id' => 9000 + $index,
                'title' => $page['title'],
                'slug' => $page['slug'],
                'meta_description' => $page['meta_description'],
                'badge' => $page['badge'] ?? null,
                'url' => $page['url'],
            ];
        })->values();

        // 7. Search Custom Database Static Pages (Excluding pages already covered by system index)
        $knownSlugs = collect($systemPages)->pluck('slug')->toArray();
        $dbPages = Page::where('is_active', true)
            ->whereNotIn('slug', $knownSlugs)
            ->where(function ($query) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $query->orWhere('title', 'like', "%{$term}%")
                        ->orWhere('meta_description', 'like', "%{$term}%")
                        ->orWhere('slug', 'like', "%{$term}%");
                }
            })
            ->take(3)
            ->get()
            ->map(function ($p) use ($cleanRouteMap) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'meta_description' => $p->meta_description,
                    'badge' => 'Informasi',
                    'url' => $cleanRouteMap[$p->slug] ?? route('page.show', $p->slug),
                ];
            });

        $allPages = $matchedSystemPages->concat($dbPages)->take(6);

        return response()->json([
            'programs' => $programs,
            'focusPrograms' => $focusPrograms,
            'blogs' => $blogs,
            'pages' => $allPages,
            'faqs' => $faqs,
        ]);
    }
}
