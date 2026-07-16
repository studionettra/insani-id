<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ManagementMemberController extends Controller
{
    public function index()
    {
        $members = \App\Models\ManagementMember::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
            
        return response()->json([
            'status' => 'success',
            'data' => $members
        ]);
    }
}
