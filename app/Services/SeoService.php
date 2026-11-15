<?php

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class SeoService
{
    /**
     * Resolve OpenGraph, meta tags, and Schema.org JSON-LD from Inertia page payload and current request.
     *
     * @param  array<string, mixed>  $page
     * @return array{
     *     title: string,
     *     description: string,
     *     image: string,
     *     url: string,
     *     type: string,
     *     site_name: string,
     *     card: string,
     *     is_private: bool,
     *     schema?: array<string, mixed>|null
     * }
     */
    public static function resolve(array $page): array
    {
        $siteName = 'Insani Indonesia';
        $currentUrl = url()->current();
        $defaultDescription = 'Platform Galang Dana dan Donasi Online Insani Indonesia. Bersama menebar kebaikan dan kepedulian untuk sesama.';
        $customLogo = AppSetting::get('site_logo');
        $defaultImage = ! empty($customLogo) ? asset('storage/'.$customLogo) : asset('images/logo/logo-landscape-color.png');

        $organizationSchema = [
            '@type' => 'NGO',
            '@id' => url('/').'#organization',
            'name' => $siteName,
            'url' => url('/'),
            'logo' => [
                '@type' => 'ImageObject',
                'url' => $defaultImage,
            ],
            'sameAs' => [
                'https://www.facebook.com/insaniindonesia',
                'https://www.instagram.com/insaniindonesia',
                'https://x.com/officialinsani',
                'https://www.youtube.com/@insaniindonesia',
            ],
        ];

        $isAdminOrDashboard = request()->is('dashboard*', 'admin*', 'akun*', 'settings*');
        if ($isAdminOrDashboard) {
            return [
                'title' => config('app.name', 'Laravel').' - Panel Pengguna',
                'description' => 'Area terproteksi sistem Insani Indonesia.',
                'image' => $defaultImage,
                'url' => $currentUrl,
                'type' => 'website',
                'site_name' => $siteName,
                'card' => 'summary',
                'is_private' => true,
                'schema' => null,
            ];
        }

        $component = (string) ($page['component'] ?? '');
        $props = is_array($page['props'] ?? null) ? $page['props'] : [];

        // 1. Program Detail Page
        if ($component === 'Public/Program/Show' && ! empty($props['program'])) {
            $program = $props['program'];

            $rawTitle = data_get($program, 'title');
            $title = is_array($rawTitle)
                ? ($rawTitle[app()->getLocale()] ?? $rawTitle['id'] ?? reset($rawTitle))
                : (string) ($rawTitle ?: 'Program Kebaikan');

            $rawStory = data_get($program, 'story');
            $story = is_array($rawStory)
                ? ($rawStory[app()->getLocale()] ?? $rawStory['id'] ?? reset($rawStory))
                : (string) ($rawStory ?: '');

            $cleanStory = trim(strip_tags((string) $story));
            $description = ! empty($cleanStory)
                ? Str::limit($cleanStory, 160)
                : "Bantu wujudkan program {$title} bersama {$siteName}.";

            $coverImage = data_get($program, 'cover_image');
            $image = $defaultImage;
            if (! empty($coverImage)) {
                $image = str_starts_with($coverImage, 'http://') || str_starts_with($coverImage, 'https://')
                    ? $coverImage
                    : asset('storage/'.ltrim($coverImage, '/'));
            }

            $schema = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    $organizationSchema,
                    [
                        '@type' => 'BreadcrumbList',
                        '@id' => $currentUrl.'#breadcrumb',
                        'itemListElement' => [
                            [
                                '@type' => 'ListItem',
                                'position' => 1,
                                'name' => 'Beranda',
                                'item' => url('/'),
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 2,
                                'name' => 'Program Donasi',
                                'item' => route('program.index'),
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 3,
                                'name' => $title,
                                'item' => $currentUrl,
                            ],
                        ],
                    ],
                    [
                        '@type' => 'WebPage',
                        '@id' => $currentUrl.'#webpage',
                        'url' => $currentUrl,
                        'name' => $title,
                        'description' => $description,
                        'image' => $image,
                        'breadcrumb' => [
                            '@id' => $currentUrl.'#breadcrumb',
                        ],
                        'mainEntity' => [
                            '@type' => 'DonateAction',
                            'name' => $title,
                            'description' => $description,
                            'recipient' => [
                                '@id' => url('/').'#organization',
                            ],
                        ],
                    ],
                ],
            ];

            return [
                'title' => str_contains($title, $siteName) ? $title : "{$title} - {$siteName}",
                'description' => $description,
                'image' => $image,
                'url' => $currentUrl,
                'type' => 'website',
                'site_name' => $siteName,
                'card' => 'summary_large_image',
                'is_private' => false,
                'schema' => $schema,
            ];
        }

        // 2. Blog / Berita Detail Page
        if ($component === 'Public/Blog/Show' && ! empty($props['blog'])) {
            $blog = $props['blog'];

            $rawTitle = data_get($blog, 'title');
            $title = is_array($rawTitle)
                ? ($rawTitle[app()->getLocale()] ?? $rawTitle['id'] ?? reset($rawTitle))
                : (string) ($rawTitle ?: 'Kabar Insani');

            $rawExcerpt = data_get($blog, 'excerpt');
            if (is_array($rawExcerpt)) {
                $rawExcerpt = $rawExcerpt[app()->getLocale()] ?? $rawExcerpt['id'] ?? reset($rawExcerpt);
            }

            $rawContent = data_get($blog, 'content_html');
            if (is_array($rawContent)) {
                $rawContent = $rawContent[app()->getLocale()] ?? $rawContent['id'] ?? reset($rawContent);
            }

            $cleanExcerpt = ! empty($rawExcerpt)
                ? trim(strip_tags((string) $rawExcerpt))
                : (! empty($rawContent) ? trim(strip_tags((string) $rawContent)) : '');

            $description = ! empty($cleanExcerpt)
                ? Str::limit($cleanExcerpt, 160)
                : "Baca selengkapnya mengenai {$title} di {$siteName}.";

            $blogImage = data_get($blog, 'featured_image_url') ?: data_get($blog, 'thumbnail_url');
            $image = $defaultImage;
            if (! empty($blogImage)) {
                $image = str_starts_with($blogImage, 'http://') || str_starts_with($blogImage, 'https://')
                    ? $blogImage
                    : asset('storage/'.ltrim($blogImage, '/'));
            }

            $publishedAt = data_get($blog, 'published_at');
            $updatedAt = data_get($blog, 'synced_at') ?: data_get($blog, 'updated_at') ?: $publishedAt;

            $schema = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    $organizationSchema,
                    [
                        '@type' => 'BreadcrumbList',
                        '@id' => $currentUrl.'#breadcrumb',
                        'itemListElement' => [
                            [
                                '@type' => 'ListItem',
                                'position' => 1,
                                'name' => 'Beranda',
                                'item' => url('/'),
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 2,
                                'name' => 'Kabar Insani',
                                'item' => route('blog.index'),
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 3,
                                'name' => $title,
                                'item' => $currentUrl,
                            ],
                        ],
                    ],
                    [
                        '@type' => 'NewsArticle',
                        '@id' => $currentUrl.'#article',
                        'url' => $currentUrl,
                        'headline' => $title,
                        'description' => $description,
                        'image' => $image,
                        'datePublished' => $publishedAt ? date('c', strtotime((string) $publishedAt)) : null,
                        'dateModified' => $updatedAt ? date('c', strtotime((string) $updatedAt)) : null,
                        'author' => [
                            '@id' => url('/').'#organization',
                        ],
                        'publisher' => [
                            '@id' => url('/').'#organization',
                        ],
                        'mainEntityOfPage' => [
                            '@type' => 'WebPage',
                            '@id' => $currentUrl,
                        ],
                    ],
                ],
            ];

            return [
                'title' => str_contains($title, $siteName) ? $title : "{$title} - {$siteName}",
                'description' => $description,
                'image' => $image,
                'url' => $currentUrl,
                'type' => 'article',
                'site_name' => $siteName,
                'card' => 'summary_large_image',
                'is_private' => false,
                'schema' => $schema,
            ];
        }

        // 3. Focus Program Detail Page
        if ($component === 'Public/FocusProgram/Show' && ! empty($props['pillar'])) {
            $pillar = $props['pillar'];
            $rawName = data_get($pillar, 'name_translations') ?: data_get($pillar, 'name');
            $title = is_array($rawName)
                ? ($rawName[app()->getLocale()] ?? $rawName['id'] ?? reset($rawName))
                : (string) ($rawName ?: 'Fokus Program');

            $rawDesc = data_get($pillar, 'description_translations') ?: data_get($pillar, 'description');
            $desc = is_array($rawDesc)
                ? ($rawDesc[app()->getLocale()] ?? $rawDesc['id'] ?? reset($rawDesc))
                : (string) ($rawDesc ?: '');

            $cleanDesc = trim(strip_tags((string) $desc));
            $description = ! empty($cleanDesc)
                ? Str::limit($cleanDesc, 160)
                : "Fokus Program {$title} bersama {$siteName}.";

            $pillarImage = data_get($pillar, 'pillar_image');
            $image = $defaultImage;
            if (! empty($pillarImage)) {
                $image = str_starts_with($pillarImage, 'http://') || str_starts_with($pillarImage, 'https://')
                    ? $pillarImage
                    : asset('storage/'.ltrim($pillarImage, '/'));
            }

            $schema = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    $organizationSchema,
                    [
                        '@type' => 'BreadcrumbList',
                        '@id' => $currentUrl.'#breadcrumb',
                        'itemListElement' => [
                            [
                                '@type' => 'ListItem',
                                'position' => 1,
                                'name' => 'Beranda',
                                'item' => url('/'),
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 2,
                                'name' => 'Fokus Program',
                                'item' => route('focus.index'),
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 3,
                                'name' => $title,
                                'item' => $currentUrl,
                            ],
                        ],
                    ],
                ],
            ];

            return [
                'title' => str_contains($title, $siteName) ? $title : "{$title} - Fokus Program - {$siteName}",
                'description' => $description,
                'image' => $image,
                'url' => $currentUrl,
                'type' => 'website',
                'site_name' => $siteName,
                'card' => 'summary_large_image',
                'is_private' => false,
                'schema' => $schema,
            ];
        }

        // 4. Static CMS Pages (Public/Page/Show)
        if ($component === 'Public/Page/Show' && ! empty($props['page'])) {
            $cmsPage = $props['page'];
            $slug = (string) data_get($cmsPage, 'slug');

            $cleanRouteMap = [
                'logo' => 'page.logo',
                'pusat-bantuan' => 'page.pusat-bantuan',
                'syarat-ketentuan' => 'page.syarat-ketentuan',
                'kebijakan-privasi' => 'page.kebijakan-privasi',
                'cara-donasi' => 'page.cara-donasi',
            ];

            $canonicalUrl = isset($cleanRouteMap[$slug])
                ? route($cleanRouteMap[$slug])
                : (Route::has('page.show') ? route('page.show', $slug) : $currentUrl);

            $title = (string) (data_get($cmsPage, 'meta_title') ?: data_get($cmsPage, 'title') ?: 'Halaman Informasi');
            $description = (string) (data_get($cmsPage, 'meta_description') ?: $defaultDescription);

            $attachment = data_get($cmsPage, 'attachment_url');
            $image = ! empty($attachment) ? $attachment : $defaultImage;

            return [
                'title' => str_contains($title, $siteName) ? $title : "{$title} - {$siteName}",
                'description' => Str::limit($description, 160),
                'image' => $image,
                'url' => $canonicalUrl,
                'type' => 'website',
                'site_name' => $siteName,
                'card' => 'summary_large_image',
                'is_private' => false,
                'schema' => [
                    '@context' => 'https://schema.org',
                    '@graph' => [
                        $organizationSchema,
                    ],
                ],
            ];
        }

        // 5. Known Public Pages mapping
        $customTitles = [
            'Public/Home/Index' => AppSetting::get('seo_home_title') ?: $siteName,
            'Public/About/Index' => AppSetting::get('seo_about_title') ?: "Tentang Kami - Profil Yayasan {$siteName}",
            'Public/FocusProgram/Index' => AppSetting::get('seo_focus_title') ?: "Fokus Program Kebaikan - {$siteName}",
            'Public/Contact/Create' => AppSetting::get('seo_contact_title') ?: "Hubungi Kami - Layanan Donatur {$siteName}",
            'Public/Program/Listing' => AppSetting::get('seo_program_title') ?: "Daftar Program Donasi - {$siteName}",
            'Public/Program/Index' => AppSetting::get('seo_program_title') ?: "Daftar Program Donasi - {$siteName}",
            'Public/Blog/Index' => AppSetting::get('seo_blog_title') ?: "Kabar Penyaluran & Berita Kebaikan - {$siteName}",
            'Public/CampaignerRegistration/Create' => "Daftar Penggalang Dana - {$siteName}",
            'Public/Donation/Lookup' => "Cek Status & Riwayat Donasi - {$siteName}",
        ];

        $customDescriptions = [
            'Public/Home/Index' => AppSetting::get('seo_home_description') ?: 'Platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat dalam naungan nilai-nilai kemanusiaan.',
            'Public/About/Index' => AppSetting::get('seo_about_description') ?: 'Mengenal Yayasan Peduli Insani Indonesia, visi misi, legalitas resmi Kemenkumham, serta transparansi kelembagaan.',
            'Public/FocusProgram/Index' => AppSetting::get('seo_focus_description') ?: 'Pilar program kebaikan Insani Indonesia: Bantuan Kemanusiaan, Ketahanan Pangan, Ketersediaan Air, Pendidikan, Pemberdayaan, dan Kesehatan.',
            'Public/Contact/Create' => AppSetting::get('seo_contact_description') ?: 'Kantor layanan donatur Yayasan Peduli Insani Indonesia. Layanan informasi donasi, konfirmasi transfer, kemitraan, dan konsultasi program.',
            'Public/Program/Listing' => AppSetting::get('seo_program_description') ?: 'Pilihan program donasi dan galang dana kemanusiaan, pendidikan, air bersih, serta santunan yatim terpercaya bersama Insani Indonesia.',
            'Public/Program/Index' => AppSetting::get('seo_program_description') ?: 'Pilihan program donasi dan galang dana kemanusiaan, pendidikan, air bersih, serta santunan yatim terpercaya bersama Insani Indonesia.',
            'Public/Blog/Index' => AppSetting::get('seo_blog_description') ?: 'Dokumentasi realisasi program, laporan penyaluran bantuan kemanusiaan, dan kabar kebaikan terkini dari relawan di lapangan.',
            'Public/CampaignerRegistration/Create' => 'Daftar sebagai inisiator atau mitra penggalang dana kebaikan di Insani Indonesia.',
            'Public/Donation/Lookup' => 'Cek status dan riwayat donasi online Anda secara transparan di Insani Indonesia.',
        ];

        $pageTitle = $customTitles[$component] ?? "{$siteName} - Platform Galang Dana dan Donasi";
        $pageDescription = $customDescriptions[$component] ?? $defaultDescription;

        $schema = null;
        if ($component === 'Public/Home/Index') {
            $siteNavSchema = [
                '@type' => 'ItemList',
                '@id' => url('/').'#site-navigation',
                'name' => "Navigasi Utama {$siteName}",
                'description' => "Pilar menu navigasi utama situs resmi {$siteName}.",
                'itemListElement' => [
                    [
                        '@type' => 'SiteNavigationElement',
                        'position' => 1,
                        'name' => 'Program Donasi',
                        'description' => 'Katalog program donasi dan galang dana kemanusiaan.',
                        'url' => route('program.index'),
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'position' => 2,
                        'name' => 'Tentang Kami',
                        'description' => 'Profil yayasan, legalitas resmi, dan laporan transparansi.',
                        'url' => route('about.index'),
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'position' => 3,
                        'name' => 'Kabar Penyaluran',
                        'description' => 'Dokumentasi realisasi program dan kabar berita penyaluran bantuan.',
                        'url' => route('blog.index'),
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'position' => 4,
                        'name' => 'Fokus Program',
                        'description' => 'Pilar utama fokus program bantuan dan pemberdayaan masyarakat.',
                        'url' => route('focus.index'),
                    ],
                    [
                        '@type' => 'SiteNavigationElement',
                        'position' => 5,
                        'name' => 'Kontak',
                        'description' => 'Layanan informasi donasi dan kantor layanan donatur.',
                        'url' => route('contact.create'),
                    ],
                ],
            ];

            $schema = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    $organizationSchema,
                    [
                        '@type' => 'WebSite',
                        '@id' => url('/').'#website',
                        'url' => url('/'),
                        'name' => $siteName,
                        'description' => $pageDescription,
                        'publisher' => [
                            '@id' => url('/').'#organization',
                        ],
                    ],
                    $siteNavSchema,
                ],
            ];
        } elseif (in_array($component, ['Public/Program/Listing', 'Public/Program/Index', 'Public/About/Index', 'Public/Blog/Index', 'Public/FocusProgram/Index', 'Public/Contact/Create'], true)) {
            $breadcrumbNameMap = [
                'Public/Program/Listing' => 'Program Donasi',
                'Public/Program/Index' => 'Program Donasi',
                'Public/About/Index' => 'Tentang Kami',
                'Public/Blog/Index' => 'Kabar Penyaluran',
                'Public/FocusProgram/Index' => 'Fokus Program',
                'Public/Contact/Create' => 'Kontak',
            ];

            $breadcrumbName = $breadcrumbNameMap[$component] ?? $pageTitle;

            $schema = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    $organizationSchema,
                    [
                        '@type' => 'BreadcrumbList',
                        '@id' => $currentUrl.'#breadcrumb',
                        'itemListElement' => [
                            [
                                '@type' => 'ListItem',
                                'position' => 1,
                                'name' => 'Beranda',
                                'item' => url('/'),
                            ],
                            [
                                '@type' => 'ListItem',
                                'position' => 2,
                                'name' => $breadcrumbName,
                                'item' => $currentUrl,
                            ],
                        ],
                    ],
                ],
            ];
        }

        return [
            'title' => $pageTitle,
            'description' => Str::limit($pageDescription, 160),
            'image' => $defaultImage,
            'url' => $currentUrl,
            'type' => 'website',
            'site_name' => $siteName,
            'card' => 'summary_large_image',
            'is_private' => false,
            'schema' => $schema,
        ];
    }
}
