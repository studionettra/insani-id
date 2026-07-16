# DATABASE DICTIONARY — Company Profile Insani Indonesia

**Version:** 1.1 (Rekonsiliasi pasca-review Antigravity — tambah Homepage Banner & Contact Message)
**Mengacu pada:** PRD_COMPANY_PROFILE_v1_0.md (v1.1), ERD_COMPANY_PROFILE_v1_0.md (v1.1)
**Stack:** Laravel 13, MySQL 8, Inertia.js, React, Tailwind CSS (TailAdmin v2.3), Spatie Permission, Spatie Activitylog, Spatie Translatable, WordPress (headless)

---

# Perluasan Tabel `categories` (Migration Terpisah)

Tabel `categories` **sudah dibuat** di migration Galang Dana. Proyek ini menambahkan migration baru (bukan mengubah migration lama):

```sql
ALTER TABLE categories
    ADD COLUMN is_focus_program BOOLEAN NOT NULL DEFAULT FALSE AFTER is_disaster_category,
    ADD COLUMN pillar_image VARCHAR(255) NULL AFTER is_focus_program;
```

```php
// database/migrations/xxxx_add_focus_program_fields_to_categories_table.php
Schema::table('categories', function (Blueprint $table) {
    $table->boolean('is_focus_program')->default(false)->after('is_disaster_category');
    $table->string('pillar_image')->nullable()->after('is_focus_program');
});
```

```php
// Model Category — tambahan scope (bukan model baru)
public function scopeFocusProgram($query)
{
    return $query->where('is_focus_program', true)
                 ->where('is_active', true)
                 ->orderBy('sort_order');
}
```

---

# 1. STATIC PAGES

## 1.1 `pages`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| slug | varchar(120) | No | UNIQUE | |
| title | json | No | | Translatable |
| content | json | No | | Translatable |
| meta_description | json | Yes | | Translatable, untuk SEO |
| attachment_path | varchar(255) | Yes | | Khusus halaman Logo Kit |
| updated_by | bigint | No | FK → users.id | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL,
    title JSON NOT NULL,
    content JSON NOT NULL,
    meta_description JSON NULL,
    attachment_path VARCHAR(255) NULL,
    updated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_pages_slug (slug),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

```php
Page::belongsTo(User::class, 'updated_by');

use Spatie\Translatable\HasTranslations;
public $translatable = ['title', 'content', 'meta_description'];
```

Seed data wajib (slug):
```text
tentang-insani, logo-kit
```
(Legal & Visi-Misi tetap di `app_settings` grup `about`, tidak di tabel ini — lihat PRD Section 6.2)

---

# 2. FAQ

## 2.1 `faqs`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| question | json | No | | Translatable |
| answer | json | No | | Translatable |
| sort_order | integer | No | | |
| is_active | boolean | No | | |
| updated_by | bigint | No | FK → users.id | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE faqs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question JSON NOT NULL,
    answer JSON NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

```php
Faq::belongsTo(User::class, 'updated_by');
// public $translatable = ['question', 'answer'];
```

---

# 3. MANAGEMENT PROFILE

## 3.1 `management_members`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| name | varchar(255) | No | | Tidak translatable |
| position | json | No | | Translatable |
| photo | varchar(255) | No | | |
| bio | json | Yes | | Translatable |
| linkedin_url | varchar(255) | Yes | | |
| instagram_url | varchar(255) | Yes | | |
| sort_order | integer | No | | |
| is_active | boolean | No | | |
| updated_by | bigint | No | FK → users.id | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE management_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position JSON NOT NULL,
    photo VARCHAR(255) NOT NULL,
    bio JSON NULL,
    linkedin_url VARCHAR(255) NULL,
    instagram_url VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

```php
ManagementMember::belongsTo(User::class, 'updated_by');
// public $translatable = ['position', 'bio'];
```

---

# 4. PARTNERS

## 4.1 `partners`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| name | varchar(255) | No | | |
| logo | varchar(255) | No | | |
| website_url | varchar(255) | Yes | | |
| sort_order | integer | No | | |
| is_active | boolean | No | | |
| updated_by | bigint | No | FK → users.id | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE partners (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(255) NOT NULL,
    website_url VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

```php
Partner::belongsTo(User::class, 'updated_by');
```

---

# 5. IMPACT STATISTICS

## 5.1 `impact_stats`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| group | enum | No | | `dalam_negeri`, `luar_negeri`, `umum` |
| label | json | No | | Translatable |
| value | varchar(50) | No | | String, bukan angka murni (mendukung format "1.2K+") |
| icon | varchar(100) | Yes | | |
| sort_order | integer | No | | |
| is_active | boolean | No | | |
| updated_by | bigint | No | FK → users.id | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE impact_stats (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `group` ENUM('dalam_negeri','luar_negeri','umum') NOT NULL DEFAULT 'umum',
    label JSON NOT NULL,
    value VARCHAR(50) NOT NULL,
    icon VARCHAR(100) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

```php
ImpactStat::belongsTo(User::class, 'updated_by');
// public $translatable = ['label'];
```

Contoh seed data:
```text
group=dalam_negeri, label=Provinsi,                    value=34
group=dalam_negeri, label=Program Dalam Negeri,          value=120
group=dalam_negeri, label=Penerima Manfaat Dalam Negeri, value=500K+
group=luar_negeri,  label=Negara,                        value=15
group=luar_negeri,  label=Program Luar Negeri,            value=45
group=luar_negeri,  label=Penerima Manfaat Luar Negeri,   value=80K+
```

---

# 6. HOMEPAGE BANNER & CONTACT MESSAGE

## 6.1 `homepage_banners`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| title | varchar(255) | Yes | | Label internal, tidak translatable |
| image_desktop | varchar(255) | No | | |
| image_mobile | varchar(255) | Yes | | Fallback ke `image_desktop` jika NULL |
| link_url | varchar(255) | Yes | | |
| sort_order | integer | No | | |
| is_active | boolean | No | | Default `true` |
| updated_by | bigint | No | FK → users.id | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE homepage_banners (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NULL,
    image_desktop VARCHAR(255) NOT NULL,
    image_mobile VARCHAR(255) NULL,
    link_url VARCHAR(255) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

```php
HomepageBanner::belongsTo(User::class, 'updated_by');

// Accessor — fallback image_mobile ke image_desktop
public function getImageMobileUrlAttribute(): string
{
    return $this->image_mobile ?: $this->image_desktop;
}
```

## 6.2 `contact_messages`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| name | varchar(255) | No | | |
| email | varchar(255) | No | | |
| subject | varchar(255) | No | | |
| message | text | No | | |
| is_read | boolean | No | | Default `false` |
| read_by | bigint | Yes | FK → users.id | |
| read_at | datetime | Yes | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE contact_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_by BIGINT UNSIGNED NULL,
    read_at DATETIME NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    KEY idx_contact_messages_is_read (is_read),
    FOREIGN KEY (read_by) REFERENCES users(id)
);
```

```php
ContactMessage::belongsTo(User::class, 'read_by');
```

> **Catatan keamanan:** Validasi anti-spam (Honeypot field tersembunyi, atau Cloudflare Turnstile token) dilakukan di **Form Request**, sebelum data sampai ke `insert()` — submission yang gagal validasi anti-spam tidak pernah tercatat di tabel ini sama sekali.

---

# 7. BLOG CACHE (HEADLESS WORDPRESS)

## 6.1 `blog_post_cache`

| Field | Type | Nullable | Index | Keterangan |
|---|---|---|---|---|
| id | bigint | No | PK | |
| wp_post_id | bigint | No | UNIQUE | ID post di WordPress |
| title | varchar(255) | No | | Bahasa Indonesia saja, tidak translatable |
| slug | varchar(255) | No | UNIQUE | |
| excerpt | text | Yes | | |
| content_html | longtext | No | | **Wajib disanitasi** via `mews/purifier` sebelum insert/update |
| featured_image_url | varchar(255) | Yes | | |
| wp_category | varchar(100) | Yes | | String sederhana, bukan FK |
| published_at | datetime | No | | |
| synced_at | datetime | No | | |
| created_at | timestamp | | | |
| updated_at | timestamp | | | |

```sql
CREATE TABLE blog_post_cache (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    wp_post_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    excerpt TEXT NULL,
    content_html LONGTEXT NOT NULL,
    featured_image_url VARCHAR(255) NULL,
    wp_category VARCHAR(100) NULL,
    published_at DATETIME NOT NULL,
    synced_at DATETIME NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_blog_post_cache_wp_id (wp_post_id),
    UNIQUE KEY uq_blog_post_cache_slug (slug),
    KEY idx_blog_post_cache_published (published_at)
);
```

```php
// Service — bukan Eloquent relasi FK biasa, upsert berbasis wp_post_id
class BlogSyncService
{
    public function syncFromWordPress(int $wpPostId): void
    {
        $data = $this->fetchFromWpRestApi($wpPostId); // GET /wp-json/wp/v2/posts/{id}?_embed
        $sanitizedHtml = HtmlPurifier::clean($data['content_html']);

        BlogPostCache::updateOrCreate(
            ['wp_post_id' => $wpPostId],
            [
                'title' => $data['title'],
                'slug' => $data['slug'],
                'excerpt' => $data['excerpt'],
                'content_html' => $sanitizedHtml,
                'featured_image_url' => $data['featured_image_url'],
                'wp_category' => $data['category'],
                'published_at' => $data['published_at'],
                'synced_at' => now(),
            ]
        );
    }
}
```

---

# 8. Estimated Database Size (Tambahan)

## Business Tables Baru (8)

```text
pages
faqs
management_members
partners
impact_stats
blog_post_cache
homepage_banners
contact_messages
```

## Perluasan Tabel Existing

```text
categories (+2 kolom: is_focus_program, pillar_image)
```

## Grand Total Database (Galang Dana v1.1 + Company Profile)

```text
31 Tables (23 dari Galang Dana v1.1 + 8 baru dari Company Profile)
```
