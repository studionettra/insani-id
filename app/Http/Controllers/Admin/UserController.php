<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CampaignerProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Internal operational roles of the foundation.
     */
    protected array $internalRoles = [
        'Administrator',
        'Program Officer',
        'Verifikator',
        'Keuangan',
        'Customer Service',
        'Eksekutif',
        'Content Editor',
    ];

    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $type = $request->input('type', 'semua');
        $status = $request->input('status', 'semua');
        $search = $request->input('search');
        $roleFilter = $request->input('role');

        $query = User::with(['roles', 'campaignerProfile'])
            ->withCount(['createdPrograms', 'donations'])
            ->latest();

        // 1. Filter by Segment Type
        if ($type === 'internal') {
            $query->whereHas('roles', fn ($q) => $q->whereIn('name', $this->internalRoles));
        } elseif ($type === 'lembaga') {
            $query->where(function ($q) {
                $q->whereHas('roles', fn ($r) => $r->where('name', 'Campaigner Lembaga'))
                    ->orWhereHas('campaignerProfile', fn ($cp) => $cp->where('type', 'lembaga'));
            });
        } elseif ($type === 'individu') {
            $query->where(function ($q) {
                $q->whereHas('roles', fn ($r) => $r->where('name', 'Campaigner Individu'))
                    ->orWhereHas('campaignerProfile', fn ($cp) => $cp->where('type', 'individu'));
            });
        } elseif ($type === 'donatur') {
            $query->whereHas('roles', fn ($q) => $q->where('name', 'Donatur'));
        }

        // 2. Filter by Specific Role
        if ($roleFilter && $roleFilter !== 'semua') {
            $query->whereHas('roles', fn ($q) => $q->where('name', $roleFilter));
        }

        // 3. Filter by Status
        if ($status && $status !== 'semua') {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            } elseif (in_array($status, ['pending', 'verified', 'rejected', 'suspended'])) {
                $query->whereHas('campaignerProfile', fn ($cp) => $cp->where('verification_status', $status));
            }
        }

        // 4. Search Filter
        if ($search && trim($search) !== '') {
            $searchTerm = trim($search);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%")
                    ->orWhere('phone', 'like', "%{$searchTerm}%")
                    ->orWhereHas('campaignerProfile', function ($cp) use ($searchTerm) {
                        $cp->where('nama_lembaga', 'like', "%{$searchTerm}%");
                    });
            });
        }

        $users = $query->paginate(10)->withQueryString();

        $allRoles = Role::pluck('name');
        $availableInternalRoles = $allRoles->filter(fn ($r) => in_array($r, $this->internalRoles))->values();

        $counts = [
            'all' => User::count(),
            'internal' => User::whereHas('roles', fn ($q) => $q->whereIn('name', $this->internalRoles))->count(),
            'lembaga' => User::where(function ($q) {
                $q->whereHas('roles', fn ($r) => $r->where('name', 'Campaigner Lembaga'))
                    ->orWhereHas('campaignerProfile', fn ($cp) => $cp->where('type', 'lembaga'));
            })->count(),
            'individu' => User::where(function ($q) {
                $q->whereHas('roles', fn ($r) => $r->where('name', 'Campaigner Individu'))
                    ->orWhereHas('campaignerProfile', fn ($cp) => $cp->where('type', 'individu'));
            })->count(),
            'donatur' => User::whereHas('roles', fn ($q) => $q->where('name', 'Donatur'))->count(),
            'pending_verification' => CampaignerProfile::where('verification_status', 'pending')->count(),
            'active_internal' => User::where('is_active', true)->whereHas('roles', fn ($q) => $q->whereIn('name', $this->internalRoles))->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $allRoles,
            'internalRoles' => $availableInternalRoles,
            'counts' => $counts,
            'filters' => [
                'type' => $type,
                'status' => $status,
                'role' => $roleFilter,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
        ], [
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok dengan password yang dimasukkan.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'password.mixed' => 'Password harus mengandung kombinasi huruf besar dan huruf kecil.',
            'password.letters' => 'Password harus mengandung setidaknya satu huruf.',
            'password.symbols' => 'Password harus mengandung setidaknya satu simbol atau karakter khusus (contoh: !@#$%^&*).',
            'password.numbers' => 'Password harus mengandung setidaknya satu angka.',
            'password.uncompromised' => 'Password yang dimasukkan terindikasi pernah bocor dalam data publik. Gunakan password yang lebih aman.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $request->input('phone'),
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if ($request->has('phone')) {
            $updateData['phone'] = $request->input('phone');
        }

        if ($request->has('is_active')) {
            $updateData['is_active'] = $request->boolean('is_active');
        }

        $user->update($updateData);

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['required', 'confirmed', Password::defaults()],
            ], [
                'password.required' => 'Password wajib diisi.',
                'password.confirmed' => 'Konfirmasi password tidak cocok dengan password yang dimasukkan.',
                'password.min' => 'Password minimal harus 8 karakter.',
                'password.mixed' => 'Password harus mengandung kombinasi huruf besar dan huruf kecil.',
                'password.letters' => 'Password harus mengandung setidaknya satu huruf.',
                'password.symbols' => 'Password harus mengandung setidaknya satu simbol atau karakter khusus (contoh: !@#$%^&*).',
                'password.numbers' => 'Password harus mengandung setidaknya satu angka.',
                'password.uncompromised' => 'Password yang dimasukkan terindikasi pernah bocor dalam data publik. Gunakan password yang lebih aman.',
            ]);
            $user->update([
                'password' => Hash::make($request->password),
            ]);
        }

        $user->syncRoles([$validated['role']]);

        return redirect()->back()->with('success', 'User berhasil diperbarui.');
    }

    /**
     * Toggle active/inactive status of the user.
     */
    public function toggleStatus(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()->with('success', "Akun pengguna {$user->name} berhasil {$statusText}.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
