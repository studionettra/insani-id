import React, { useEffect, useState, useRef } from 'react';

const languages = [
    { code: 'id', flag: 'id', name: 'Indonesian' },
    { code: 'en', flag: 'en', name: 'English' },
    { code: 'ar', flag: 'ar', name: 'Arabic' },
];

export default function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('id');
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Define initialization callback for Google Translate
        window.googleTranslateElementInit2 = () => {
            if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement(
                    { pageLanguage: 'id', autoDisplay: false },
                    'google_translate_element2'
                );
            }
        };

        // Inject Google Translate script directly (this is what GTranslate uses under the hood)
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';
            script.async = true;
            document.body.appendChild(script);
        }

        // Add styles to hide the native Google Translate banner at the top of the page
        if (!document.getElementById('google-translate-styles')) {
            const style = document.createElement('style');
            style.id = 'google-translate-styles';
            style.innerHTML = `
                body { top: 0 !important; }
                .skiptranslate, #google_translate_element2 { display: none !important; }
                font font { background-color: transparent !important; box-shadow: none !important; position: initial !important; }
            `;
            document.head.appendChild(style);
        }

        // Restore language state from googtrans cookie if exists
        const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
        if (match && match[2]) {
            const parts = match[2].split('/');
            if (parts.length === 3 && parts[2] !== 'id') {
                setCurrentLang(parts[2]);
            }
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (langCode) => {
        setCurrentLang(langCode);
        setIsOpen(false);

        // Native method to trigger Google Translate
        const teCombo = document.querySelector('.goog-te-combo');
        if (teCombo) {
            teCombo.value = langCode === 'id' ? '' : langCode; // Revert to original language if 'id'
            teCombo.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            // Fallback: Set cookie manually and reload
            document.cookie = `googtrans=/id/${langCode}; path=/`;
            document.cookie = `googtrans=/id/${langCode}; path=/; domain=${window.location.hostname}`;
            window.location.reload();
        }
    };

    const currentFlag = languages.find(l => l.code === currentLang)?.flag || 'id';

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* The hidden element required by Google Translate */}
            <div id="google_translate_element2" className="hidden"></div>
            
            {/* Custom Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-100 transition-colors focus:outline-none active:scale-95"
                title="Ganti Bahasa"
            >
                <img 
                    src={`https://cdn.gtranslate.net/flags/svg/${currentFlag}.svg`} 
                    alt={currentLang} 
                    className="w-[22px] h-[22px] rounded-sm object-cover shadow-sm border border-zinc-200"
                />
            </button>

            {/* Custom Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 py-2 w-14 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-zinc-200/60 z-50 flex flex-col items-center gap-1 origin-top-right transition-all">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-90 ${currentLang === lang.code ? 'bg-brand-50' : 'hover:bg-zinc-100'}`}
                            title={lang.name}
                        >
                            <img 
                                src={`https://cdn.gtranslate.net/flags/svg/${lang.flag}.svg`} 
                                alt={lang.code} 
                                className="w-[22px] h-[22px] rounded-sm object-cover shadow-sm border border-zinc-200"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
