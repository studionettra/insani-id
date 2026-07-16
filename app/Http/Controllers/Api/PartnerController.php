<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    public function index()
    {
        $partners = \App\Models\Partner::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $partners
        ]);
    }
}
