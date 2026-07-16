<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    public function index()
    {
        $management = \App\Models\ManagementMember::orderBy('sort_order')->get();
        $faqs = \App\Models\Faq::where('is_active', true)->orderBy('sort_order')->get();
        $aboutPage = \App\Models\Page::where('slug', 'tentang-kami')->where('is_active', true)->first();

        return inertia('Public/About/Index', [
            'management' => $management,
            'faqs' => $faqs,
            'aboutPage' => $aboutPage,
        ]);
    }
}
