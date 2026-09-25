<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class NoUrlRule implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || trim($value) === '') {
            return;
        }

        // Detect http://, https://, ftp://, www., or common domain extensions
        $pattern = '/(https?:\/\/|ftp:\/\/|www\.)|(\b[a-zA-Z0-9-]+\.(com|id|co\.id|net|org|xyz|top|site|online|io|info|me|cc|live|biz|club|vip|link|pro|shop)\b)/i';

        if (preg_match($pattern, $value)) {
            $label = $attribute === 'message' ? 'Pesan doa' : 'Nama';
            $fail("{$label} tidak diperkenankan mengandung tautan atau link website.");
        }
    }
}
