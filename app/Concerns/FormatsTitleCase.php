<?php

namespace App\Concerns;

trait FormatsTitleCase
{
    /**
     * Format title using Indonesian EYD or English title case.
     */
    protected function formatTitleCase(string $text, string $locale = 'id'): string
    {
        if (empty($text) || $locale === 'ar') {
            return $text;
        }

        $idStopWords = [
            'di', 'ke', 'dari', 'pada', 'dalam', 'untuk', 'dengan', 'dan', 'atau',
            'serta', 'yang', 'oleh', 'tentang', 'sebagai', 'atas', 'terhadap',
            'hingga', 'sampai', 'bagi', 'karena', 'agar', 'namun', 'tetapi',
            'melalui', 'secara', 'per', 'pun', 'si', 'sang',
        ];

        $enStopWords = [
            'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at',
            'to', 'from', 'by', 'with', 'in', 'of', 'as', 'into', 'onto',
        ];

        $stopWords = $locale === 'en' ? $enStopWords : $idStopWords;
        $isAllUpper = mb_strtoupper($text) === $text && mb_strtolower($text) !== $text;

        $clauses = preg_split('/([:–—])/', $text, -1, PREG_SPLIT_DELIM_CAPTURE);
        $result = '';

        foreach ($clauses as $clause) {
            if ($clause === ':' || $clause === '–' || $clause === '—') {
                $result .= $clause;

                continue;
            }

            $parts = preg_split('/(\s+)/u', $clause, -1, PREG_SPLIT_DELIM_CAPTURE);
            $wordsOnly = array_values(array_filter($parts, fn ($p) => trim($p) !== ''));
            $totalWords = count($wordsOnly);
            $wordIndex = 0;

            foreach ($parts as $part) {
                if (trim($part) === '') {
                    $result .= $part;

                    continue;
                }

                $isFirst = $wordIndex === 0;
                $isLast = $wordIndex === $totalWords - 1;
                $wordIndex++;

                $result .= $this->capitalizeToken($part, $isFirst, $isLast, $stopWords, $isAllUpper);
            }
        }

        return $result;
    }

    /**
     * Capitalize a single word token according to Title Case rules.
     */
    protected function capitalizeToken(string $token, bool $isFirst, bool $isLast, array $stopWords, bool $isAllUpper): string
    {
        if (str_contains($token, '-')) {
            $subTokens = explode('-', $token);
            $subCount = count($subTokens);
            $capitalizedSubs = [];
            foreach ($subTokens as $idx => $sub) {
                $capitalizedSubs[] = $this->capitalizeToken($sub, $isFirst && $idx === 0, $isLast && $idx === $subCount - 1, $stopWords, $isAllUpper);
            }

            return implode('-', $capitalizedSubs);
        }

        $cleanWord = mb_strtolower(preg_replace('/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/u', '', $token));

        if (! $isAllUpper && strlen($token) > 1 && strtoupper($token) === $token && preg_match('/[A-Z]/', $token)) {
            return $token;
        }

        if (! $isFirst && ! $isLast && in_array($cleanWord, $stopWords, true)) {
            return preg_replace('/\b'.preg_quote($cleanWord, '/').'\b/iu', $cleanWord, $token);
        }

        if (preg_match('/^([^\p{L}]*)(\p{L})(.*)$/u', $token, $matches)) {
            return $matches[1].mb_strtoupper($matches[2]).mb_strtolower($matches[3]);
        }

        return $token;
    }
}
