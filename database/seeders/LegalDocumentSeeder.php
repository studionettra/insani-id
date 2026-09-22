<?php

namespace Database\Seeders;

use App\Models\LegalDocument;
use Illuminate\Database\Seeder;

class LegalDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documents = [
            [
                'title' => [
                    'id' => 'Akta Pendirian',
                    'en' => 'Deed of Establishment',
                ],
                'document_number' => null,
                'issuer_name' => 'Notaris',
                'external_url' => 'https://drive.google.com/file/d/1npzpQZGq1MuGERZ9H8EdxmdV0vzgkIze/view',
                'icon_type' => 'scale',
                'publisher_logo' => '/images/about/Logo-Notaris-HD.webp',
                'description' => [
                    'id' => 'Akta pendirian resmi Yayasan Peduli Insani Indonesia.',
                    'en' => 'Official deed of establishment of Insani Indonesia Foundation.',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => [
                    'id' => 'Akta Perubahan',
                    'en' => 'Deed of Amendment',
                ],
                'document_number' => null,
                'issuer_name' => 'Notaris',
                'external_url' => 'https://drive.google.com/file/d/1SJP9zp-gMofWmQcCHwMCyfjj8Y_v-k7F/view',
                'icon_type' => 'scale',
                'publisher_logo' => '/images/about/Logo-Notaris-HD.webp',
                'description' => [
                    'id' => 'Akta perubahan anggaran dasar Yayasan Peduli Insani Indonesia.',
                    'en' => 'Deed of amendment of articles of association.',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => [
                    'id' => 'SK Kemenkumham Pendirian',
                    'en' => 'Establishment Decree by Ministry of Law and Human Rights',
                ],
                'document_number' => 'AHU-0002557.AH.01.04.Tahun 2019',
                'issuer_name' => 'Kemenkumham RI',
                'external_url' => 'https://drive.google.com/file/d/1_7BOWiP9SK-Me0GE178RAqx3g82_-5jh/view',
                'icon_type' => 'shield',
                'publisher_logo' => '/images/about/Logo-Kumham.webp',
                'description' => [
                    'id' => 'Surat Keputusan Menteri Hukum dan HAM RI tentang pengesahan badan hukum yayasan.',
                    'en' => 'Decree of the Minister of Law and Human Rights on legal entity ratification.',
                ],
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'title' => [
                    'id' => 'SK Kemenkumham Perubahan',
                    'en' => 'Amendment Decree by Ministry of Law and Human Rights',
                ],
                'document_number' => null,
                'issuer_name' => 'Kemenkumham RI',
                'external_url' => 'https://drive.google.com/file/d/1qH6vEQBTO3ofYd0hY-8RSk090uR7I04C/view',
                'icon_type' => 'shield',
                'publisher_logo' => '/images/about/Logo-Kumham.webp',
                'description' => [
                    'id' => 'Surat Keputusan Menteri Hukum dan HAM RI tentang pengesahan perubahan anggaran dasar.',
                    'en' => 'Decree of the Minister of Law and Human Rights on amendment ratification.',
                ],
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'title' => [
                    'id' => 'Surat Tanda Daftar Yayasan & Izin Kegiatan',
                    'en' => 'Foundation Registration & Activity Permit',
                ],
                'document_number' => null,
                'issuer_name' => 'Pemerintah Provinsi DKI Jakarta',
                'external_url' => 'https://drive.google.com/file/d/1qftGsDO7gkN3u_MgnWuLsHmpsHFAsyfa/view',
                'icon_type' => 'building',
                'publisher_logo' => '/images/about/logo-Pmeprov-DKI.webp',
                'description' => [
                    'id' => 'Tanda daftar yayasan sosial dan izin operasional kegiatan.',
                    'en' => 'Social foundation certificate of registration and operational permit.',
                ],
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'title' => [
                    'id' => 'Surat Keterangan Domisili',
                    'en' => 'Certificate of Domicile',
                ],
                'document_number' => null,
                'issuer_name' => 'Pemerintah Provinsi DKI Jakarta',
                'external_url' => 'https://drive.google.com/file/d/1ebtt5z05du7B-EqYCbEddzDTwT8HY5wE/view',
                'icon_type' => 'map-pin',
                'publisher_logo' => '/images/about/logo-Pmeprov-DKI.webp',
                'description' => [
                    'id' => 'Surat keterangan domisili sekretariat Yayasan Peduli Insani Indonesia.',
                    'en' => 'Certificate of official foundation secretariat domicile.',
                ],
                'is_active' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($documents as $doc) {
            LegalDocument::updateOrCreate(
                ['title->id' => $doc['title']['id']],
                $doc
            );
        }
    }
}
