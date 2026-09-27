<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // ==========================================
            // 1. KETAHANAN PANGAN (Fokus Program 1)
            // ==========================================
            [
                'slug' => 'ketahanan-pangan',
                'name' => [
                    'id' => 'Pangan',
                    'en' => 'Food Aid',
                    'ar' => 'الإغاثة الغذائية',
                ],
                'public_name' => [
                    'id' => 'Ketahanan Pangan',
                    'en' => 'Food Security & Hunger Relief',
                    'ar' => 'الأمن الغذائي ومكافحة الجوع',
                ],
                'description' => [
                    'id' => 'Penyediaan pangan langsung dan pembangunan infrastruktur pangan berkelanjutan dari pelosok Nusantara hingga wilayah krisis kemanusiaan global.',
                    'en' => 'Direct food provision and sustainable food infrastructure development spanning from remote Indonesia to global crisis zones.',
                    'ar' => 'توفير الغذاء المباشر وتطوير البنية التحتية الغذائية المستدامة من أنحاء إندونيسيا إلى مناطق الأزمات الإنسانية العالمية.',
                ],
                // BLOK A: Realita & Urgensi Lapangan
                'reality_title' => [
                    'id' => 'Kelaparan yang Tak Pernah Reda: Jutaan Jiwa di Ambang Krisis Pangan',
                    'en' => 'Relentless Hunger: Millions of Lives on the Brink of Food Crisis',
                    'ar' => 'الجوع الذي لا يهدأ: ملايين الأرواح على حافة أزمة الغذاء',
                ],
                'reality_description' => [
                    'id' => 'Kelaparan hari ini bukan lagi risiko masa depan — ia sedang terjadi, di banyak tempat sekaligus. Di Gaza, gencatan senjata memang meredakan kondisi kelaparan massal, tetapi krisis pangan jauh dari selesai: mayoritas penduduk masih terjebak dalam kerawanan pangan akut, dengan ratusan ribu anak menghadapi malnutrisi. Di Yaman, lebih dari satu dekade konflik dan anjloknya pendanaan kemanusiaan membuat separuh populasi berjuang mendapatkan makanan yang layak. Di Somalia, kekeringan berulang terus mendorong jutaan warga — terutama balita — ke ambang malnutrisi akut. Ketiganya menunjukkan pola yang sama: kelaparan bukan bencana alam semata, melainkan akumulasi dari konflik berkepanjangan, runtuhnya ekonomi rumah tangga, dan terputusnya bantuan kemanusiaan tepat saat dibutuhkan paling mendesak.',
                    'en' => 'Hunger today is no longer a future risk — it is unfolding across multiple regions simultaneously. In Gaza, despite temporary respites, the food crisis remains critical: the vast majority of the population remains trapped in acute food insecurity, with hundreds of thousands of children facing malnutrition. In Yemen, over a decade of conflict and severe humanitarian underfunding has left half the population struggling for adequate nourishment. In Somalia, recurrent droughts continue to push millions — especially toddlers — to the brink of acute malnutrition. All reflect a clear reality: hunger is not merely a natural disaster, but the cumulative result of prolonged conflict, economic collapse, and disrupted humanitarian lifelines.',
                    'ar' => 'لم يعد الجوع اليوم مجرد خطر مستقبلي، بل واقع يتكشف في أماكن متعددة بالتزامن. ففي غزة، ورغم أي هدوء، لا تزال أزمة الغذاء حرجة: إذ يرزح غالبية السكان تحت وطأة انعدام الأمن الغذائي الحاد، مع مواجهة مئات الآلاف من الأطفال لخطر سوء التغذية. وفي اليمن، أدى أكثر من عقد من الصراع وتراجع التمويل الإنساني إلى معاناة نصف السكان لتأمين الغذاء الكافي. وفي الصومال، تدفع موجات الجفاف المتكررة ملايين المواطنين والأطفال الصغار إلى شفا سوء التغذية الحاد. الجوع ليس مجرد كارثة طبيعية، بل تراكم للنزاعات الممتدة وانهيار الاقتصاد وانقطاع شريان المساعدات الإنسانية.',
                ],
                'reality_source' => 'IPC, UNICEF & PBB (2026)',
                // BLOK B: Capaian Program Insani
                'impact_title' => [
                    'id' => 'Hadir di Tengah Krisis: Ikhtiar Insani Menjawab Kelaparan',
                    'en' => 'Present in Times of Crisis: Insani’s Endeavor to Alleviate Hunger',
                    'ar' => 'حاضرون في قلب الأزمة: سعي إنساني لمكافحة الجوع',
                ],
                'impact_description' => [
                    'id' => "Di tengah realita di atas, Insani hadir dengan dua pendekatan: penyediaan pangan langsung bagi yang membutuhkan hari ini, dan pembangunan infrastruktur pangan yang menopang ketahanan jangka panjang. Cakupan program membentang dari pelosok Nusantara hingga kantong-kantong krisis kemanusiaan dunia — Palestina, Suriah, Yaman, Rohingya, dan Somalia.\n\n• Bantuan Sembako (123 Program · 33.269 Penerima Manfaat): Distribusi bahan pangan pokok sebagai lini pertama pertahanan melawan kerawanan pangan.\n• Bantuan Pangan Siap Santap (29 Program · 6.827 Penerima Manfaat): Makanan siap konsumsi untuk kondisi darurat dan momentum ibadah.\n• Inovasi Agrikultur: Program rintisan pemberdayaan kemandirian produksi pangan tepat guna di lahan terbatas.",
                    'en' => "Amidst these harsh realities, Insani intervenes through a two-pronged strategy: immediate emergency food relief for those in urgent need today, and sustainable food infrastructure supporting long-term food security. Our footprint extends from remote Indonesian archipelago to global humanitarian flashpoints — Palestine, Syria, Yemen, Rohingya, and Somalia.\n\n• Food Packages (123 Programs · 33,269 Beneficiaries): Distribution of staple foods as the first line of defense against food insecurity.\n• Ready-to-Eat Meals (29 Programs · 6,827 Beneficiaries): Nutritious prepared meals for urgent crisis response and seasonal relief.\n• Agricultural Innovation: Grassroots programs fostering self-reliant food production in constrained spaces.",
                    'ar' => "في ظل هذه الحقائق القاسية، تتدخل إنساني عبر مسارين متكاملين: توفير الإغاثة الغذائية الفورية لمن هم في أمس الحاجة اليوم، وبناء بنية تحتية مستدامة تعزز الأمن الغذائي على المدى الطويل من إندونيسيا إلى فلسطين وسوريا واليمن والروهينغا والصومال.\n\n• السلال الغذائية الأساسية (123 برنامجاً · 33,269 مستفيداً): خط الدفاع الأول لتوفير المواد التموينية الأساسية.\n• الوجبات الجاهزة (29 برنامجاً · 6,827 مستفيداً): وجبات طازجة للإغاثة الطارئة والمواسم الخيرية.\n• الابتكار الزراعي: برامج رائدة لتعزيز الاكتفاء الذاتي والإنتاج الغذائي في المساحات المحدودة.",
                ],
                'stats_metrics' => [
                    // Blok A: Statistik Realita Lapangan
                    [
                        'tipe' => 'realita',
                        'value' => '~1,2 Juta',
                        'label' => [
                            'id' => 'Warga Gaza hadapi kerawanan pangan fase krisis+',
                            'en' => 'Gaza residents facing crisis food insecurity+',
                            'ar' => 'سكان غزة يواجهون مرحلة أزمة انعدام الأمن الغذائي+',
                        ],
                        'icon' => 'AlertTriangle',
                        'sumber' => 'IPC, Juli 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '100–132 Rb',
                        'label' => [
                            'id' => 'Balita di Gaza diproyeksikan malnutrisi akut',
                            'en' => 'Gaza toddlers facing acute malnutrition',
                            'ar' => 'أطفال غزة يواجهون سوء تغذية حاد',
                        ],
                        'icon' => 'Baby',
                        'sumber' => 'IPC, Snapshot 2025–2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '±18 Juta',
                        'label' => [
                            'id' => 'Warga Yaman hadapi krisis kerawanan pangan',
                            'en' => 'Yemenis facing acute food insecurity',
                            'ar' => 'مواطنون يمنيون يواجهون انعدام الأمن الغذائي',
                        ],
                        'icon' => 'Users',
                        'sumber' => 'IRC, Jan 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '~6,5 Juta',
                        'label' => [
                            'id' => 'Warga Somalia hadapi tingkat kelaparan tinggi',
                            'en' => 'Somalis facing high levels of hunger',
                            'ar' => 'مواطنون صوماليون يواجهون مستويات جوع حادة',
                        ],
                        'icon' => 'Flame',
                        'sumber' => 'PBB/Pemerintah Somalia, Agu 2026',
                    ],
                    // Blok B: Metrik Capaian Internal Insani
                    [
                        'tipe' => 'capaian',
                        'value' => '152',
                        'label' => [
                            'id' => 'Total Program',
                            'en' => 'Total Programs',
                            'ar' => 'إجمالي البرامج',
                        ],
                        'icon' => 'Layers',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '40.096',
                        'label' => [
                            'id' => 'Penerima Manfaat',
                            'en' => 'Beneficiaries',
                            'ar' => 'المستفيدون',
                        ],
                        'icon' => 'Users',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '123',
                        'label' => [
                            'id' => 'Bantuan Sembako',
                            'en' => 'Food Packages',
                            'ar' => 'طرود غذائية',
                        ],
                        'icon' => 'Package',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '29',
                        'label' => [
                            'id' => 'Pangan Siap Santap',
                            'en' => 'Ready Meals',
                            'ar' => 'وجبات جاهزة',
                        ],
                        'icon' => 'Utensils',
                    ],
                ],
                'icon' => 'Utensils',
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_focus_program' => true,
                'is_active' => true,
                'sort_order' => 1,
            ],

            // ==========================================
            // 2. KETERSEDIAAN AIR (Fokus Program 2)
            // ==========================================
            [
                'slug' => 'ketersediaan-air',
                'name' => [
                    'id' => 'Air Bersih',
                    'en' => 'Clean Water',
                    'ar' => 'المياه النظيفة',
                ],
                'public_name' => [
                    'id' => 'Ketersediaan Air',
                    'en' => 'Clean Water & Sanitation Access',
                    'ar' => 'توفير المياه الصالحة للشرب',
                ],
                'description' => [
                    'id' => 'Penyediaan akses air bersih melalui infrastruktur permanen (sumur bor, desalinasi) dan armada tangki air darurat ke titik krisis kekeringan dan konflik.',
                    'en' => 'Providing safe water access through permanent infrastructure (wells, desalination) and emergency water trucking in drought-stricken areas.',
                    'ar' => 'تأمين الحصول على المياه الصالحة للشرب من خلال حفر الآبار ومحطات التحلية وصهاريج التوزيع الطارئة في مناطق الجفاف والنزاعات.',
                ],
                // BLOK A: Realita & Urgensi Lapangan
                'reality_title' => [
                    'id' => 'Air yang Semakin Sulit Dijangkau',
                    'en' => 'Water Becoming Increasingly Out of Reach',
                    'ar' => 'المياه تزداد صعوبة في الوصول إليها',
                ],
                'reality_description' => [
                    'id' => 'Krisis air paling ekstrem hari ini terjadi di Gaza: hampir seluruh infrastruktur air dan sanitasi rusak atau hancur, memaksa mayoritas penduduk bergantung pada air kiriman truk yang pasokannya sendiri terancam terhenti. Sebagian keluarga bahkan hanya mendapat beberapa liter air per hari — jauh di bawah standar minimum kemanusiaan untuk minum dan memasak. Di Indonesia, meski akses air minum layak terus membaik secara nasional, kesenjangan antarwilayah masih tajam — rumah tangga di kawasan 3T (Tertinggal, Terdepan, Terluar) dan sejumlah provinsi seperti Papua masih jauh tertinggal dari rata-rata nasional dalam mengakses air bersih dan layak.',
                    'en' => 'The most severe water crisis today unfolds in Gaza: nearly all water and sanitation infrastructure has been damaged or destroyed, forcing the majority of residents to rely on water trucking whose supply chains face constant shutdown. Many families receive only a few liters of water per day — far below minimum humanitarian standards for drinking and hygiene. In Indonesia, despite overall national improvements, regional disparities remain stark — households in remote frontline regions (3T) and provinces like Papua remain significantly behind national averages in securing clean, potable water.',
                    'ar' => 'تتجسد أزمة المياه الأكثر حدة اليوم في قطاع غزة: حيث تضررت أو دمرت معظم شبكات المياه والصرف الصحي، مما اضطر غالبية السكان للاعتماد على صهاريج المياه المعرضة للتوقف باستمرار، ولا يحصل الكثير من العائلات سوى على لترات معدودة يومياً وهو ما يقل كثيراً عن المعايير الإنسانية الدنيا. وفي إندونيسيا، ورغم التحسن العام، ما زالت الفجوة الجغرافية قائمة في المناطق النائية والحدودية ومحافظات مثل بابوا التي لا تزال متأخرة عن المتوسط الوطني في الوصول إلى المياه الصالحة للشرب.',
                ],
                'reality_source' => 'UNRWA, OCHA & BPS (2026)',
                // BLOK B: Capaian Program Insani
                'impact_title' => [
                    'id' => 'Menjembatani Kebutuhan Air, dari Sumur hingga Tangki',
                    'en' => 'Bridging the Water Divide: From Deep Wells to Mobile Tanks',
                    'ar' => 'سد فجوة الاحتياج للمياه: من الآبار إلى الصهاريج',
                ],
                'impact_description' => [
                    'id' => "Insani menyediakan akses air bersih melalui dua jalur: pembangunan infrastruktur permanen dan distribusi langsung untuk kebutuhan mendesak, menjangkau Gaza, Yaman, Afrika, Suriah, hingga wilayah krisis air di Nusantara.\n\n• Bantuan Infrastruktur Air (1 Program · 100 Penerima Manfaat): Mesin penyulingan air, sumur, mobil tangki air, dan tempat wudhu di fasilitas keagamaan.\n• Distribusi Air (8 Program · 2.774 Penerima Manfaat): Penyaluran air layak konsumsi ke wilayah krisis akut.",
                    'en' => "Insani delivers vital access to clean water via two complementary pathways: permanent infrastructure development and rapid direct distribution for emergency needs, reaching Gaza, Yemen, Africa, Syria, and water-stressed areas of Indonesia.\n\n• Water Infrastructure (1 Program · 100 Beneficiaries): Desalination units, deep wells, mobile water trucks, and ablution facilities at places of worship.\n• Water Distribution (8 Programs · 2,774 Beneficiaries): Direct clean drinking water delivery to acute emergency zones.",
                    'ar' => "توفر إنساني المياه الصالحة للشرب عبر مسارين: إنشاء بنية تحتية دائمة وتوزيع مباشر لتلبية الاحتياجات العاجلة، لتصل إلى غزة واليمن وأفريقيا وسوريا ومناطق شح المياه بإندونيسيا.\n\n• مشاريع البنية التحتية المائية (برنامج واحد · 100 مستفيد): محطات تحلية المياه، الآبار الارتوازية، صهاريج المياه، وأماكن الوضوء بالمساجد.\n• قوافل توزيع المياه (8 برامج · 2,774 مستفيداً): إيصال المياه العذبة لمناطق الأزمات الحادة.",
                ],
                'stats_metrics' => [
                    // Blok A: Realita
                    [
                        'tipe' => 'realita',
                        'value' => '~90%',
                        'label' => [
                            'id' => 'Infrastruktur air & sanitasi Gaza rusak/hancur',
                            'en' => 'Gaza water & sanitation infrastructure damaged/destroyed',
                            'ar' => 'تضرر أو تدمير شبكات المياه والصرف في غزة',
                        ],
                        'icon' => 'AlertTriangle',
                        'sumber' => 'UNRWA, April 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '4,5–6 L',
                        'label' => [
                            'id' => 'Air per orang/hari di Gaza (standar WHO: 15 L)',
                            'en' => 'Water per person/day in Gaza (WHO standard: 15 L)',
                            'ar' => 'لتر من الماء للشخص يومياً بغزة (معيار الصحة: 15 لتر)',
                        ],
                        'icon' => 'Droplets',
                        'sumber' => 'OCHA, Maret 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '>70%',
                        'label' => [
                            'id' => 'Warga Gaza bergantung pasokan air tangki',
                            'en' => 'Gaza residents dependent on water trucking',
                            'ar' => 'سكان غزة يعتمدون كلياً على صهاريج المياه',
                        ],
                        'icon' => 'Truck',
                        'sumber' => 'OCHA, Juni 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '66,49%',
                        'label' => [
                            'id' => 'Akses air minum layak di Papua (terendah di RI)',
                            'en' => 'Safe drinking water access in Papua (lowest in ID)',
                            'ar' => 'الوصول للمياه الصالحة في بابوا (الأدنى في إندونيسيا)',
                        ],
                        'icon' => 'MapPin',
                        'sumber' => 'BPS, Indikator Perumahan',
                    ],
                    // Blok B: Capaian
                    [
                        'tipe' => 'capaian',
                        'value' => '9',
                        'label' => [
                            'id' => 'Total Program',
                            'en' => 'Total Programs',
                            'ar' => 'إجمالي البرامج',
                        ],
                        'icon' => 'Layers',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '2.874',
                        'label' => [
                            'id' => 'Penerima Manfaat',
                            'en' => 'Beneficiaries',
                            'ar' => 'المستفيدون',
                        ],
                        'icon' => 'Users',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '1',
                        'label' => [
                            'id' => 'Infrastruktur Air',
                            'en' => 'Water Infrastructure',
                            'ar' => 'بنية تحتية مائية',
                        ],
                        'icon' => 'CheckCircle2',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '8',
                        'label' => [
                            'id' => 'Distribusi Air',
                            'en' => 'Water Distribution',
                            'ar' => 'قوافل توزيع المياه',
                        ],
                        'icon' => 'Droplets',
                    ],
                ],
                'icon' => 'Droplets',
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_focus_program' => true,
                'is_active' => true,
                'sort_order' => 2,
            ],

            // ==========================================
            // 3. KESEHATAN BERSAMA (Fokus Program 3)
            // ==========================================
            [
                'slug' => 'kesehatan',
                'name' => [
                    'id' => 'Kesehatan',
                    'en' => 'Healthcare',
                    'ar' => 'الرعاية الصحية',
                ],
                'public_name' => [
                    'id' => 'Kesehatan Bersama',
                    'en' => 'Inclusive Healthcare',
                    'ar' => 'الصحة للجميع',
                ],
                'description' => [
                    'id' => 'Layanan medis jemput bola, bantuan biaya pengobatan dhuafa, penyediaan alat medis, serta sarana ambulans gratis bagi masyarakat prasejahtera.',
                    'en' => 'Mobile medical outreach, medical subsidies for the underprivileged, medical equipment assistance, and free emergency ambulances.',
                    'ar' => 'خدمات الرعاية الصحية المتنقلة، والمساعدة في تكاليف العلاج، وتوفير المعدات الطبية وسيارات الإسعاف المجانية.',
                ],
                // BLOK A: Realita & Urgensi Lapangan
                'reality_title' => [
                    'id' => 'Sistem Kesehatan yang Nyaris Lumpuh',
                    'en' => 'Healthcare Systems on the Verge of Collapse',
                    'ar' => 'منظومات صحية على حافة الانهيار التام',
                ],
                'reality_description' => [
                    'id' => 'Layanan kesehatan di sejumlah wilayah krisis kini berada di titik nyaris kolaps. Di Gaza, mayoritas fasilitas medis rusak atau hancur, hanya sebagian kecil rumah sakit yang masih bisa beroperasi — itu pun dengan kekurangan obat, alat, dan tenaga medis yang parah. Ribuan pasien yang butuh perawatan lanjutan tidak bisa dievakuasi ke luar Gaza, dan sebagian di antaranya meninggal saat menunggu. Di Yaman, hampir separuh fasilitas kesehatan hanya berfungsi sebagian atau sudah tidak beroperasi sama sekali — memutus akses layanan dasar bagi jutaan warga yang justru paling membutuhkannya di tengah krisis kemanusiaan yang berkepanjangan.',
                    'en' => 'Healthcare services across multiple crisis regions have reached the brink of total collapse. In Gaza, the vast majority of medical facilities lie damaged or destroyed, leaving only a fraction of hospitals partially operational under severe shortages of medicines, power, and medical personnel. Thousands of critical patients awaiting medical evacuation remain stranded, with many passing away while waiting. In Yemen, nearly half of all health facilities are only partially functional or completely shut down, cutting off essential care for millions of vulnerable families enduring endless humanitarian hardship.',
                    'ar' => 'وصلت الخدمات الصحية في العديد من مناطق النزاع إلى حافة الانهيار التام. ففي قطاع غزة، دُمّرت وتضررت معظم المنشآت الطبية، ولم يعد يعمل سوى عدد ضئيل من المستشفيات في ظل نقص حاد في الأدوية والمستلزمات والكوادر الطبية. وينتظر آلاف المرضى الإجلاء الطبي العاجل دون جدوى، ما أودى بحياة الكثيرين أثناء الانتظار. وفي اليمن، أصبحت قرابة نصف المرافق الصحية معطلة جزئياً أو كلياً، مما يحرم ملايين المحتاجين من حقهم الأساسي في العلاج وسط كوارث إنسانية متتالية.',
                ],
                'reality_source' => 'PCBS, WHO & UNICEF (2026)',
                // BLOK B: Capaian Program Insani
                'impact_title' => [
                    'id' => 'Menjaga Denyut Layanan Kesehatan di Titik Krisis',
                    'en' => 'Preserving the Pulse of Healthcare in Crisis Zones',
                    'ar' => 'الحفاظ على نبض الرعاية الصحية في بؤر الأزمات',
                ],
                'impact_description' => [
                    'id' => "Insani mengupayakan pemenuhan hak sehat melalui tiga pilar: layanan kesehatan yang menjangkau langsung masyarakat, bantuan pengobatan dan alat kesehatan, serta infrastruktur kesehatan — menjangkau Nusantara hingga Gaza, Yaman, Suriah, Afrika, dan Rohingya.\n\n• Layanan Kesehatan (6 Program · 206 Penerima Manfaat): Ambulans gratis, donor darah, medical check up, fogging, dan penyemprotan disinfektan.\n• Bantuan Kesehatan (10 Program · 544 Penerima Manfaat): Pengobatan dan alat kesehatan bagi yang tidak memiliki akses memadai.\n• Infrastruktur Kesehatan: Pembangunan sarana kesehatan permanen, termasuk armada ambulans.",
                    'en' => "Insani works to fulfill the right to healthcare across three essential pillars: mobile community health outreach, treatment subsidies and medical supplies, and healthcare infrastructure — spanning Indonesia to Gaza, Yemen, Syria, Africa, and Rohingya.\n\n• Direct Healthcare (6 Programs · 206 Beneficiaries): Free ambulances, blood drives, routine check-ups, and disease prevention sanitation.\n• Medical Aid (10 Programs · 544 Beneficiaries): Medical treatments and assistive devices for underprivileged patients.\n• Health Infrastructure: Developing healthcare facilities and maintaining rapid emergency ambulance fleets.",
                    'ar' => "تسعى إنساني لضمان الحق في الصحة عبر ثلاث ركائز: الخدمات الطبية الميدانية المباشرة، والإعانات العلاجية والأجهزة الطبية، والبنية التحتية الصحية من إندونيسيا إلى غزة واليمن وسوريا وأفريقيا والروهينغا.\n\n• الخدمات الصحية (6 برامج · 206 مستفيدين): سيارات الإسعاف المجانية، حملات التبرع بالدم، والفحوصات الدورية ومكافحة الأوبئة.\n• المساعدات العلاجية (10 برامج · 544 مستفيداً): توفير الأدوية والأجهزة التعويضية للمرضى الأشد احتياجاً.\n• البنية التحتية الصحية: تجهيز المرافق الطبية ودعم أسطول الإسعاف.",
                ],
                'stats_metrics' => [
                    // Blok A: Realita
                    [
                        'tipe' => 'realita',
                        'value' => '94%',
                        'label' => [
                            'id' => 'Fasilitas medis di Gaza rusak berat/hancur',
                            'en' => 'Gaza medical facilities heavily damaged/destroyed',
                            'ar' => 'المرافق الطبية في غزة متضررة بشكل فادح أو مدمرة',
                        ],
                        'icon' => 'AlertTriangle',
                        'sumber' => 'PCBS, Maret 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '26 dari 38',
                        'label' => [
                            'id' => 'Rumah sakit di Gaza tidak lagi beroperasi',
                            'en' => 'Hospitals in Gaza completely out of service',
                            'ar' => 'مستشفى في غزة خارج الخدمة تماماً',
                        ],
                        'icon' => 'Building',
                        'sumber' => 'Jaringan LSM Gaza, Sep 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '>18.500',
                        'label' => [
                            'id' => 'Pasien tunggu evakuasi medis di Gaza (>4.000 anak)',
                            'en' => 'Patients awaiting medical evacuation in Gaza (>4k children)',
                            'ar' => 'مريض ينتظرون الإجلاء الطبي في غزة (>4000 طفل)',
                        ],
                        'icon' => 'Users',
                        'sumber' => 'Parlemen Inggris (WHO), Feb 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '40%',
                        'label' => [
                            'id' => 'Fasilitas kesehatan Yaman non-aktif/sebagian',
                            'en' => 'Yemen health facilities non-functional/partial',
                            'ar' => 'المرافق الصحية باليمن معطلة كلياً أو جزئياً',
                        ],
                        'icon' => 'Activity',
                        'sumber' => 'UNICEF, awal 2026',
                    ],
                    // Blok B: Capaian
                    [
                        'tipe' => 'capaian',
                        'value' => '16',
                        'label' => [
                            'id' => 'Total Program',
                            'en' => 'Total Programs',
                            'ar' => 'إجمالي البرامج',
                        ],
                        'icon' => 'Layers',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '750',
                        'label' => [
                            'id' => 'Penerima Manfaat',
                            'en' => 'Beneficiaries',
                            'ar' => 'المستفيدون',
                        ],
                        'icon' => 'Users',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '6',
                        'label' => [
                            'id' => 'Layanan Medis Langsung',
                            'en' => 'Direct Medical Services',
                            'ar' => 'خدمات طبية مباشرة',
                        ],
                        'icon' => 'Activity',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '10',
                        'label' => [
                            'id' => 'Bantuan Pengobatan',
                            'en' => 'Treatment Grants',
                            'ar' => 'منح علاجية',
                        ],
                        'icon' => 'Heart',
                    ],
                ],
                'icon' => 'HeartPulse',
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_focus_program' => true,
                'is_active' => true,
                'sort_order' => 3,
            ],

            // ==========================================
            // 4. PENDIDIKAN BERKUALITAS (Fokus Program 4)
            // ==========================================
            [
                'slug' => 'pendidikan',
                'name' => [
                    'id' => 'Pendidikan',
                    'en' => 'Education',
                    'ar' => 'التعليم',
                ],
                'public_name' => [
                    'id' => 'Pendidikan Berkualitas',
                    'en' => 'Quality Education for All',
                    'ar' => 'التعليم النوعي والشامل',
                ],
                'description' => [
                    'id' => 'Jalan keluar paling berkelanjutan dari lingkaran kemiskinan: beasiswa yatim & santri dhuafa, gerakan relawan mengajar, hingga pembangunan ruang belajar dan pesantren.',
                    'en' => 'The most sustainable exit from poverty: scholarships for orphans and students, volunteer teaching initiatives, and building schools.',
                    'ar' => 'السبيل الأكثر استدامة للخروج من الفقر: كفالة الطلاب والأيتام، ومبادرات المتطوعين التعليمية، وبناء المدارس والمراكز التعليمية.',
                ],
                // BLOK A: Realita & Urgensi Lapangan
                'reality_title' => [
                    'id' => 'Generasi yang Kehilangan Ruang Kelas',
                    'en' => 'A Generation Losing Their Classrooms',
                    'ar' => 'جيل كامل يفقد مقاعد الدراسة',
                ],
                'reality_description' => [
                    'id' => 'Bagi ratusan ribu anak di Gaza, tahun ajaran baru kini identik dengan tenda, bukan ruang kelas. Hampir seluruh bangunan sekolah rusak atau hancur setelah bertahun-tahun konflik, memaksa proses belajar berpindah ke tenda darurat, pusat belajar sementara, atau berhenti sama sekali bagi sebagian anak. Ini bukan sekadar kehilangan satu tahun ajaran — ini adalah generasi yang kehilangan jalur normal menuju masa depan: dari sekolah ke perguruan tinggi, pelatihan kerja, atau dunia kerja. Semakin lama gangguan pendidikan berlangsung, semakin besar pula dampaknya yang sulit dipulihkan pada perkembangan dan peluang hidup anak-anak tersebut.',
                    'en' => 'For hundreds of thousands of children in Gaza, the school year has become synonymous with makeshift tents rather than classrooms. Nearly all school buildings lie damaged or destroyed by prolonged bombardment, forcing learning into overcrowded emergency tents, temporary learning spaces, or halting education altogether. This is not just a missed academic semester — it is a generation stripped of their standard path to adulthood, higher education, and dignified livelihoods. The longer this disruption persists, the deeper the irreparable scars on their cognitive growth and future opportunities.',
                    'ar' => 'بالنسبة لمئات الآلاف من أطفال غزة، أصبح العام الدراسي مرادفاً للخيام البالية بدلاً من الفصول الدراسية النظامية. فقد تعرضت معظم المباني المدرسية للتدمير أو الأضرار الجسيمة نتيجة النزاع المستمر، مما دفع عملية التعليم إلى خيام الطوارئ أو مراكز التعلم المؤقتة أو التوقف الكلي لكثير من الأطفال. هذه ليست مجرد خسارة عام دراسي، بل جيل يفقد مساره الطبيعي نحو بناء مستقبله والالتحاق بالجامعات والعمل، وكلما طال أمد هذا الانقطاع، تفاقمت آثاره المدمرة على نموهم النفسي وفرص حياتهم.',
                ],
                'reality_source' => 'UNICEF & Save the Children (2026)',
                // BLOK B: Capaian Program Insani
                'impact_title' => [
                    'id' => 'Menjaga Nyala Harapan Lewat Pendidikan',
                    'en' => 'Igniting Hope Through Resilient Education',
                    'ar' => 'إبقاء شعلة الأمل متقدة عبر التعليم',
                ],
                'impact_description' => [
                    'id' => "Insani meyakini pendidikan sebagai jalan paling berkelanjutan keluar dari kemiskinan — pendekatannya menyeluruh: bantuan langsung bagi siswa dan pendidik, penyelenggaraan pendidikan bagi kelompok yang terpinggirkan dari sistem formal, serta pembangunan infrastruktur belajar.\n\n• Bantuan Pendidikan (24 Program · 991 Penerima Manfaat): Beasiswa anak yatim, santri, penghafal Qur'an, siswa berprestasi, hingga insentif guru honorer dan guru ngaji.\n• Penyelenggaraan Program Pendidikan (299 Program · 14.947 Penerima Manfaat): Pendidikan anak jalanan usia dini, anak di area lokalisasi, dan gerakan relawan mengajar.\n• Infrastruktur Pendidikan (10 Program · 1.395 Penerima Manfaat): Masjid, rumah tahfidz, bangunan sekolah, dan pesantren.",
                    'en' => "Insani champions education as the most sustainable exit from poverty through an integrated methodology: direct aid for students and teachers, educational programs for marginalized groups outside the formal system, and physical learning infrastructure.\n\n• Educational Assistance (24 Programs · 991 Beneficiaries): Scholarships for orphans, Quran memorizers, high-achieving students, and stipends for underprivileged teachers.\n• Educational Initiatives (299 Programs · 14,947 Beneficiaries): Early childhood street education, rehabilitation programs for marginalized youth, and volunteer tutoring.\n• Educational Infrastructure (10 Programs · 1,395 Beneficiaries): Mosques, tahfidz learning centers, and school buildings.",
                    'ar' => "تؤمن إنساني بأن التعليم هو السبيل الأمثل والمستدام للخروج من دائرة الفقر عبر منهج شامل: الدعم المباشر للطلاب والمعلمين، توفير التعليم للفئات المهمشة، وبناء وتطوير البيئة المدرسية.\n\n• الدعم التعليمي (24 برنامجاً · 991 مستفيداً): كفالة الطلاب الأيتام، حفظة القرآن، والمنح الدراسية ومكافآت معلمي القرى والمناطق النائية.\n• تنظيم البرامج التعليمية (299 برنامجاً · 14,947 مستفيداً): تعليم أطفال الشوارع والمحرومين وقوافل المتطوعين التعليمية.\n• البنية التحتية التعليمية (10 برامج · 1,395 مستفيداً): بناء وترميم المدارس ومراكز التحفيظ والمصليات التعليمية.",
                ],
                'stats_metrics' => [
                    // Blok A: Realita
                    [
                        'tipe' => 'realita',
                        'value' => '97,5%',
                        'label' => [
                            'id' => 'Sekolah di Gaza rusak atau hancur',
                            'en' => 'Schools in Gaza damaged or destroyed',
                            'ar' => 'المدارس في غزة متضررة أو مدمرة',
                        ],
                        'icon' => 'AlertTriangle',
                        'sumber' => 'UNICEF, 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '~658–700 Rb',
                        'label' => [
                            'id' => 'Anak usia sekolah di Gaza hilang akses formal',
                            'en' => 'School-age children in Gaza deprived of education',
                            'ar' => 'طفل في سن الدراسة بغزة فقدوا حق التعليم',
                        ],
                        'icon' => 'GraduationCap',
                        'sumber' => 'UNICEF / Save the Children, 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '~39%',
                        'label' => [
                            'id' => 'Anak Gaza tercatat di ruang belajar sementara',
                            'en' => 'Gaza children in temporary learning spaces',
                            'ar' => 'أطفال غزة المسجلين بمساحات التعلم المؤقتة',
                        ],
                        'icon' => 'BookOpen',
                        'sumber' => 'OCHA, 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '>834.000',
                        'label' => [
                            'id' => 'Anak usia sekolah Tepi Barat tanpa akses aman',
                            'en' => 'West Bank children without safe education access',
                            'ar' => 'طالب في الضفة الغربية يفتقرون للتعليم الآمن',
                        ],
                        'icon' => 'Users',
                        'sumber' => 'Education Cluster, Sep 2026',
                    ],
                    // Blok B: Capaian
                    [
                        'tipe' => 'capaian',
                        'value' => '333',
                        'label' => [
                            'id' => 'Total Program',
                            'en' => 'Total Programs',
                            'ar' => 'إجمالي البرامج',
                        ],
                        'icon' => 'Layers',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '17.333',
                        'label' => [
                            'id' => 'Penerima Manfaat',
                            'en' => 'Beneficiaries',
                            'ar' => 'المستفيدون',
                        ],
                        'icon' => 'Users',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '299',
                        'label' => [
                            'id' => 'Program Pembelajaran',
                            'en' => 'Learning Initiatives',
                            'ar' => 'برامج تعليمية',
                        ],
                        'icon' => 'BookOpen',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '24',
                        'label' => [
                            'id' => 'Beasiswa & Guru Ngaji',
                            'en' => 'Scholarships & Teachers',
                            'ar' => 'منح ورعاية معلمين',
                        ],
                        'icon' => 'Award',
                    ],
                ],
                'icon' => 'GraduationCap',
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_focus_program' => true,
                'is_active' => true,
                'sort_order' => 4,
            ],

            // ==========================================
            // 5. PEMBERDAYAAN EKONOMI (Fokus Program 5)
            // ==========================================
            [
                'slug' => 'pemberdayaan',
                'name' => [
                    'id' => 'Pemberdayaan',
                    'en' => 'Empowerment',
                    'ar' => 'التمكين',
                ],
                'public_name' => [
                    'id' => 'Pemberdayaan Ekonomi',
                    'en' => 'Economic Empowerment',
                    'ar' => 'التمكين الاقتصادي والمشاريع',
                ],
                'description' => [
                    'id' => 'Mengubah ketergantungan menjadi kemandirian melalui siklus utuh: pelatihan vokasi, hibah modal usaha mikro, dan pendampingan bisnis berkelanjutan.',
                    'en' => 'Transforming dependency into self-reliance through vocational skill training, micro-business seed capital, and sustainable business mentoring.',
                    'ar' => 'تحويل الاعتماد على المساعدة إلى الاستقلال المالي من خلال التدريب المهني ورؤوس أموال المشاريع والمتابعة المستمرة.',
                ],
                // BLOK A: Realita & Urgensi Lapangan
                'reality_title' => [
                    'id' => 'Jurang Ekonomi yang Masih Menganga',
                    'en' => 'A Widening Economic Abyss',
                    'ar' => 'الفجوة الاقتصادية الآخذة في الاتساع',
                ],
                'reality_description' => [
                    'id' => 'Di Nusantara, kemiskinan bukan sekadar angka di atas kertas — ia menentukan siapa yang bisa menyekolahkan anak, berobat, atau sekadar makan layak hari ini. Meski angka kemiskinan versi pemerintah menunjukkan tren membaik, standar kemiskinan internasional yang disesuaikan untuk negara berpendapatan menengah-atas menunjukkan potret yang jauh lebih luas: mayoritas penduduk Indonesia masih berada dalam rentang rentan secara ekonomi. Di wilayah krisis kemanusiaan seperti Gaza, kehancuran ekonomi bahkan lebih ekstrem — nyaris seluruh angkatan kerja kehilangan mata pencaharian akibat konflik berkepanjangan, membuat pemberdayaan ekonomi bukan sekadar program bantuan, melainkan syarat mutlak pemulihan jangka panjang.',
                    'en' => 'Across Indonesia, poverty is far more than a statistical metric — it dictates who can afford schooling, healthcare, or sufficient daily meals. While national government metrics show gradual improvement, international poverty thresholds calibrated for upper-middle-income countries paint a sobering portrait: a vast majority of Indonesians remain economically vulnerable. In crisis zones like Gaza, economic devastation is catastrophic — virtually the entire workforce has lost their livelihoods to protracted war, making economic empowerment not merely charity, but an indispensable imperative for long-term survival.',
                    'ar' => 'في إندونيسيا، ليس الفقر مجرد رقم إحصائي، بل هو ما يحدد قدرة الأسر على تعليم أبنائها أو تلقي العلاج أو تأمين قوت يومها. وبينما تشير الإحصاءات الرسمية لبوادر تحسن، فإن معايير الفقر الدولية للدول متوسطة الدخل الأعلى تكشف واقعاً صادماً؛ حيث تعيش النسبة الأكبر من السكان في حالة هشاشة اقتصادية. وفي مناطق الأزمات والحروب كغزة، يبدو المشهد الاقتصادي كارثياً مع فقدان القوى العاملة لمصادر دخلها، مما يجعل التمكين الاقتصادي شرطاً حيوياً للتعافي والاستقرار.',
                ],
                'reality_source' => 'BPS, Bank Dunia & PCBS (2026)',
                // BLOK B: Capaian Program Insani
                'impact_title' => [
                    'id' => 'Dari Bergantung Menjadi Berdaya',
                    'en' => 'From Dependency to Dignified Self-Reliance',
                    'ar' => 'من الاعتماد على المساعدة إلى التمكين الذاتي',
                ],
                'impact_description' => [
                    'id' => "Insani mengangkat sosio-ekonomi masyarakat lapisan bawah melalui tiga tahap yang saling menyambung: pelatihan keterampilan, permodalan usaha, dan pendampingan berkelanjutan.\n\n• Program Pelatihan: Pembekalan keterampilan usaha mikro, menjahit, desain, dan sablon.\n• Bantuan Pemodalan (3 Program · 17 Penerima Manfaat): Modal usaha gerobak, warung kelontong, hingga ternak.\n• Program Pendampingan (1 Program · 15 Penerima Manfaat): Pendampingan pasca-pemodalan agar usaha benar-benar naik kelas.",
                    'en' => "Insani empowers the socio-economic standing of marginalized communities through three interlinked steps: vocational skills training, enterprise capitalization, and ongoing business guidance.\n\n• Skill Training: Practical workshops in micro-business, tailoring, graphic design, and screen printing.\n• Capital Assistance (3 Programs · 17 Beneficiaries): Seed funding for food stalls, small grocery kiosks, and livestock.\n• Business Mentorship (1 Program · 15 Beneficiaries): Hands-on post-capital coaching ensuring sustainable enterprise growth.",
                    'ar' => "ترتقي إنساني بالمستوى المعيشي للفئات المتعففة عبر ثلاث مراحل متكاملة: التدريب المهني، والتمويل التأسيسي، والمرافقة التنموية المستمرة.\n\n• البرامج التدريبية: تزويد المستفيدين بالمهارات المهنية كالحياكة، التصميم، والطباعة وإدارة المشاريع.\n• الدعم التمويلي (3 برامج · 17 مستفيداً): رؤوس أموال لمشاريع الأكشاك والمتاجر وتربية الماشية.\n• برامج المتابعة والتوجيه (برنامج واحد · 15 مستفيداً): إشراف مستمر بعد التمويل لضمان نجاح المشاريع واستدامتها.",
                ],
                'stats_metrics' => [
                    // Blok A: Realita
                    [
                        'tipe' => 'realita',
                        'value' => '8,07%',
                        'label' => [
                            'id' => 'Tingkat kemiskinan nasional (garis BPS)',
                            'en' => 'National poverty rate (BPS threshold)',
                            'ar' => 'معدل الفقر الوطني الرسمي بإندونيسيا',
                        ],
                        'icon' => 'TrendingUp',
                        'sumber' => 'BPS, Maret 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '64,1%',
                        'label' => [
                            'id' => 'Warga rentan miskin Bank Dunia ($8,30/hari)',
                            'en' => 'Population below World Bank poverty line ($8.30/day)',
                            'ar' => 'سكان دون خط الفقر للبنك الدولي (8.30 دولار/يوم)',
                        ],
                        'icon' => 'AlertTriangle',
                        'sumber' => 'BPS & Bank Dunia, Sep 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '~80%',
                        'label' => [
                            'id' => 'Tingkat pengangguran Gaza pasca-konflik',
                            'en' => 'Gaza post-conflict unemployment rate',
                            'ar' => 'معدل البطالة في غزة بعد النزاع الممتد',
                        ],
                        'icon' => 'Users',
                        'sumber' => 'PCBS, 2026',
                    ],
                    // Blok B: Capaian
                    [
                        'tipe' => 'capaian',
                        'value' => '4',
                        'label' => [
                            'id' => 'Total Program',
                            'en' => 'Total Programs',
                            'ar' => 'إجمالي البرامج',
                        ],
                        'icon' => 'Layers',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '32',
                        'label' => [
                            'id' => 'Penerima Manfaat',
                            'en' => 'Beneficiaries',
                            'ar' => 'المستفيدون',
                        ],
                        'icon' => 'Users',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '3',
                        'label' => [
                            'id' => 'Bantuan Modal Usaha',
                            'en' => 'Business Seed Capital',
                            'ar' => 'رأس مال مشاريع',
                        ],
                        'icon' => 'Coins',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '1',
                        'label' => [
                            'id' => 'Program Pendampingan',
                            'en' => 'Mentorship Program',
                            'ar' => 'مجموعات إرشادية',
                        ],
                        'icon' => 'CheckCircle2',
                    ],
                ],
                'icon' => 'TrendingUp',
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_focus_program' => true,
                'is_active' => true,
                'sort_order' => 5,
            ],

            // ==========================================
            // 6. TANGGAP BENCANA (Fokus Program 6)
            // ==========================================
            [
                'slug' => 'bencana-alam',
                'name' => [
                    'id' => 'Bencana Alam',
                    'en' => 'Natural Disasters',
                    'ar' => 'الكوارث الطبيعية',
                ],
                'public_name' => [
                    'id' => 'Tanggap Bencana',
                    'en' => 'Disaster Response & Recovery',
                    'ar' => 'الاستجابة للكوارث والطوارئ',
                ],
                'description' => [
                    'id' => 'Siklus terpadu penanggulangan bencana: mitigasi siaga bencana, evakuasi dan dapur darurat di titik krisis, hingga pembangunan hunian sementara (huntara).',
                    'en' => 'An integrated disaster management cycle: proactive preparedness, emergency rescue and relief kitchens, through to transitional shelters and recovery.',
                    'ar' => 'دورة شاملة لإدارة الكوارث: الجاهزية والاستعداد الاستباقي، والإنقاذ والإغاثة العاجلة، وصولاً لبناء المآوي المؤقتة وإعادة الإعمار.',
                ],
                // BLOK A: Realita & Urgensi Lapangan
                'reality_title' => [
                    'id' => 'Negeri Rawan Bencana, Dunia yang Terus Bergejolak',
                    'en' => 'A Disaster-Prone Homeland, A World in Perpetual Turmoil',
                    'ar' => 'وطن عرضة للكوارث وعالم يموج بالاضطرابات',
                ],
                'reality_description' => [
                    'id' => 'Indonesia adalah salah satu negara paling rawan bencana di dunia — bukan isu sesekali, melainkan realita yang berulang setiap tahun: ribuan kejadian banjir, tanah longsor, cuaca ekstrem, kebakaran hutan dan lahan, hingga gempa bumi, dengan ratusan ribu jiwa terdampak dan mengungsi setiap tahunnya. Pada saat yang sama, krisis kemanusiaan akibat konflik di Gaza dan Yaman terus memproduksi gelombang pengungsian baru — puluhan hingga ratusan ribu orang, termasuk anak-anak, terpaksa meninggalkan rumah mereka hanya dalam hitungan minggu. Dua wajah bencana ini — alam dan kemanusiaan — sama-sama menuntut kesiapan merespons cepat sekaligus komitmen jangka panjang untuk memulihkan kehidupan korban.',
                    'en' => 'Indonesia ranks among the most disaster-prone countries globally — where catastrophes are not isolated incidents, but an annual reality: thousands of floods, landslides, extreme weather events, forest fires, and earthquakes displace hundreds of thousands of people each year. Concurrently, human-made crises in Gaza and Yemen continuously displace vulnerable populations — tens of thousands of families, predominantly children, are uprooted from their homes within weeks. Both faces of calamity — natural and conflict-driven — demand rapid emergency readiness combined with unwavering long-term commitment to restore dignity and livelihoods.',
                    'ar' => 'تعد إندونيسيا من أكثر دول العالم عرضة للكوارث الطبيعية، حيث تتكرر سنوياً آلاف الفيضانات والانهيارات الأرضية والزلازل والحرائق التي تخلف مئات الآلاف من المتضررين والنازحين. وفي الوقت ذاته، تفرز الأزمات والحروب في غزة واليمن موجات نزوح قسري متلاحقة تُجبر آلاف العائلات والأطفال على ترك منازلهم في غضون أسابيع. يفرض هذا المشهد المزدوج — بين كوارث الطبيعة وأزمات الحروب — جاهزية استجابة فورية والتزاماً مستداماً لإعادة إعمار حياة المتضررين.',
                ],
                'reality_source' => 'BNPB & UNICEF (2025–2026)',
                // BLOK B: Capaian Program Insani
                'impact_title' => [
                    'id' => 'Siaga, Hadir, dan Tak Berhenti di Titik Darurat',
                    'en' => 'Alert, Present, and Unwavering Beyond Emergency Lines',
                    'ar' => 'متأهبون، حاضرون، ولا نتوقف عند حدود الطوارئ',
                ],
                'impact_description' => [
                    'id' => "Insani membangun fokus Tanggap Bencana sebagai satu siklus utuh: siaga sebelum bencana datang, darurat saat bencana terjadi, dan pemulihan jauh setelah sorotan publik meredup.\n\n• Siaga Bencana: Penguatan kapasitas relawan, kesiapan peralatan tanggap darurat, dan mitigasi lingkungan jangka panjang — investasi kesiapsiagaan yang menentukan seberapa besar dampak bencana di kemudian hari.\n• Darurat Bencana (27 Program · 12.955 Penerima Manfaat): SAR, dapur darurat, bantuan logistik korban, posko bencana, bantuan musim dingin bagi pengungsi.\n• Pemulihan Bencana (10 Program · 907 Penerima Manfaat): Trauma healing, HUNTARA, shelter pengungsian, pemulihan ekonomi pasca-bencana.",
                    'en' => "Insani structures its Disaster Response as a comprehensive full-cycle mandate: preparedness before disaster strikes, rapid relief during crises, and rehabilitation long after the headlines fade.\n\n• Disaster Readiness: Volunteer capacity building, emergency equipment deployment, and ecological mitigation investments.\n• Emergency Response (27 Programs · 12,955 Beneficiaries): Search and rescue operations, community kitchens, emergency supply kits, disaster posts, and refugee winterization aid.\n• Post-Disaster Recovery (10 Programs · 907 Beneficiaries): Trauma healing, transitional shelters (HUNTARA), sanitization, and community economic restoration.",
                    'ar' => "تتبنى إنساني في برنامج الاستجابة للكوارث دورة عمل متكاملة: الجاهزية المسبقة، الإغاثة الطارئة، وإعادة التأهيل بعد انحسار الأزمة.\n\n• الجاهزية والاستعداد: تدريب المتطوعين، صيانة معدات الإنقاذ، ومشاريع الحماية البيئية والوقائية.\n• الإغاثة الطارئة (27 برنامجاً · 12,955 مستفيداً): عمليات الإنقاذ، المطابخ الميدانية، المساعدات اللوجستية، ومخيمات الإيواء والإغاثة الشتوية.\n• التعافي وإعادة الإعمار (10 برامج · 907 مستفيدين): الدعم النفسي، بناء المآوي المؤقتة (هونتارا)، والتعافي الاقتصادي للأسر المنكوبة.",
                ],
                'stats_metrics' => [
                    // Blok A: Realita
                    [
                        'tipe' => 'realita',
                        'value' => '2.606',
                        'label' => [
                            'id' => 'Kejadian bencana di RI (banjir, cuaca, karhutla)',
                            'en' => 'Disasters in Indonesia (floods, weather, fires)',
                            'ar' => 'كارثة في إندونيسيا (فيضانات، طقس متطرف، حرائق)',
                        ],
                        'icon' => 'AlertTriangle',
                        'sumber' => 'BNPB, Okt 2025',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '1.134',
                        'label' => [
                            'id' => 'Bencana di Indonesia sepanjang Semester I 2026',
                            'en' => 'Disasters across Indonesia in H1 2026',
                            'ar' => 'كارثة في إندونيسيا خلال النصف الأول 2026',
                        ],
                        'icon' => 'Flame',
                        'sumber' => 'BNPB, Jul 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '253.601',
                        'label' => [
                            'id' => 'Korban terdampak & mengungsi bencana RI (1 bln)',
                            'en' => 'Displaced disaster victims in Indonesia (1 mo)',
                            'ar' => 'متضرر ونازح جراء الكوارث بإندونيسيا خلال شهر',
                        ],
                        'icon' => 'Users',
                        'sumber' => 'BNPB, Mei 2026',
                    ],
                    [
                        'tipe' => 'realita',
                        'value' => '104.000',
                        'label' => [
                            'id' => 'Warga Yaman mengungsi dlm 2 pekan (>57 rb anak)',
                            'en' => 'Yemenis displaced in 2 weeks (>57k children)',
                            'ar' => 'يمني نزحوا خلال أسبوعين (>57 ألف طفل)',
                        ],
                        'icon' => 'Truck',
                        'sumber' => 'UNICEF, Sep 2026',
                    ],
                    // Blok B: Capaian
                    [
                        'tipe' => 'capaian',
                        'value' => '37',
                        'label' => [
                            'id' => 'Total Program',
                            'en' => 'Total Programs',
                            'ar' => 'إجمالي البرامج',
                        ],
                        'icon' => 'Layers',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '13.862',
                        'label' => [
                            'id' => 'Penerima Manfaat',
                            'en' => 'Beneficiaries',
                            'ar' => 'المستفيدون',
                        ],
                        'icon' => 'Users',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '27',
                        'label' => [
                            'id' => 'Aksi Tanggap Darurat',
                            'en' => 'Emergency Response',
                            'ar' => 'استجابة طارئة',
                        ],
                        'icon' => 'Flame',
                    ],
                    [
                        'tipe' => 'capaian',
                        'value' => '10',
                        'label' => [
                            'id' => 'Pemulihan & Huntara',
                            'en' => 'Shelters & Recovery',
                            'ar' => 'مآوي مؤقتة وتعافٍ',
                        ],
                        'icon' => 'Building',
                    ],
                ],
                'icon' => 'AlertTriangle',
                'platform_fee_percent' => 0.00,
                'is_disaster_category' => true,
                'is_focus_program' => true,
                'is_active' => true,
                'sort_order' => 6,
            ],

            // ==========================================
            // Kategori Reguler Non-Pilar
            // ==========================================
            [
                'slug' => 'yatim',
                'name' => [
                    'id' => 'Yatim',
                    'en' => 'Orphans',
                    'ar' => 'الأيتام',
                ],
                'public_name' => null,
                'description' => [
                    'id' => 'Bantuan biaya hidup, santunan, dan pendidikan untuk anak-anak yatim dan dhuafa.',
                    'en' => 'Living and educational expenses assistance for orphans.',
                    'ar' => 'مساعدة في نفقات المعيشة والتعليم للأيتام.',
                ],
                'reality_title' => null,
                'reality_description' => null,
                'reality_source' => null,
                'impact_title' => null,
                'impact_description' => null,
                'stats_metrics' => null,
                'icon' => 'Heart',
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_focus_program' => false,
                'is_active' => true,
                'sort_order' => 7,
            ],
            [
                'slug' => 'kemanusiaan',
                'name' => [
                    'id' => 'Kemanusiaan',
                    'en' => 'Humanitarian',
                    'ar' => 'الإنسانية',
                ],
                'public_name' => null,
                'description' => [
                    'id' => 'Bantuan sosial kemanusiaan dan kepedulian universal.',
                    'en' => 'General humanitarian social assistance.',
                    'ar' => 'مساعدة اجتماعية إنسانية عامة.',
                ],
                'reality_title' => null,
                'reality_description' => null,
                'reality_source' => null,
                'impact_title' => null,
                'impact_description' => null,
                'stats_metrics' => null,
                'icon' => 'HandHeart',
                'platform_fee_percent' => 5.00,
                'is_disaster_category' => false,
                'is_focus_program' => false,
                'is_active' => true,
                'sort_order' => 8,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                [
                    'name' => $cat['name'],
                    'public_name' => $cat['public_name'],
                    'description' => $cat['description'],
                    'icon' => $cat['icon'],
                    'platform_fee_percent' => $cat['platform_fee_percent'],
                    'is_disaster_category' => $cat['is_disaster_category'],
                    'is_focus_program' => $cat['is_focus_program'],
                    'reality_title' => $cat['reality_title'],
                    'reality_description' => $cat['reality_description'],
                    'reality_source' => $cat['reality_source'],
                    'impact_title' => $cat['impact_title'] ?? null,
                    'impact_description' => $cat['impact_description'] ?? null,
                    'stats_metrics' => $cat['stats_metrics'],
                    'is_active' => $cat['is_active'],
                    'sort_order' => $cat['sort_order'],
                ]
            );
        }
    }
}
