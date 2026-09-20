<?php

namespace App\Services;

class UserAgentParser
{
    /**
     * Parse User-Agent string and return device, OS, and browser info.
     *
     * @return array{device_type: string, os: string, browser: string, is_bot: bool}
     */
    public static function parse(?string $userAgent): array
    {
        if (empty($userAgent)) {
            return [
                'device_type' => 'desktop',
                'os' => 'Unknown',
                'browser' => 'Unknown',
                'is_bot' => false,
            ];
        }

        $isBot = self::detectBot($userAgent);
        $deviceType = self::detectDevice($userAgent);
        $os = self::detectOs($userAgent);
        $browser = self::detectBrowser($userAgent);

        return [
            'device_type' => $deviceType,
            'os' => $os,
            'browser' => $browser,
            'is_bot' => $isBot,
        ];
    }

    public static function detectBot(string $ua): bool
    {
        $bots = [
            'googlebot', 'bingbot', 'yandex', 'baiduspider', 'twitterbot',
            'facebookexternalhit', 'rogerbot', 'linkedinbot', 'embedly',
            'quora link preview', 'showyoubot', 'outbrain', 'pinterest/0.',
            'developers.google.com/+/web/snippet', 'slackbot', 'vkshare',
            'w3c_validator', 'redditbot', 'applebot', 'whatsapp', 'flipboard',
            'tumblr', 'bitlybot', 'skypeuripreview', 'nuzzel', 'discordbot',
            'google page speed', 'qwantify', 'pinterestbot', 'bitrix link preview',
            'xing-content', 'telegrambot', 'headlesschrome',
        ];

        $lowerUa = strtolower($ua);
        foreach ($bots as $bot) {
            if (str_contains($lowerUa, $bot)) {
                return true;
            }
        }

        return false;
    }

    public static function detectDevice(string $ua): string
    {
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $ua)) {
            return 'tablet';
        }

        if (preg_match('/(mobile|ipod|iphone|android|blackberry|iemobile|kindle|opera mini|opera mobi)/i', $ua)) {
            return 'mobile';
        }

        return 'desktop';
    }

    public static function detectOs(string $ua): string
    {
        if (preg_match('/iphone|ipad|ipod/i', $ua)) {
            return 'iOS';
        }
        if (preg_match('/android/i', $ua)) {
            return 'Android';
        }
        if (preg_match('/windows nt 10/i', $ua)) {
            return 'Windows 10/11';
        }
        if (preg_match('/windows nt 6\.3/i', $ua)) {
            return 'Windows 8.1';
        }
        if (preg_match('/windows/i', $ua)) {
            return 'Windows';
        }
        if (preg_match('/macintosh|mac os x/i', $ua)) {
            return 'macOS';
        }
        if (preg_match('/cros/i', $ua)) {
            return 'Chrome OS';
        }
        if (preg_match('/linux/i', $ua)) {
            return 'Linux';
        }

        return 'Other';
    }

    public static function detectBrowser(string $ua): string
    {
        if (preg_match('/edg/i', $ua)) {
            return 'Edge';
        }
        if (preg_match('/samsungbrowser/i', $ua)) {
            return 'Samsung Internet';
        }
        if (preg_match('/ucbrowser/i', $ua)) {
            return 'UC Browser';
        }
        if (preg_match('/opr|opera/i', $ua)) {
            return 'Opera';
        }
        if (preg_match('/chrome|crios/i', $ua) && ! preg_match('/edg/i', $ua)) {
            return 'Chrome';
        }
        if (preg_match('/firefox|fxios/i', $ua)) {
            return 'Firefox';
        }
        if (preg_match('/safari/i', $ua) && ! preg_match('/chrome|crios|android/i', $ua)) {
            return 'Safari';
        }

        return 'Other';
    }
}
