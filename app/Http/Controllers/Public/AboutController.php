<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\FinancialReport;
use App\Models\LegalDocument;
use App\Models\ManagementMember;
use App\Models\Page;

class AboutController extends Controller
{
    public function index()
    {
        $management = ManagementMember::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($member) {
                $member->position_translations = $member->getTranslations('position');
                $member->bio_translations = $member->getTranslations('bio');

                return $member;
            });
        $faqs = Faq::where('is_active', true)
            ->where('category', 'lembaga')
            ->orderBy('sort_order')
            ->take(5)
            ->get();

        if ($faqs->isEmpty()) {
            $faqs = Faq::where('is_active', true)
                ->whereIn('category', ['umum', 'keamanan'])
                ->orderBy('sort_order')
                ->take(4)
                ->get();
        }

        $faqs->transform(function ($faq) {
            $faq->question_translations = $faq->getTranslations('question');
            $faq->answer_translations = $faq->getTranslations('answer_html');

            return $faq;
        });
        $aboutPage = Page::where('slug', 'tentang-kami')->where('is_active', true)->first();
        $legalDocuments = LegalDocument::where('is_active', true)->orderBy('sort_order')->get();
        $financialReports = FinancialReport::where('is_active', true)
            ->orderByDesc('report_year')
            ->orderBy('sort_order')
            ->get();

        return inertia('Public/About/Index', [
            'management' => $management,
            'faqs' => $faqs,
            'aboutPage' => $aboutPage,
            'legalDocuments' => $legalDocuments,
            'financialReports' => $financialReports,
        ]);
    }
}
