<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fundraiser;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FundraiserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Fundraiser::with(['user', 'program.category'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('referral_code', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('program', function ($pq) use ($search) {
                        $pq->where('title', 'like', "%{$search}%");
                    });
            });
        }

        $fundraisers = $query->paginate(15)->withQueryString();

        $stats = [
            'totalFundraisers' => Fundraiser::count(),
            'totalCollected' => (float) Fundraiser::sum('collected_amount'),
            'totalDonors' => (int) Fundraiser::sum('donors_count'),
        ];

        return Inertia::render('Admin/Fundraisers/Index', [
            'fundraisers' => $fundraisers,
            'stats' => $stats,
            'filters' => $request->only(['search']),
        ]);
    }
}
