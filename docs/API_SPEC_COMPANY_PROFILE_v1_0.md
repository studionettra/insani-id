# API & ROUTE SPECIFICATION — Company Profile Insani Indonesia

**Version:** 1.1 (Sinkron dengan PRD v1.1)
**Stack:** Laravel 13, Inertia.js, React 18, Tailwind CSS (TailAdmin v2.3), Spatie Permission, Spatie Activitylog, Spatie Translatable, MySQL 8, WordPress (headless)

---

# 1. Overview

Dokumen ini melanjutkan API_SPEC_v1_0.md (Galang Dana) — route baru di sini **ditambahkan** ke aplikasi Laravel yang sama, bukan aplikasi terpisah. Konvensi yang sama berlaku: Inertia Page Response untuk mayoritas route, JSON hanya untuk AJAX/webhook.

**Locale Routing:** Seluruh route publik di dokumen ini (kecuali `/kabar/*`, lihat catatan) mengikuti pola locale-prefix yang sama dari Galang Dana (`/id/...`, `/ar/...`, `/en/...`).

**Pengecualian Locale — Halaman Kabar:** `/kabar` dan `/kabar/{slug}` **tidak** memakai prefix locale penuh untuk konten (karena blog cuma Bahasa Indonesia di MVP), tapi tetap mewarisi `PublicLayout` yang locale-aware untuk elemen UI di sekitarnya (navbar, footer). Jika diakses dengan prefix `/ar/kabar` atau `/en/kabar`, halaman tetap render dengan pesan "Konten belum tersedia dalam bahasa ini" pada body artikel.

---

# 2. Halaman Beranda & Fokus Program

| Route | Method | Controller |
|---|---|---|
| `/` | GET | `Public\HomeController@index` |
| `/fokus-program` | GET | `Public\FocusProgramController@index` |

```php
Inertia::render('Public/Home/Index', [
    'heroBanners', 'focusPrograms', // categories::focusProgram()
    'impactStats', 'featuredPrograms', // reuse dari Program model, Galang Dana
    'latestArticles', // dari blog_post_cache, limit 3-4
    'partners'
]);

Inertia::render('Public/FocusProgram/Index', [
    'focusPrograms' // categories::focusProgram()->get()
]);
```

---

# 3. Halaman Tentang (Sub-halaman)

| Route | Method | Controller |
|---|---|---|
| `/tentang` | GET | `Public\AboutController@index` (landing, link ke sub-halaman) |
| `/tentang/insani` | GET | `Public\PageController@show` (`slug=tentang-insani`) |
| `/tentang/legal` | GET | `Public\AboutController@legal` (baca dari `app_settings` grup `about`) |
| `/tentang/visi-misi` | GET | `Public\AboutController@visiMisi` (baca dari `app_settings` grup `about`) |
| `/tentang/faq` | GET | `Public\FaqController@index` |
| `/tentang/logo` | GET | `Public\PageController@show` (`slug=logo-kit`) |
| `/tentang/manajemen` | GET | `Public\ManagementController@index` |

```php
Inertia::render('Public/Page/Show', [
    'page' => $page // title, content, attachment_path (untuk logo-kit)
]);

Inertia::render('Public/Faq/Index', [
    'faqs' // faqs::where('is_active', true)->orderBy('sort_order')->get()
]);

Inertia::render('Public/Management/Index', [
    'members' // management_members::where('is_active', true)->orderBy('sort_order')->get()
]);
```

---

# 4. Halaman Kabar (Blog — Headless WordPress)

| Route | Method | Controller |
|---|---|---|
| `/kabar` | GET | `Public\BlogController@index` |
| `/kabar/{slug}` | GET | `Public\BlogController@show` |

```php
// GET /kabar — query params
{ "category": "inspirasi|kabar-insani", "search": "..." }

Inertia::render('Public/Blog/Index', [
    'articles', // dari blog_post_cache, paginated
    'categories' // distinct wp_category dari blog_post_cache
]);

Inertia::render('Public/Blog/Show', [
    'article' // content_html sudah tersanitasi, langsung di-render (dangerouslySetInnerHTML dengan whitelist yang sudah dijamin dari sisi backend)
]);
```

**Business Rule:** Halaman `/kabar/{slug}` **selalu** membaca dari `blog_post_cache` lokal — **tidak pernah** melakukan live call ke WordPress REST API saat request publik masuk. Ini memastikan blog tetap tayang meski WordPress backend down/maintenance. Halaman ini juga tidak menyediakan endpoint komentar (fitur komentar sengaja ditiadakan, lihat PRD Section 6.4) — hanya tombol share statis (WA/FB/Twitter) dan area sidebar kosong yang disiapkan untuk embed campaign Galang Dana di masa depan.

---

# 4.1 Halaman Kontak (Publik)

| Route | Method | Controller |
|---|---|---|
| `/kontak` | GET | `Public\ContactController@create` |
| `/kontak` | POST | `Public\ContactController@store` |

```php
// POST /kontak
{
  "name": "...", "email": "...", "subject": "...", "message": "...",
  "honeypot_field": ""  // wajib kosong, kalau terisi = bot, request ditolak diam-diam (tidak error eksplisit ke bot)
}
```

**Business Rule:** Validasi anti-spam (Honeypot atau Turnstile token) dilakukan di Form Request **sebelum** insert ke `contact_messages`. Setelah insert sukses, trigger email notifikasi otomatis ke Administrator/CS.

---

# 5. Webhook & Sinkronisasi WordPress

## 5.1 Webhook Masuk (dari WordPress)

| Route | Method | Controller |
|---|---|---|
| `/webhooks/wordpress` | POST | `WebhookController@wordpress` |

```php
// Payload dari WordPress (dikirim oleh plugin/functionality kecil saat publish/update/trash)
{
  "post_id": 123,
  "action": "publish|update|trash"
}
```

**Keamanan wajib:** Validasi header custom (mis. `X-WP-WEBHOOK-TOKEN`) terhadap token yang dikonfigurasi di `.env` — pola yang sama dengan validasi webhook Xendit di proyek Galang Dana. Request tanpa token valid ditolak (`403`).

**Alur backend:**
1. Validasi token
2. Jika `action = publish` atau `update` → panggil `BlogSyncService::syncFromWordPress($post_id)` (fetch dari WP REST API, sanitasi, upsert ke `blog_post_cache`)
3. Jika `action = trash` → hapus entri terkait dari `blog_post_cache`

**Route ini dikecualikan dari CSRF protection**, sama seperti `/webhooks/xendit` di proyek Galang Dana.

## 5.2 Scheduled Fallback Sync (Internal, Bukan Route Publik)

```php
// app/Console/Kernel.php
$schedule->job(new FullSyncBlogPostsJob)->hourly();
```

Job ini memanggil `GET /wp-json/wp/v2/posts?per_page=100&page={n}` (paginated, ambil semua post), lalu upsert seluruhnya ke `blog_post_cache`, dan menghapus entri yang `wp_post_id`-nya sudah tidak ditemukan di response WordPress (artinya sudah dihapus/di-unpublish).

---

# 6. Manajemen Konten (Internal — Content Editor)

## 6.1 Halaman Statis

| Permission | Route | Method | Controller |
|---|---|---|---|
| `page.view` | `/admin/pages` | GET | `Admin\PageController@index` |
| `page.update` | `/admin/pages/{page}` | PUT | `Admin\PageController@update` |

## 6.2 FAQ

| Permission | Route | Method | Controller |
|---|---|---|---|
| `faq.view` | `/admin/faqs` | GET | `Admin\FaqController@index` |
| `faq.create` | `/admin/faqs` | POST | `Admin\FaqController@store` |
| `faq.update` | `/admin/faqs/{faq}` | PUT | `Admin\FaqController@update` |
| `faq.delete` | `/admin/faqs/{faq}` | DELETE | `Admin\FaqController@destroy` |

## 6.3 Manajemen/Pengurus

| Permission | Route | Method | Controller |
|---|---|---|---|
| `management.view` | `/admin/management` | GET | `Admin\ManagementController@index` |
| `management.create` | `/admin/management` | POST | `Admin\ManagementController@store` |
| `management.update` | `/admin/management/{member}` | PUT | `Admin\ManagementController@update` |
| `management.delete` | `/admin/management/{member}` | DELETE | `Admin\ManagementController@destroy` |

## 6.4 Mitra

| Permission | Route | Method | Controller |
|---|---|---|---|
| `partner.view` | `/admin/partners` | GET | `Admin\PartnerController@index` |
| `partner.create` | `/admin/partners` | POST | `Admin\PartnerController@store` |
| `partner.update` | `/admin/partners/{partner}` | PUT | `Admin\PartnerController@update` |
| `partner.delete` | `/admin/partners/{partner}` | DELETE | `Admin\PartnerController@destroy` |

## 6.5 Statistik Dampak

| Permission | Route | Method | Controller |
|---|---|---|---|
| `impact-stat.view` | `/admin/impact-stats` | GET | `Admin\ImpactStatController@index` |
| `impact-stat.create` | `/admin/impact-stats` | POST | `Admin\ImpactStatController@store` |
| `impact-stat.update` | `/admin/impact-stats/{stat}` | PUT | `Admin\ImpactStatController@update` |
| `impact-stat.delete` | `/admin/impact-stats/{stat}` | DELETE | `Admin\ImpactStatController@destroy` |

## 6.6 Fokus Program (Field Kategori)

| Permission | Route | Method | Controller |
|---|---|---|---|
| `category.update` | `/admin/categories/{category}/pillar` | PATCH | `Admin\CategoryController@updatePillar` |

```php
// PATCH request — hanya field pilar, bukan seluruh Category
{ "is_focus_program": true, "pillar_image": "..." }
```

> **Catatan:** Endpoint ini **terpisah** dari `PUT /admin/categories/{category}` (yang sudah ada di API_SPEC Galang Dana, eksklusif Administrator) — supaya Content Editor bisa diberi akses `category.update` **hanya** untuk field pilar via controller method berbeda, tanpa bisa mengubah `name`/`platform_fee_percent`/dst. Pemisahan ini dilakukan di level **Policy** (`CategoryPolicy::updatePillar()` vs `CategoryPolicy::update()`), bukan cuma di route.

## 6.7 Monitoring Sinkronisasi Blog

| Permission | Route | Method | Controller |
|---|---|---|---|
| `blog.view` | `/admin/blog-sync` | GET | `Admin\BlogSyncController@index` |
| `blog.sync-manual` | `/admin/blog-sync/resync` | POST | `Admin\BlogSyncController@resync` |

```php
Inertia::render('Admin/BlogSync/Index', [
    'lastSyncedAt', 'totalArticles', 'recentSyncLog'
]);
```

`resync` memicu `FullSyncBlogPostsJob` secara manual (dispatched ke queue, bukan sinkron langsung) — dipakai untuk troubleshooting jika webhook WordPress gagal terkirim.

## 6.8 Homepage Banner

| Permission | Route | Method | Controller |
|---|---|---|---|
| `homepage-banner.view` | `/admin/banners` | GET | `Admin\BannerController@index` |
| `homepage-banner.create` | `/admin/banners` | POST | `Admin\BannerController@store` |
| `homepage-banner.update` | `/admin/banners/{banner}` | PUT | `Admin\BannerController@update` |
| `homepage-banner.delete` | `/admin/banners/{banner}` | DELETE | `Admin\BannerController@destroy` |

```php
// POST /admin/banners
{
  "title": "Banner Ramadan 2027",
  "image_desktop": "...", "image_mobile": null,
  "link_url": "/program/santunan-ramadan",
  "sort_order": 1, "is_active": true
}
```

## 6.9 Inbox Pesan Kontak

| Permission | Route | Method | Controller |
|---|---|---|---|
| `contact-message.view` | `/admin/contact-messages` | GET | `Admin\ContactMessageController@index` |
| `contact-message.reply` | `/admin/contact-messages/{message}/read` | PATCH | `Admin\ContactMessageController@markAsRead` |

```php
Inertia::render('Admin/ContactMessages/Index', [
    'messages' // paginated, filter is_read
]);
```

`markAsRead` mengisi `is_read = true`, `read_by = auth()->id()`, `read_at = now()`.

---

# 7. AJAX Lookup Endpoints (Tambahan)

| Route | Response |
|---|---|
| `GET /ajax/focus-programs` | `[{ "id": 1, "text": "Ketahanan Pangan", "slug": "..." }]` — dari `categories::focusProgram()` |
| `GET /admin/ajax/blog-categories` | Daftar `wp_category` unik dari `blog_post_cache`, untuk filter |

---

# 8. Route Naming Convention (Tambahan)

```php
// Public
home.index
focus-program.index
about.index about.legal about.visi-misi
page.show
faq.index
management.index
blog.index blog.show
contact.create contact.store

// Webhook
webhooks.wordpress

// Admin
admin.pages.index admin.pages.update
admin.faqs.index admin.faqs.store admin.faqs.update admin.faqs.destroy
admin.management.index admin.management.store admin.management.update admin.management.destroy
admin.partners.index admin.partners.store admin.partners.update admin.partners.destroy
admin.impact-stats.index admin.impact-stats.store admin.impact-stats.update admin.impact-stats.destroy
admin.categories.update-pillar
admin.blog-sync.index admin.blog-sync.resync
admin.banners.index admin.banners.store admin.banners.update admin.banners.destroy
admin.contact-messages.index admin.contact-messages.read
```

---

# 9. Middleware Stack (Tambahan)

```php
permission:page.update
permission:faq.create
permission:management.create
permission:partner.create
permission:impact-stat.create
permission:blog.sync-manual
permission:homepage-banner.create
permission:contact-message.reply

// Khusus form kontak publik (bukan permission staff, validasi anti-spam):
verify.contact-anti-spam   // Form Request custom — cek Honeypot/Turnstile sebelum insert ke contact_messages

// Khusus webhook WordPress (dikecualikan dari CSRF, sama pola dengan Xendit):
verify.wordpress-webhook-token
```

---

# 10. Security Requirements (Tambahan)

- Webhook WordPress **wajib** validasi token custom, dikecualikan dari CSRF protection Laravel — sama prinsip dengan webhook Xendit di proyek Galang Dana
- `content_html` dari WordPress **wajib** melalui `mews/purifier` sebelum disimpan ke `blog_post_cache` — tidak pernah render HTML mentah dari sumber eksternal tanpa sanitasi, meski sumbernya staff internal terpercaya
- WP-Admin **tidak** terhubung SSO ke sistem auth Laravel — akses dibatasi tim kecil penulis konten, dikelola terpisah di sisi WordPress
- Endpoint `category.update` untuk field pilar dipisah secara **Policy-level** dari endpoint `category.update` penuh — mencegah Content Editor mengubah field sensitif (`platform_fee_percent`, dsb.) meski permission name-nya sama

---

# 11. Future Extensions

- Terjemahan konten blog (AR/EN) jika kebutuhan berkembang
- Pencarian full-text artikel Kabar (Laravel Scout, jika volume artikel besar)
- Newsletter/subscribe terintegrasi dengan `notification_logs` (reuse infrastruktur WhatsApp/email dari Galang Dana)
- Counter animation & micro-interaction untuk statistik dampak
