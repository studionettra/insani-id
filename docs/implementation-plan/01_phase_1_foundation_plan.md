# Phase 1: Foundation (Auth & RBAC)

This plan outlines the first steps to rebuild the Galang Dana Insani Indonesia (GDII) web platform, based on `MODULE_BREAKDOWN_v1_0.md` and `DATABASE_DICTIONARY_v1_0.md`. 

## Goal Description
We will establish the foundational layer of the application:
1. **Module 1.1 Authentication:** Modify the `users` table, set up Laravel Fortify for backend authentication (login, register, logout, password reset), and prepare Inertia React pages for Auth.
2. **Module 1.2 RBAC:** Install and configure `spatie/laravel-permission`, create Seeders for roles and permissions as defined in the PRD, and set up middlewares.

## Proposed Changes

### Database & Models

#### [MODIFY] `database/migrations/0001_01_01_000000_create_users_table.php`
- Add `phone` (varchar 30, nullable, unique)
- Add `is_active` (boolean, default true)
- Add `last_login_at` (datetime, nullable)
- Add `deleted_at` (timestamp, nullable) for soft deletes.

#### [MODIFY] `app/Models/User.php`
- Add `SoftDeletes` and `HasRoles` (Spatie) traits.
- Update `$fillable` to include `phone`, `is_active`, `last_login_at`.
- Setup hidden fields and casts.

### Authentication (Fortify)

#### [NEW] `config/fortify.php` & Actions
- Run `php artisan fortify:install` to publish Fortify assets and actions.
- Modify `CreateNewUser` action to handle `phone`.
- Modify `FortifyServiceProvider` to register Inertia views for Login, Register, Forgot Password, and Reset Password.

### RBAC (Spatie Permission)

#### [NEW] `database/seeders/PermissionSeeder.php` & `RoleSeeder.php`
- Install `spatie/laravel-permission` and publish its migration.
- Create seeders for the permissions defined in PRD v1.0 Section 6.2.
- Map permissions to roles: Administrator, Program Officer, Verifikator, Keuangan, CS.

#### [MODIFY] `database/seeders/DatabaseSeeder.php`
- Call `PermissionSeeder` and `RoleSeeder`.
- Create a default Super Admin user account.

### Frontend Auth Pages (React / Inertia)

#### [NEW] `resources/js/Pages/Public/Auth/Login.jsx`
- Create the Login UI using React and Tailwind CSS.
- Connect to Fortify's `POST /login` route.

#### [NEW] `resources/js/Pages/Public/Auth/Register.jsx` (if needed)
- Setup Registration UI.

## Verification Plan

### Automated Tests
- Run `php artisan test --filter=AuthenticationTest` (we will create basic feature tests for login/logout).
- Run `php artisan test --filter=RolePermissionTest`.

### Manual Verification
- Run `php artisan migrate --seed` to ensure the database schema and default roles/users are created without error.
- Serve the application and attempt to visit `/login`.
- Login with the seeded Admin credentials and verify redirect logic.
