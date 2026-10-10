<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'syarat-ketentuan',
                'title' => [
                    'id' => 'Syarat & Ketentuan',
                    'en' => 'Terms & Conditions',
                    'ar' => 'الشروط والأحكام',
                ],
                'file' => base_path('docs/policy/syarat-ketentuan.html'),
                'meta_title' => [
                    'id' => 'Syarat & Ketentuan - Insani Indonesia',
                    'en' => 'Terms & Conditions - Insani Indonesia',
                    'ar' => 'الشروط والأحكام - إنساني إندونيسيا',
                ],
                'meta_description' => [
                    'id' => 'Syarat dan Ketentuan layanan platform donasi dan penggalangan dana Insani Indonesia.',
                    'en' => 'Terms and conditions for donation and fundraising platform Insani Indonesia.',
                    'ar' => 'الشروط والأحكام لمنصة التبرعات وجمع التبرعات إنساني إندونيسيا.',
                ],
            ],
            [
                'slug' => 'kebijakan-privasi',
                'title' => [
                    'id' => 'Kebijakan Privasi',
                    'en' => 'Privacy Policy',
                    'ar' => 'سياسة الخصوصية',
                ],
                'file' => base_path('docs/policy/kebijakan-privasi.html'),
                'meta_title' => [
                    'id' => 'Kebijakan Privasi - Insani Indonesia',
                    'en' => 'Privacy Policy - Insani Indonesia',
                    'ar' => 'سياسة الخصوصية - إنساني إندونيسيا',
                ],
                'meta_description' => [
                    'id' => 'Kebijakan privasi dan perlindungan data pribadi pengguna platform Insani Indonesia.',
                    'en' => 'Privacy policy and personal data protection for Insani Indonesia platform users.',
                    'ar' => 'سياسة الخصوصية وحماية البيانات الشخصية لمستخدمي منصة إنساني إندونيسيا.',
                ],
            ],
            [
                'slug' => 'cara-donasi',
                'title' => [
                    'id' => 'Cara Berdonasi',
                    'en' => 'How to Donate',
                    'ar' => 'كيفية التبرع',
                ],
                'file' => base_path('docs/policy/cara-donasi.html'),
                'meta_title' => [
                    'id' => 'Cara Berdonasi - Insani Indonesia',
                    'en' => 'How to Donate - Insani Indonesia',
                    'ar' => 'كيفية التبرع - إنساني إندونيسيا',
                ],
                'meta_description' => [
                    'id' => 'Panduan tata cara pembayaran dan berdonasi di platform Insani Indonesia.',
                    'en' => 'Guide on payment methods and how to donate on Insani Indonesia platform.',
                    'ar' => 'دليل طرق الدفع وكيفية التبرع على منصة إنساني إندونيسيا.',
                ],
            ],
            [
                'slug' => 'pusat-bantuan',
                'title' => [
                    'id' => 'Pusat Bantuan & Tanya Jawab',
                    'en' => 'Help Center & FAQ',
                    'ar' => 'مركز المساعدة والأسئلة الشائعة',
                ],
                'file' => base_path('docs/policy/pusat-bantuan.html'),
                'meta_title' => [
                    'id' => 'Pusat Bantuan & Tanya Jawab - Insani Indonesia',
                    'en' => 'Help Center & FAQ - Insani Indonesia',
                    'ar' => 'مركز المساعدة والأسئلة الشائعة - إنساني إندونيسيا',
                ],
                'meta_description' => [
                    'id' => 'Pusat bantuan dan tanya jawab seputar layanan dan program Insani Indonesia.',
                    'en' => 'Help center and frequently asked questions (FAQ) about Insani Indonesia programs and services.',
                    'ar' => 'مركز المساعدة والأسئلة الشائعة حول برامج وخدمات إنساني إندونيسيا.',
                ],
            ],
            [
                'slug' => 'logo',
                'title' => [
                    'id' => 'Panduan Logo & Identitas Visual',
                    'en' => 'Logo & Brand Guidelines',
                    'ar' => 'دليل الشعار والهوية البصرية',
                ],
                'file' => base_path('docs/policy/panduan-logo.html'),
                'meta_title' => [
                    'id' => 'Logo Insani Indonesia - Panduan Identitas Visual Resmi',
                    'en' => 'Insani Indonesia Logo - Official Brand Guidelines',
                    'ar' => 'شعار إنساني إندونيسيا - دليل الهوية البصرية الرسمي',
                ],
                'meta_description' => [
                    'id' => 'Panduan resmi penggunaan logo, filosofi warna, dan pusat unduhan aset logo resmi Yayasan Peduli Insani Indonesia.',
                    'en' => 'Official logo usage guidelines, color philosophy, and official asset download center of Insani Indonesia.',
                    'ar' => 'الدليل الرسمي لاستخدام الشعار وفلسفة الألوان وتنزيل أصول شعار إنساني إندونيسيا.',
                ],
            ],
        ];

        foreach ($pages as $item) {
            $htmlContent = File::exists($item['file'])
                ? File::get($item['file'])
                : '<p>Konten halaman sedang diperbarui.</p>';

            $existing = Page::where('slug', $item['slug'])->first();
            $contentHtml = [
                'id' => $htmlContent,
                'en' => ($existing && $existing->getTranslation('content_html', 'en', false) && $existing->getTranslation('content_html', 'en', false) !== $existing->getTranslation('content_html', 'id', false))
                    ? $existing->getTranslation('content_html', 'en', false)
                    : $htmlContent,
                'ar' => ($existing && $existing->getTranslation('content_html', 'ar', false) && $existing->getTranslation('content_html', 'ar', false) !== $existing->getTranslation('content_html', 'id', false))
                    ? $existing->getTranslation('content_html', 'ar', false)
                    : $htmlContent,
            ];

            Page::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'title' => $item['title'],
                    'content_html' => $contentHtml,
                    'meta_title' => $item['meta_title'],
                    'meta_description' => $item['meta_description'],
                    'is_active' => true,
                ]
            );
        }
    }
}
