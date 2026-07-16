<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ImpactStatController extends Controller
{
    public function index()
    {
        $stats = \App\Models\ImpactStat::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }
}
