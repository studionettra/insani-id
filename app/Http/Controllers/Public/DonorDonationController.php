<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DonorDonationController extends Controller
{
    /**
     * Display a listing of donations made by the authenticated user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $donations = Donation::with(['program.category', 'payments'])
            ->where(function ($query) use ($user) {
                $query->where('donor_user_id', $user->id)
                    ->orWhere('donor_email', $user->email);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Public/Akun/Donasi/Index', [
            'donations' => $donations,
        ]);
    }
}
