<?php

namespace App\Services;

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
        $defaultImage = asset('images/logo/logo-landscape-color.png');

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
                'title' => "{$title} - {$siteName}",
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
                : (string) ($rawTitle ?: 'Kabar & Berita Insani');

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
                                'name' => 'Kabar & Berita',
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
                'title' => "{$title} - {$siteName}",
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
                'title' => "{$title} - Fokus Program - {$siteName}",
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
            $title = (string) (data_get($cmsPage, 'meta_title') ?: data_get($cmsPage, 'title') ?: 'Halaman Informasi');
            $description = (string) (data_get($cmsPage, 'meta_description') ?: $defaultDescription);

            $attachment = data_get($cmsPage, 'attachment_url');
            $image = ! empty($attachment) ? $attachment : $defaultImage;

            return [
                'title' => "{$title} - {$siteName}",
                'description' => Str::limit($description, 160),
                'image' => $image,
                'url' => $currentUrl,
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
            'Public/Home/Index' => "Platform Galang Dana & Donasi Online - {$siteName}",
            'Public/About/Index' => "Tentang Kami - {$siteName}",
            'Public/FocusProgram/Index' => "Fokus Program Kebaikan - {$siteName}",
            'Public/Contact/Create' => "Hubungi Kami - {$siteName}",
            'Public/Program/Listing' => "Daftar Program Donasi - {$siteName}",
            'Public/Program/Index' => "Daftar Program Donasi - {$siteName}",
            'Public/Blog/Index' => "Kabar & Berita Terbaru - {$siteName}",
            'Public/CampaignerRegistration/Create' => "Daftar Penggalang Dana - {$siteName}",
            'Public/Donation/Lookup' => "Cek Status & Riwayat Donasi - {$siteName}",
        ];

        $pageTitle = $customTitles[$component] ?? "{$siteName} - Platform Galang Dana dan Donasi";

        $schema = null;
        if ($component === 'Public/Home/Index') {
            $schema = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    $organizationSchema,
                    [
                        '@type' => 'WebSite',
                        '@id' => url('/').'#website',
                        'url' => url('/'),
                        'name' => $siteName,
                        'description' => $defaultDescription,
                        'publisher' => [
                            '@id' => url('/').'#organization',
                        ],
                    ],
                ],
            ];
        }

        return [
            'title' => $pageTitle,
            'description' => $defaultDescription,
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
