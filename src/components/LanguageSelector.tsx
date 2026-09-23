import { useState, useEffect, useRef } from "react";
import { ChevronDown, Languages } from "lucide-react";

const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "pa", name: "Punjabi" },
    { code: "bn", name: "Bengali" },
    { code: "gu", name: "Gujarati" },
    { code: "mr", name: "Marathi" },
    { code: "ur", name: "Urdu" },
    { code: "or", name: "Odia" },
    { code: "as", name: "Assamese" },
];

// Read the active language from the googtrans cookie (set by Google Translate)
const getActiveLanguageCode = (): string => {
    try {
        const raw = document.cookie
            .split("; ")
            .find(row => row.startsWith("googtrans="));
        if (!raw) return "en";
        const value = decodeURIComponent(raw.split("=")[1] || "");
        const parts = value.split("/").filter(Boolean);
        return parts[parts.length - 1] || "en";
    } catch {
        return "en";
    }
};

const LanguageSelector = () => {
    const [open, setOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState(() => {
        const code = getActiveLanguageCode();
        return languages.find(l => l.code === code)?.name || "English";
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (
    //             dropdownRef.current &&
    //             !dropdownRef.current.contains(event.target as Node)
    //         ) {
    //             setOpen(false);
    //         }
    //     };
    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () =>
    //         document.removeEventListener("mousedown", handleClickOutside);
    // }, []);
useEffect(() => {
  const openFromOutside = () => {
    setOpen(true);
  };

  window.addEventListener("openLanguageSelector", openFromOutside);

  return () => {
    window.removeEventListener("openLanguageSelector", openFromOutside);
  };
}, []);
    const changeLanguage = (langCode: string, langName: string) => {
        // 1) Try to trigger the widget live (works on first change)
        const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // 2) Persist the choice so the widget re-translates on every load.
        //    The widget only honours programmatic changes once, so this
        //    guarantees the language actually changes every time.
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = `googtrans=/en/${langCode}; path=/;`;

        setSelectedLang(langName);
        setOpen(false);
        window.setTimeout(() => window.location.reload(), 300);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                ref={buttonRef}
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 hover:bg-[#00598a] transition"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <Languages className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm text-gray-700">{selectedLang}</span>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div
                    className="fixed bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    style={{
                        top: buttonRef.current
                            ? `${buttonRef.current.getBoundingClientRect().bottom + 8}px`
                            : '0px',
                        left: buttonRef.current
                            ? `${buttonRef.current.getBoundingClientRect().left}px`
                            : '0px',
                        width: buttonRef.current
                            ? `${buttonRef.current.offsetWidth}px`
                            : '176px',
                        zIndex: 10000,
                    }}
                >
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code, lang.name)}
                            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition first:rounded-t-lg last:rounded-b-lg"
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
