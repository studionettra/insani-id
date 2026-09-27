<?php

namespace Database\Seeders;

use App\Models\ProgramReportCategory;
use Illuminate\Database\Seeder;

class ProgramReportCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'slug' => 'penyalahgunaan-dana',
                'sort_order' => 1,
                'name' => [
                    'id' => 'Penyalahgunaan dana',
                    'en' => 'Misuse of funds',
                    'ar' => 'إساءة استخدام الأموال',
                ],
                'description' => [
                    'id' => 'Dana tidak digunakan sesuai tujuan program atau digunakan untuk kepentingan pribadi.',
                    'en' => 'Funds are not used in accordance with campaign purpose or used for personal interest.',
                    'ar' => 'الأموال لا تستخدم وفقاً للغرض من الحملة أو تستخدم للمصلحة الشخصية.',
                ],
            ],
            [
                'slug' => 'sudah-di-cover-pihak-lain',
                'sort_order' => 2,
                'name' => [
                    'id' => 'Sudah di cover pihak lain (BPJS, Asuransi)',
                    'en' => 'Already covered by other parties (BPJS, Insurance)',
                    'ar' => 'مغطى بالفعل من قبل أطراف أخرى (التأمين)',
                ],
                'description' => [
                    'id' => 'Biaya telah ditanggung sepenuhnya oleh pihak ketiga seperti BPJS atau asuransi.',
                    'en' => 'Expenses have been fully covered by third parties like insurance.',
                    'ar' => 'تمت تغطية النفقات بالكامل من قبل أطراف ثالثة مثل التأمين.',
                ],
            ],
            [
                'slug' => 'memberikan-informasi-palsu',
                'sort_order' => 3,
                'name' => [
                    'id' => 'Memberikan Informasi Palsu',
                    'en' => 'Providing False Information',
                    'ar' => 'تقديم معلومات كاذبة',
                ],
                'description' => [
                    'id' => 'Cerita, data medis, identitas, atau dokumen yang dicantumkan terindikasi palsu/fiktif.',
                    'en' => 'The story, medical data, identity, or documents listed appear to be fake or fictitious.',
                    'ar' => 'القصة أو البيانات الطبية أو الهوية أو المستندات المذكورة تبدو مزيفة أو وهمية.',
                ],
            ],
            [
                'slug' => 'beneficiary-sudah-meninggal',
                'sort_order' => 4,
                'name' => [
                    'id' => 'Beneficiary sudah meninggal',
                    'en' => 'Beneficiary has passed away',
                    'ar' => 'المستفيد قد توفي بالفعل',
                ],
                'description' => [
                    'id' => 'Penerima manfaat program telah wafat namun penggalangan dana masih berlangsung aktif.',
                    'en' => 'The campaign beneficiary has passed away but the fundraising remains active.',
                    'ar' => 'توفي المستفيد من الحملة ولكن جمع التبرعات لا يزال نشطاً.',
                ],
            ],
            [
                'slug' => 'tidak-izin-keluarga',
                'sort_order' => 5,
                'name' => [
                    'id' => 'Tidak izin kepada keluarga penerima manfaat',
                    'en' => 'No permission from beneficiary family',
                    'ar' => 'بدون إذن من عائلة المستفيد',
                ],
                'description' => [
                    'id' => 'Penggalang dana tidak memiliki izin resmi atau persetujuan dari keluarga penerima manfaat.',
                    'en' => 'Campaigner does not have official consent from the beneficiary’s family.',
                    'ar' => 'صاحب الحملة لا يملك موافقة رسمية من عائلة المستفيد.',
                ],
            ],
            [
                'slug' => 'galang-dana-tidak-relevan',
                'sort_order' => 6,
                'name' => [
                    'id' => 'Galang dana tidak relevan (jokes, terlalu singkat)',
                    'en' => 'Irrelevant campaign (jokes, too brief)',
                    'ar' => 'حملة غير ملائمة (مزاح أو قصيرة جداً)',
                ],
                'description' => [
                    'id' => 'Konten program berupa lelucon, tidak memiliki urgensi sosial, atau narasi tidak masuk akal.',
                    'en' => 'Campaign content is a joke, lacks social urgency, or makes no sense.',
                    'ar' => 'محتوى الحملة عبارة عن مزحة أو يفتقر إلى الضرورة الاجتماعية.',
                ],
            ],
            [
                'slug' => 'gambar-kata-kurang-pantas',
                'sort_order' => 7,
                'name' => [
                    'id' => 'Menggunakan gambar/kata-kata kurang pantas',
                    'en' => 'Using inappropriate images or wording',
                    'ar' => 'استخدام صور أو كلمات غير لائقة',
                ],
                'description' => [
                    'id' => 'Terdapat foto luka/kondisi yang vulgar, melanggar etika, atau kata-kata yang menyinggung.',
                    'en' => 'Contains graphic wound photos, ethical violations, or offensive wording.',
                    'ar' => 'يحتوي على صور جروح واضحة أو انتهاكات أخلاقية أو ألفاظ مسيئة.',
                ],
            ],
            [
                'slug' => 'spamming-cyber-begger',
                'sort_order' => 8,
                'name' => [
                    'id' => 'Spamming (Cyber begger)',
                    'en' => 'Spamming (Cyber begging)',
                    'ar' => 'التسول الإلكتروني أو البريد العشوائي',
                ],
                'description' => [
                    'id' => 'Aktivitas penggalangan dana berulang-ulang tanpa tujuan jelas untuk kepentingan konsumtif.',
                    'en' => 'Repeated fundraising activities with no clear social purpose for consumer lifestyle.',
                    'ar' => 'أنشطة جمع تبرعات متكررة دون غرض اجتماعي واضح لأمور استهلاكية.',
                ],
            ],
            [
                'slug' => 'belum-ada-kabar-terbaru',
                'sort_order' => 9,
                'name' => [
                    'id' => 'Belum ada kabar terbaru',
                    'en' => 'No recent progress updates',
                    'ar' => 'لا توجد تحديثات أو أخبار جديدة',
                ],
                'description' => [
                    'id' => 'Penggalang dana tidak memberikan transparansi penyaluran atau update kondisi terbaru penerima manfaat.',
                    'en' => 'Campaigner has not provided transparent distribution updates or beneficiary condition reports.',
                    'ar' => 'لم يقدم صاحب الحملة تحديثات شفافة حول التوزيع أو تقارير حالة المستفيد.',
                ],
            ],
            [
                'slug' => 'proses-hukum',
                'sort_order' => 10,
                'name' => [
                    'id' => 'Penggalang dana sedang dalam proses hukum',
                    'en' => 'Campaigner is under legal proceedings',
                    'ar' => 'صاحب الحملة يخضع لإجراءات قانونية',
                ],
                'description' => [
                    'id' => 'Penggalang dana atau organisasi terkait sedang berstatus tersangka atau sengketa hukum perdata/pidana.',
                    'en' => 'Campaigner or affiliated organization is currently facing criminal or civil legal proceedings.',
                    'ar' => 'صاحب الحملة أو المنظمة التابعة لها يواجه حالياً إجراءات قانونية.',
                ],
            ],
            [
                'slug' => 'politik-praktis',
                'sort_order' => 11,
                'name' => [
                    'id' => 'Politik Praktis',
                    'en' => 'Partisan / Practical Politics',
                    'ar' => 'نشاط سياسي حزبي',
                ],
                'description' => [
                    'id' => 'Penggalangan dana terafiliasi dengan kampanye politik, partai, atau pemilu tertentu.',
                    'en' => 'Fundraising is affiliated with partisan political campaigns, political parties, or elections.',
                    'ar' => 'جمع التبرعات تابع لحملات سياسية حزبية أو أحزاب أو انتخابات.',
                ],
            ],
            [
                'slug' => 'target-tidak-sesuai-penyakit',
                'sort_order' => 12,
                'name' => [
                    'id' => 'Target tidak sesuai dengan tipe penyakit (target terlalu tinggi)',
                    'en' => 'Target does not match disease severity (too high)',
                    'ar' => 'المبلغ المستهدف لا يتناسب مع طبيعة المرض',
                ],
                'description' => [
                    'id' => 'RAB atau target donasi yang diajukan tidak proporsional dengan estimasi medis yang dibutuhkan.',
                    'en' => 'Target amount requested is disproportionate to realistic medical estimates.',
                    'ar' => 'المبلغ المستهدف المطلوب غير متناسب مع التقديرات الطبية الواقعية.',
                ],
            ],
            [
                'slug' => 'target-terus-menerus-dinaikkan',
                'sort_order' => 13,
                'name' => [
                    'id' => 'Target terus menerus dinaikkan',
                    'en' => 'Target continuously inflated without justification',
                    'ar' => 'زيادة الهدف المالي باستمرار دون مبرر',
                ],
                'description' => [
                    'id' => 'Target penggalangan dana berulang kali dinaikkan tanpa disertai alasan medis atau urgensi yang logis.',
                    'en' => 'Fundraising target repeatedly increased without medical justification or logical breakdown.',
                    'ar' => 'زيادة الهدف المالي باستمرار دون مبرر طبي أو تفصيل منطقي.',
                ],
            ],
            [
                'slug' => 'pasien-sudah-pulang',
                'sort_order' => 14,
                'name' => [
                    'id' => 'Pasien sudah pulang dari RS',
                    'en' => 'Patient has been discharged from hospital',
                    'ar' => 'المريض خرج بالفعل من المستشفى',
                ],
                'description' => [
                    'id' => 'Pasien telah sembuh atau pulang dari rumah sakit, tetapi narasi masih mencantumkan situasi gawat darurat.',
                    'en' => 'Patient is cured or discharged, yet the narrative still claims emergency hospitalization.',
                    'ar' => 'المريض شفي أو خرج من المستشفى بينما الحملة لا تزال تدعي الطوارئ.',
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            ProgramReportCategory::updateOrCreate(
                ['slug' => $categoryData['slug']],
                [
                    'name' => $categoryData['name'],
                    'description' => $categoryData['description'],
                    'sort_order' => $categoryData['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
