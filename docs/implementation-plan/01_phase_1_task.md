# Task Checklist: Phase 1 (Foundation)

- `[x]` 1. **Database & Models**
  - `[x]` Update `create_users_table` migration with `phone`, `is_active`, `last_login_at`, `deleted_at`.
  - `[x]` Update `User.php` model with `SoftDeletes`, `HasRoles`, and new fillables.
- `[x]` 2. **Authentication (Fortify)**
  - `[x]` Install & configure Laravel Fortify.
  - `[x]` Modify `CreateNewUser` action to handle `phone`.
  - `[x]` Configure `FortifyServiceProvider` for Inertia views.
- `[x]` 3. **RBAC (Spatie Permission)**
  - `[x]` Install `spatie/laravel-permission` and publish migration.
  - `[x]` Create `PermissionSeeder` and `RoleSeeder`.
  - `[x]` Update `DatabaseSeeder` to call seeders and create Admin user.
- `[x]` 4. **Frontend Auth Pages (React)**
  - `[x]` Create `resources/js/Pages/Public/Auth/Login.jsx`.
- `[x]` 5. **Verification**
  - `[x]` Run migrations and seeders (`php artisan migrate:fresh --seed`).
  - `[x]` Test login manually or via automated test.
