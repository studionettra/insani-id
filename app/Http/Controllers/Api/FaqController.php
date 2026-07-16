<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        $faqs = \App\Models\Faq::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $faqs
        ]);
    }
}
