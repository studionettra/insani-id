<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class NoProfanityRule implements ValidationRule
{
    /**
     * Common vulgar, offensive, gambling, and inappropriate words.
     *
     * @var array<string>
     */
    protected array $badWords = [
        // Kata kotor / makian
        'anjing', 'babi', 'bangsat', 'kontol', 'memek', 'pantek', 'itil',
        'ngentot', 'jembut', 'perek', 'pepek', 'lonte', 'bajingan', 'tolol',
        'goblok', 'idiot', 'kampret', 'tai', 'bangke', 'bejat', 'keparat',
        'fuck', 'bitch', 'asshole', 'shit', 'cunt', 'dick',

        // Judi online / penipuan
        'slot', 'gacor', 'zeus', 'pragmatic', 'maxwin', 'togel', 'casino',
        'sbobet', 'depo', 'scatter', 'judol', 'bocoran slot',

        // Pornografi / asusila
        'bokep', 'porno', 'porn', 'lendir', 'open bo', 'vcs',
    ];

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

        $lowercaseValue = strtolower($value);

        foreach ($this->badWords as $badWord) {
            // Gunakan word boundary \b agar tidak false positive (misal "memancing", "babinsa")
            $pattern = '/\b'.preg_quote($badWord, '/').'\b/i';
            if (preg_match($pattern, $lowercaseValue)) {
                $label = $attribute === 'message' ? 'Pesan doa' : 'Nama';
                $fail("{$label} mengandung kata yang tidak diperkenankan.");

                return;
            }
        }
    }
}
