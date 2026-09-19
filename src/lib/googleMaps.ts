let googleMapsPromise: Promise<typeof google> | null = null;

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

export function loadGoogleMaps(): Promise<typeof google> {
    if (window.google?.maps?.places) {
        return Promise.resolve(window.google);
    }

    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    if (!GOOGLE_MAPS_API_KEY) {
        return Promise.reject(new Error("REACT_APP_GOOGLE_MAPS_API_KEY is not set"));
    }

    googleMapsPromise = new Promise<typeof google>((resolve, reject) => {
        const existing = Array.from(
            document.querySelectorAll<HTMLScriptElement>(
                "script[src*='maps.googleapis.com/maps/api/js']"
            )
        )[0];

        let script: HTMLScriptElement;
        if (existing) {
            script = existing;
        } else {
            script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        script.addEventListener("load", () => resolve(window.google));
        script.addEventListener("error", () => {
            googleMapsPromise = null;
            reject(new Error("Failed to load Google Maps JavaScript API"));
        });
    });

    return googleMapsPromise;
}