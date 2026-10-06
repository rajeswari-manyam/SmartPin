let googleMapsPromise: Promise<typeof google> | null = null;

/** How long to wait for the Google script before giving up. */
const LOAD_TIMEOUT_MS = 15000;

/**
 * Lets the UI offer a "Try again" button: a failed or timed-out load must not
 * poison the module-level promise forever.
 *
 * The stale `<script>` tag and the half-built `window.google` namespace are also
 * torn down. Google caches an API-level failure (bad key, API not enabled) for
 * the lifetime of the page, so without removing them a retry would reuse the
 * broken SDK and fail identically until a manual refresh.
 */
export function resetGoogleMapsLoader(): void {
    googleMapsPromise = null;

    if (typeof document !== "undefined") {
        document
            .querySelectorAll('script[src*="maps.googleapis.com/maps/api/js"]')
            .forEach((node) => node.parentNode?.removeChild(node));
    }

    if (typeof window !== "undefined") {
        // Remove the callback globals the previous load may have left behind.
        Object.keys(window)
            .filter((key) => key.startsWith("__googleMapsCallback_"))
            .forEach((key) => {
                delete (window as any)[key];
            });

        // Only clear the namespace if the SDK failed to produce a usable Map;
        // otherwise it is a working copy we want to keep reusing.
        if (!(window as any).google?.maps?.Map) {
            delete (window as any).google;
        }
    }
}

/**
 * Turns a Google Maps load failure into something the user can act on.
 *
 * The SDK reports most problems (API not enabled, billing off, key restricted,
 * bad referrer) by logging to the console and rendering a broken map, without
 * ever calling back into the app. `importLibrary` is the only documented way to
 * observe the real reason, so this maps those codes onto the fix.
 */
const describeGoogleMapsError = (err: any): string => {
    const raw = String(err?.message || err || "").trim();
    const code = raw.replace(/^Google Maps JavaScript API error:\s*/i, "").trim();

    const known: Record<string, string> = {
        ApiNotActivatedMapError:
            "The Maps JavaScript API is not enabled for this Google Cloud project. " +
            "This is the most common cause: the key is valid, but the Maps API was never turned on. " +
            "In Google Cloud Console, open the project that owns the key, go to " +
            "'APIs & Services' > 'Library', and enable 'Maps JavaScript API' (plus 'Geocoding API' " +
            "and 'Places API' for the search box). Wait a minute, then press 'Try again'.",
        BillingNotEnabledMapError:
            "Billing is not enabled on the Google Cloud project that owns this key. " +
            "The Maps JavaScript API requires an active billing account even on the free tier.",
        RefererNotAllowedMapError:
            "This key is restricted and does not allow this page's origin. " +
            "In Google Cloud Console, add 'http://localhost:3000' to the key's " +
            "'Application restrictions' > 'HTTP referrers'.",
        InvalidKeyMapError:
            "This API key is not valid for the Google Maps JavaScript API. " +
            "Create a dedicated key for Maps instead of reusing a key created for another product.",
        RequestDeniedMapError:
            "The Maps JavaScript API request was denied for this key. Check that the key is not " +
            "restricted to a different API, product or referrer list.",
        InvalidKeyError:
            "The API key is malformed. Check REACT_APP_GOOGLE_MAPS_API_KEY in .env.",
    };

    if (known[code]) return `${known[code]} (Google reported: ${code})`;

    if (raw) {
        return (
            `Google Maps could not initialise. ${raw} ` +
            "Check that the Maps JavaScript API, Geocoding API and Places API are enabled for " +
            "this key, that billing is active, and that the key's HTTP referrer restrictions " +
            "include this site."
        );
    }

    return (
        "Google Maps could not initialise. Enable the Maps JavaScript API, Geocoding API and " +
        "Places API for this key in Google Cloud Console, ensure billing is active, and that " +
        "the key's HTTP referrer restrictions allow this site."
    );
};

const getGoogleMapsApiKey = (): string => {
    // This is a Create React App project (react-scripts), so webpack's
    // DefinePlugin replaces `process.env.REACT_APP_GOOGLE_MAPS_API_KEY` with the
    // literal key at BUILD time. Read it directly and unconditionally.
    //
    // Do NOT wrap this in `typeof process !== "undefined"`. CRA 5 / webpack 5
    // does not polyfill a global `process`, so that guard is always false in the
    // browser and silently discards the inlined key, which surfaces as
    // "Google Maps API key is missing" even though .env is correct.
    //
    // Do NOT add an `import.meta.env` fallback either: `import.meta` is only
    // legal inside an ES module and CRA serves its bundle as a classic script,
    // so the browser fails at parse time with
    // "SyntaxError: Cannot use 'import.meta' outside a module" - `typeof
    // import.meta` does not guard this, because the error happens before any
    // runtime check runs.
    return String(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "").trim();
};

export function loadGoogleMaps(): Promise<typeof google> {
    // Already loaded
    if (
        typeof window !== "undefined" &&
        window.google?.maps?.Map
    ) {
        return Promise.resolve(window.google);
    }

    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    const apiKey = getGoogleMapsApiKey();

    if (!apiKey) {
        return Promise.reject(
            new Error(
                "Google Maps API key is missing. Add REACT_APP_GOOGLE_MAPS_API_KEY to .env"
            )
        );
    }

    googleMapsPromise = new Promise<typeof google>((resolve, reject) => {
        let settled = false;

        const fail = (message: string, cause?: unknown) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            googleMapsPromise = null;
            delete (window as any)[callbackName];
            const error = new Error(message);
            if (cause !== undefined) (error as any).cause = cause;
            reject(error);
        };

        const succeed = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(window.google);
        };

        /**
         * `window.google.maps.Map` existing does NOT mean the Maps API works: with
         * the API disabled or billing off, Google still builds the namespace and
         * calls back, then renders a broken map while logging to the console.
         * Asking for the `maps` library is what actually surfaces the real reason.
         */
        const verifyThenSucceed = (g: typeof google) => {
            const importLibrary = (g?.maps as any)?.importLibrary;
            if (typeof importLibrary !== "function") {
                succeed();
                return;
            }
            Promise.resolve(importLibrary("maps"))
                .then(() => succeed())
                .catch((err) => fail(describeGoogleMapsError(err), err));
        };

        // Google reports a bad key, a disabled Maps JavaScript API or a billing
        // problem by rendering an error panel *inside* the map - it does not fire
        // `onerror`, and in some cases never calls the `callback` at all. Without
        // this timeout the promise would stay pending forever and the caller would
        // render an empty box with no explanation.
        const timer = setTimeout(() => {
            fail(
                "Google Maps did not load within 15s. This usually means the " +
                "Maps JavaScript API is not enabled for REACT_APP_GOOGLE_MAPS_API_KEY, " +
                "billing is disabled, or the key is restricted to other referrers."
            );
        }, LOAD_TIMEOUT_MS);

        const callbackName = `__googleMapsCallback_${Date.now()}`;

        (window as any)[callbackName] = () => {
            if (window.google?.maps?.Map) {
                verifyThenSucceed(window.google);
            } else {
                fail(
                    "Google Maps loaded but window.google.maps is unavailable. " +
                    "Enable the Maps JavaScript API for this key."
                );
            }
        };

        const existingScript = document.querySelector(
            'script[src*="maps.googleapis.com/maps/api/js"]'
        ) as HTMLScriptElement | null;

        if (existingScript) {
            // Another copy of the SDK is already in the page. Reuse it instead of
            // injecting a second script, and just wait for `google.maps` to appear.
            const checkGoogle = () => {
                if (settled) return;
                if (window.google?.maps?.Map) {
                    verifyThenSucceed(window.google);
                } else {
                    setTimeout(checkGoogle, 100);
                }
            };
            checkGoogle();
            return;
        }

        const script = document.createElement("script");

        // `loading=async` is what exposes `google.maps.importLibrary`, which is the
        // only reliable way to observe API-level failures such as
        // ApiNotActivatedMapError instead of silently rendering a blank map.
        script.src =
            `https://maps.googleapis.com/maps/api/js` +
            `?key=${encodeURIComponent(apiKey)}` +
            `&libraries=places` +
            `&v=weekly` +
            `&loading=async` +
            `&callback=${callbackName}`;

        script.async = true;

        script.onerror = (event) => {
            fail(
                "Google Maps JavaScript API failed to load. Check the API key, " +
                "billing, API restrictions and enabled APIs.",
                event
            );
        };

        document.head.appendChild(script);
    });

    return googleMapsPromise;
}