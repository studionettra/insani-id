<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class BankAccountController extends Controller
{
    public function index(Request $request): Response
    {
        $accounts = BankAccount::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('bank_name', 'like', "%{$search}%")
                        ->orWhere('account_number', 'like', "%{$search}%")
                        ->orWhere('account_name', 'like', "%{$search}%")
                        ->orWhere('bank_code', 'like', "%{$search}%");
                });
            })
            ->when($request->bank_type, function ($query, $bankType) {
                $query->where('bank_type', $bankType);
            })
            ->orderBy('sort_order')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return inertia('Admin/BankAccounts/Index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'bank_type']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'bank_code' => 'nullable|string|max:50',
            'account_number' => 'required|string|max:100',
            'account_name' => 'required|string|max:255',
            'bank_type' => 'required|in:syariah,konvensional',
            'logo' => 'nullable|image|max:2048',
            'instructions' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('banks', 'public');
        }

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        BankAccount::create($validated);
        Cache::forget('bank_accounts_public');

        return redirect()->back()->with('success', 'Rekening bank yayasan berhasil ditambahkan.');
    }

    public function update(Request $request, BankAccount $bank_account): RedirectResponse
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:255',
            'bank_code' => 'nullable|string|max:50',
            'account_number' => 'required|string|max:100',
            'account_name' => 'required|string|max:255',
            'bank_type' => 'required|in:syariah,konvensional',
            'logo' => 'nullable|image|max:2048',
            'instructions' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($request->hasFile('logo')) {
            if ($bank_account->logo_path) {
                Storage::disk('public')->delete($bank_account->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('banks', 'public');
        }

        $bank_account->update($validated);
        Cache::forget('bank_accounts_public');

        return redirect()->back()->with('success', 'Rekening bank yayasan berhasil diperbarui.');
    }

    public function destroy(BankAccount $bank_account): RedirectResponse
    {
        if ($bank_account->logo_path) {
            Storage::disk('public')->delete($bank_account->logo_path);
        }
        $bank_account->delete();
        Cache::forget('bank_accounts_public');

        return redirect()->back()->with('success', 'Rekening bank yayasan berhasil dihapus.');
    }
}
