import React, { useEffect } from 'react';

export default function LanguageSwitcher() {
    useEffect(() => {
        // Define GTranslate settings
        window.gtranslateSettings = {
            "default_language": "id",
            "languages": ["id", "en", "ar"],
            "wrapper_selector": ".gtranslate_wrapper",
            "flag_size": 24,
            "switcher_horizontal_position": "inline"
        };

        // Only load the script once
        if (!document.getElementById('gtranslate-script')) {
            const script = document.createElement('script');
            script.id = 'gtranslate-script';
            script.src = "https://cdn.gtranslate.net/widgets/latest/flags.js";
            script.defer = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <div className="relative inline-block text-left mt-2">
            <div className="gtranslate_wrapper"></div>
        </div>
    );
}
