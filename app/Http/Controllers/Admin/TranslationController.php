<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TranslationController extends Controller
{
    public function __construct(
        protected TranslationService $translationService
    ) {}

    /**
     * Handle auto-translate request for admin forms.
     */
    public function translate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fields' => 'required_without:text|array',
            'text' => 'required_without:fields|string',
            'is_html' => 'nullable|boolean',
            'source' => 'nullable|string|in:id,en,ar',
            'targets' => 'nullable|array',
            'targets.*' => 'string|in:id,en,ar',
        ]);

        $source = $validated['source'] ?? 'id';
        $targets = $validated['targets'] ?? TranslationService::SUPPORTED_LOCALES;

        // If batch fields are provided
        if (! empty($validated['fields']) && is_array($validated['fields'])) {
            $translated = $this->translationService->translateFields(
                $validated['fields'],
                $targets,
                $source
            );

            return response()->json([
                'success' => true,
                'translations' => $translated,
            ]);
        }

        // If single text is provided
        if (isset($validated['text'])) {
            $text = $validated['text'];
            $isHtml = (bool) ($validated['is_html'] ?? false);
            $result = [
                $source => $text,
            ];

            foreach ($targets as $target) {
                if ($target === $source) {
                    continue;
                }

                $result[$target] = $isHtml
                    ? $this->translationService->translateHtml($text, $target, $source)
                    : $this->translationService->translateText($text, $target, $source);
            }

            return response()->json([
                'success' => true,
                'translations' => $result,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No content provided to translate.',
        ], 422);
    }
}
