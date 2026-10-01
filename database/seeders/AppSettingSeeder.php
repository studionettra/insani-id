<?php

namespace Database\Seeders;

use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class AppSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'min_donation_amount', 'value' => '10000', 'locale' => null],
            ['key' => 'platform.nama_platform', 'value' => 'Insani Indonesia', 'locale' => null],

            // Legalitas Yayasan
            ['key' => 'legal_foundation_name', 'value' => 'Yayasan Peduli Insani Indonesia', 'locale' => null],
            ['key' => 'legal_sk_kemenkumham', 'value' => 'AHU-0002557.AH.01.04.Tahun 2019', 'locale' => null],
            ['key' => 'legal_sk_label', 'value' => 'SK Kemenkumham RI', 'locale' => null],
            ['key' => 'show_sk_in_footer', 'value' => '1', 'locale' => null],

            // Alamat & Kontak Resmi
            ['key' => 'contact_address', 'value' => 'Jln. Moh Kahfi 1 No 90A, Jagakarsa, Jakarta Selatan', 'locale' => null],
            ['key' => 'contact_phone', 'value' => '(021) 27871199', 'locale' => null],
            ['key' => 'contact_email', 'value' => 'sapa@insani.id', 'locale' => null],
            ['key' => 'contact_operating_hours', 'value' => "Senin - Jum'at | 10:00 - 18.00 WIB", 'locale' => null],
            ['key' => 'contact_whatsapp', 'value' => '6281319456675', 'locale' => null],

            // Media Sosial Resmi
            ['key' => 'social_facebook', 'value' => 'https://www.facebook.com/insaniindonesia', 'locale' => null],
            ['key' => 'social_instagram', 'value' => 'https://www.instagram.com/insaniindonesia', 'locale' => null],
            ['key' => 'social_threads', 'value' => 'https://www.threads.com/@insaniindonesia', 'locale' => null],
            ['key' => 'social_x', 'value' => 'https://x.com/officialinsani', 'locale' => null],
            ['key' => 'social_youtube', 'value' => 'https://www.youtube.com/@insaniindonesia', 'locale' => null],

            // Profil & Visi Misi Yayasan Multibahasa
            ['key' => 'about_vision', 'value' => json_encode([
                'id' => 'Berkontribusi mewujudkan dunia tanpa krisis kemanusiaan yang menghadirkan keadilan sosial bagi segenap insan.',
                'en' => 'Contributing to realizing a world without humanitarian crises that brings social justice to all humanity.',
                'ar' => 'المساهمة في تحقيق عالم خالٍ من الأزمات الإنسانية يرسخ العدالة الاجتماعية لجميع البشر.',
            ], JSON_UNESCAPED_UNICODE), 'locale' => null],

            ['key' => 'about_mission', 'value' => json_encode([
                'id' => "Membangun kapasitas dan kompetensi organisasi yang efektif, inovatif, dan akuntabel.\nMenjalin kemitraan dan kolaborasi dengan institusi, perusahaan, lembaga, komunitas, dan individu dalam kerja-kerja sosial dan kemanusiaan.\nMengembangkan sumber daya yang ada, guna mendorong kemandirian dan kesejahteraan.",
                'en' => "Building effective, innovative, and accountable organizational capacity and competence.\nForging partnerships and collaboration with institutions, corporations, organizations, communities, and individuals in social and humanitarian endeavors.\nDeveloping available resources to foster self-reliance and community welfare.",
                'ar' => "بناء قدرات وكفاءات مؤسسية تتسم بالفاعلية والابتكار والمساءلة.\nإقامة شراكات وتعاون مع المؤسسات والشركات والهيئات والمجتمعات والأفراد في العمل الاجتماعي والإنساني.\nتنمية الموارد المتاحة لتعزيز الاعتماد على الذات والازدهار المجتمعي.",
            ], JSON_UNESCAPED_UNICODE), 'locale' => null],

            ['key' => 'about_values', 'value' => json_encode([
                'id' => "Initiative: Semangat untuk menjadi yang pertama dan terdepan dalam menghadirkan kebermanfaatan.\nNationalism: Kesadaran bahwa misi perjuangan kemanusiaan Insani didasarkan oleh cita-cita kemerdekaan Indonesia.\nSustainability: Kesadaran mendalam bahwa menghadirkan keadilan sosial merupakan perjuangan yang panjang dan berkelanjutan.\nAccountability: Semangat untuk menghadirkan tata kelola organisasi yang terukur dan efektif.\nNetworking: Semangat berjejaring demi mewujudkan komitmen menjadi wadah kolaborasi bagi seluruh potensi kebaikan.\nInspire: Semangat untuk senantiasa bekerja secara optimal, sehingga perjuangan Insani dapat menginspirasi dunia.",
                'en' => "Initiative: The drive to be first and foremost in delivering meaningful impact.\nNationalism: The conviction that Insani's humanitarian mission is rooted in the ideals of Indonesian independence.\nSustainability: The profound awareness that achieving social justice is an enduring and sustainable journey.\nAccountability: The commitment to delivering measurable, transparent, and effective organizational governance.\nNetworking: The spirit of forging alliances to serve as an inclusive collaborative platform for all goodness.\nInspire: The dedication to optimal excellence, ensuring Insani's journey inspires the world.",
                'ar' => "المبادرة: العزيمة لأن نكون في طليعة وصدارة صناعة الأثر النافع.\nالوطنية: الإيمان الراسخ بأن رسالة إنساني الإنسانية تنبع من مبادئ وقيم استقلال إندونيسيا.\nالاستدامة: الوعي العميق بأن إرساء العدالة الاجتماعية مسيرة ممتدة ومستدامة.\nالمساءلة: الالتزام بتقديم حوكمة مؤسسية شفافة وفعالة وقابلة للقياس.\nالتشبيك والتحالف: روح بناء الشراكات لتكون المنصة مظلة تعاون جامعة لكل طاقات الخير.\nالإلهام: التفاني في العمل بأعلى معايير الإتقان لتكون مسيرة إنساني ملهمة للعالم.",
            ], JSON_UNESCAPED_UNICODE), 'locale' => null],

            // Deskripsi Footer Multibahasa
            ['key' => 'footer_description', 'value' => json_encode([
                'id' => 'Platform gotong royong digital yang didedikasikan untuk menjembatani kebaikan dan memberikan dampak nyata bagi masyarakat dalam naungan nilai-nilai kemanusiaan universal.',
                'en' => 'Digital solidarity platform dedicated to bridging kindness and delivering real impact for communities under universal humanitarian values.',
                'ar' => 'منصة تضامن رقمية مكرسة لمد جسور الخير وإحداث أثر حقيقي للمجتمعات في إطار القيم الإنسانية العالمية.',
            ], JSON_UNESCAPED_UNICODE), 'locale' => null],
        ];

        foreach ($settings as $setting) {
            AppSetting::updateOrCreate(
                ['key' => $setting['key'], 'locale' => $setting['locale']],
                ['value' => $setting['value']]
            );
        }
    }
}
