import { useEffect } from "react";

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

const GoogleTranslate = () => {
    useEffect(() => {
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                },
                "google_translate_element"
            );
        };
    }, []);

    return <div id="google_translate_element" />;
};

export default GoogleTranslate;
