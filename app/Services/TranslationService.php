<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TranslationService
{
    /**
     * Supported target locales.
     *
     * @var array<string>
     */
    public const SUPPORTED_LOCALES = ['en', 'ar'];

    /**
     * Translate a single text string from source to target locale.
     */
    public function translateText(string $text, string $targetLocale, string $sourceLocale = 'id'): string
    {
        $trimmed = trim($text);
        if ($trimmed === '' || $targetLocale === $sourceLocale) {
            return $text;
        }

        $cacheKey = 'tr_text_'.md5($sourceLocale.'_'.$targetLocale.'_'.$trimmed);

        return Cache::remember($cacheKey, now()->addDays(30), function () use ($trimmed, $targetLocale, $sourceLocale, $text) {
            try {
                $response = Http::timeout(10)->asForm()->post('https://translate.googleapis.com/translate_a/single', [
                    'client' => 'gtx',
                    'sl' => $sourceLocale,
                    'tl' => $targetLocale,
                    'dt' => 't',
                    'q' => $trimmed,
                ]);

                if (! $response->successful()) {
                    return $text;
                }

                $data = $response->json();
                if (! is_array($data) || empty($data[0]) || ! is_array($data[0])) {
                    return $text;
                }

                $translated = '';
                foreach ($data[0] as $segment) {
                    if (isset($segment[0])) {
                        $translated .= $segment[0];
                    }
                }

                return $translated !== '' ? $translated : $text;
            } catch (\Throwable $e) {
                Log::warning('TranslationService error: '.$e->getMessage(), [
                    'target' => $targetLocale,
                    'text_sample' => mb_substr($trimmed, 0, 50),
                ]);

                return $text;
            }
        });
    }

    /**
     * Translate HTML content by preserving structural tags and images.
     */
    public function translateHtml(string $html, string $targetLocale, string $sourceLocale = 'id'): string
    {
        if (trim($html) === '' || $targetLocale === $sourceLocale) {
            return $html;
        }

        $cacheKey = 'tr_html_'.md5($sourceLocale.'_'.$targetLocale.'_'.$html);

        return Cache::remember($cacheKey, now()->addDays(30), function () use ($html, $targetLocale, $sourceLocale) {
            // Split HTML into block tags and non-tag segments
            $pattern = '/(<(?:p|h[1-6]|li|blockquote|div)[^>]*>.*?<\/(?:p|h[1-6]|li|blockquote|div)>|<img[^>]*>)/is';
            $parts = preg_split($pattern, $html, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

            if (! is_array($parts) || empty($parts)) {
                return $this->translateText($html, $targetLocale, $sourceLocale);
            }

            $output = '';
            foreach ($parts as $part) {
                $trimmedPart = trim($part);

                // If this is an image tag or empty, preserve directly
                if (preg_match('/^<img[^>]*>$/i', $trimmedPart) || $trimmedPart === '') {
                    $output .= $part;

                    continue;
                }

                // If this is a block element with an image inside and no other significant text
                if (preg_match('/^<(?<tag>p|h[1-6]|li|blockquote|div)(?<attrs>[^>]*)>(?<inner>.*?)<\/\1>$/is', $trimmedPart, $matches)) {
                    $inner = trim($matches['inner']);

                    // Pure image container
                    if (preg_match('/^<img[^>]*>$/i', $inner) || strip_tags($inner) === '') {
                        $output .= $part;

                        continue;
                    }

                    // Has text: translate inner content while keeping outer tag
                    $translatedInner = $this->translateText($inner, $targetLocale, $sourceLocale);
                    $output .= "<{$matches['tag']}{$matches['attrs']}>{$translatedInner}</{$matches['tag']}>";

                    continue;
                }

                // Raw text outside known blocks
                if (strip_tags($trimmedPart) !== '') {
                    $output .= $this->translateText($part, $targetLocale, $sourceLocale);
                } else {
                    $output .= $part;
                }
            }

            return $output !== '' ? $output : $html;
        });
    }

    /**
     * Translate an array of fields into multi-locale associative arrays.
     *
     * Example input: ['title' => 'Halo', 'story' => '<p>Cerita</p>'], ['en', 'ar']
     * Example output:
     * [
     *     'title' => ['id' => 'Halo', 'en' => 'Hello', 'ar' => 'مرحبا'],
     *     'story' => ['id' => '<p>Cerita</p>', 'en' => '<p>Story</p>', 'ar' => '<p>قصة</p>']
     * ]
     *
     * @param  array<string, string>  $fields
     * @param  array<string>  $targetLocales
     * @param  array<string>  $htmlFields  Keys that should be treated as HTML
     * @return array<string, array<string, string>>
     */
    public function translateFields(
        array $fields,
        array $targetLocales = self::SUPPORTED_LOCALES,
        string $sourceLocale = 'id',
        array $htmlFields = ['story', 'content_html', 'content']
    ): array {
        $result = [];

        foreach ($fields as $key => $value) {
            if (! is_string($value) || trim($value) === '') {
                continue;
            }

            $isHtml = in_array($key, $htmlFields, true);
            $result[$key] = [
                $sourceLocale => $value,
            ];

            foreach ($targetLocales as $target) {
                if ($target === $sourceLocale) {
                    continue;
                }

                $result[$key][$target] = $isHtml
                    ? $this->translateHtml($value, $target, $sourceLocale)
                    : $this->translateText($value, $target, $sourceLocale);
            }
        }

        return $result;
    }
}
