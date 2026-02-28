import { useEffect } from "react";

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

const GoogleTranslate = () => {
    useEffect(() => {
        // Prevent duplicate loading
        if (document.getElementById("google-translate-script")) return;

        window.googleTranslateElementInit = () => {
            if (!window.google?.translate) {
                console.warn("Google Translate not available yet");
                return;
            }

            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    autoDisplay: false,
                },
                "google_translate_element"
            );
        };

        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src =
            "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        script.crossOrigin = "anonymous";

        // ✅ catch script load failure
        script.onerror = () => {
            console.error("Google Translate script failed to load");
        };

        document.body.appendChild(script);
    }, []);

    return <div id="google_translate_element" style={{ display: "none" }} />;
};

export default GoogleTranslate;