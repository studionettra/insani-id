<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomepageBannerController extends Controller
{
    public function index()
    {
        $banners = \App\Models\HomepageBanner::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $banners
        ]);
    }
}
