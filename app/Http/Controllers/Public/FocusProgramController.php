<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FocusProgramController extends Controller
{
    public function index()
    {
        $pillars = \App\Models\Category::where('is_focus_program', true)
            ->orderBy('name')
            ->get();

        return inertia('Public/FocusProgram/Index', [
            'pillars' => $pillars,
        ]);
    }
}
