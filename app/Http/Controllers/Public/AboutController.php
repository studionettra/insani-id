<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\ManagementMember;
use App\Models\Page;

class AboutController extends Controller
{
    public function index()
    {
        $management = ManagementMember::orderBy('sort_order')->get();
        $faqs = Faq::where('is_active', true)->orderBy('sort_order')->get();
        $aboutPage = Page::where('slug', 'tentang-kami')->where('is_active', true)->first();

        return inertia('Public/About/Index', [
            'management' => $management,
            'faqs' => $faqs,
            'aboutPage' => $aboutPage,
        ]);
    }
}
