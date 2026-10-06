import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Info, Loader2, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    geocodeAddressNominatim,
    resolveSuggestion,
    reverseGeocodeNominatim,
    searchPlacesNominatim,
    type LocationSuggestion,
} from "../utils/nominatimUtils";
import { getBrowserCoordinates, isValidCoordinates } from "../utils/googleMapsUtils";
import { loadGoogleMaps } from "../lib/googleMaps";
import { resolveMapProvider, markGoogleMapsUnusable, type MapProvider } from "../utils/mapProvider";
import { readSavedLocation, saveLocationToStorage } from "../utils/locationUtils";
import type { LocationPickerValue } from "../types/location.types";

const BRAND = "#00598a";

/** Fallback centre (centre of India) so the map always opens on something. */
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

/**
 * Zoom levels, matched to the rentongovehvehicle location screen
 * (`src/pages/ChangeLocation.tsx`), which opens at 14 and zooms to 15 on pick.
 * Below ~13 the OSM tiles show blocks rather than street names, which is what
 * made the map look like it had no streets.
 */
const ZOOM_OPEN = 14;
const ZOOM_PICK = 16;

/** No point selected. Coordinates are `0` so a stale pin can never survive. */
export const EMPTY_LOCATION: LocationPickerValue = {
    address: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    latitude: 0,
    longitude: 0,
};

type LocationField = "area" | "city" | "state" | "pincode";

type Props = {
    /** Controlled value. Used to pre-fill edit screens and saved locations. */
    value?: Partial<LocationPickerValue> | null;
    /** Fired on every change - including when coordinates are cleared. */
    onLocationChange: (location: LocationPickerValue) => void;
    /** Fired only when the user presses "Confirm Location" inside the map. */
    onConfirm?: (location: LocationPickerValue) => void;
    title?: string;
    error?: string;
    /** Height classes for the map area inside the modal. */
    mapHeightClass?: string;
    /** Display only: the map still works but no edit control is rendered. */
    readOnly?: boolean;
    /** Seed from the location saved by `LocationSelector` on first mount. */
    useSavedLocation?: boolean;
    autoDetectLabel?: string;
    confirmLabel?: string;
    inputClassName?: string;
};

const FIELD_LABELS: Record<LocationField, string> = {
    area: "Area / Locality",
    city: "City",
    state: "State",
    pincode: "PIN Code",
};

const FIELD_PLACEHOLDERS: Record<LocationField, string> = {
    area: "e.g. Srinagar Katta",
    city: "e.g. Vijayawada",
    state: "e.g. Andhra Pradesh",
    pincode: "e.g. 521137",
};

/** `area, city, state, pincode` in the order used for geocoding. */
const buildAddress = (location: LocationPickerValue): string =>
    [location.area, location.city, location.state, location.pincode].filter(Boolean).join(", ");

const formatCoord = (value: number): string => (isFinite(value) ? value.toFixed(6) : "-");

/**
 * Swiggy-style location picker.
 *
 * The form itself only holds text fields and two buttons - the map lives in a
 * modal and is never permanently on the page. Three ways to choose a point, all
 * writing to the same value:
 *   1. type a place, pick a search suggestion
 *   2. "Auto Detect" - browser GPS, reverse geocoded, then the map opens
 *   3. "Select Location on Map" - the typed address is geocoded and the map
 *      opens on it, then the pin can be dragged or moved by clicking the map
 *
 * The component owns the coordinates. Whenever the address stops matching the
 * selected point the coordinates are cleared immediately (set to `0`) and only
 * restored once the new address has been geocoded, so a form can never submit
 * a new address together with the previous location's coordinates.
 */
const LocationPicker: React.FC<Props> = ({
    value,
    onLocationChange,
    onConfirm,
    title = "Location Details",
    error,
    mapHeightClass = "h-[45vh] sm:h-[420px]",
    readOnly = false,
    useSavedLocation = true,
    autoDetectLabel = "Auto Detect",
    confirmLabel = "Confirm Location",
    inputClassName = "",
}) => {
    const [location, setLocation] = useState<LocationPickerValue>(EMPTY_LOCATION);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [opening, setOpening] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [notice, setNotice] = useState("");

    // -- Map modal state ------------------------------------------------------
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [mapStatus, setMapStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
    const [mapError, setMapError] = useState("");
    /** Bumping this re-runs the map bootstrap - used by the "Try again" button. */
    const [mapLoadToken, setMapLoadToken] = useState(0);

    const mapDivRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    /** Which map engine actually painted the container. `null` until resolved. */
    const [provider, setProvider] = useState<MapProvider | null>(null);
    const googleRef = useRef<typeof google | null>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const googleMarkerRef = useRef<google.maps.Marker | null>(null);
    /** Text that the currently selected point actually corresponds to. */
    const resolvedTextRef = useRef("");
    /** Set once the user edits a structured field, to trigger re-geocoding. */
    const fieldsTouchedRef = useRef(false);
    const suggestionSeqRef = useRef(0);
    const reverseSeqRef = useRef(0);
    const inputWrapRef = useRef<HTMLDivElement | null>(null);
    const lastPropSignatureRef = useRef("");
    const seededRef = useRef(false);
    /** Where the map should open - set by Auto Detect / "Select on map". */
    const desiredCenterRef = useRef<{ lat: number; lng: number }>(DEFAULT_CENTER);
    /** Last known good centre, so re-opening the modal does not jump to India. */
    const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null);

    // Latest-value refs keep the map listeners stable: the map is created once
    // per modal open and must not be torn down when a callback identity changes.
    const locationRef = useRef(location);
    locationRef.current = location;
    const pickRef = useRef<(lat: number, lng: number) => void>(() => undefined);
    const placeMarkerRef = useRef<(lat: number, lng: number, pan?: boolean) => void>(() => undefined);

    /* -- Marker -------------------------------------------------------------- */
    const placeMarker = useCallback((latitude: number, longitude: number, pan = true) => {
        const g = googleRef.current;
        const gmap = googleMapRef.current;

        // Google is preferred when the key works for this domain, because it is
        // the only engine that labels streets clearly.
        if (g && gmap) {
            if (!googleMarkerRef.current) {
                googleMarkerRef.current = new g.maps.Marker({
                    map: gmap,
                    position: { lat: latitude, lng: longitude },
                    draggable: true,
                    title: "Selected location",
                });
                googleMarkerRef.current.addListener("dragend", () => {
                    const p = googleMarkerRef.current?.getPosition();
                    if (p) pickRef.current(p.lat(), p.lng());
                });
            } else {
                googleMarkerRef.current.setPosition({ lat: latitude, lng: longitude });
            }
            if (pan) {
                gmap.panTo({ lat: latitude, lng: longitude });
                if ((gmap.getZoom() ?? 0) < ZOOM_PICK) gmap.setZoom(ZOOM_PICK);
            }
            return;
        }

        const map = mapRef.current;
        if (!map) return;
        const position: L.LatLngExpression = [latitude, longitude];
        if (!markerRef.current) {
            markerRef.current = L.marker(position, { draggable: true, title: "Selected location" })
                .addTo(map)
                .on("dragend", () => {
                    const p = markerRef.current?.getLatLng();
                    if (p) pickRef.current(p.lat, p.lng);
                });
        } else {
            markerRef.current.setLatLng(position);
        }
        if (pan) {
            map.panTo(position);
            if (map.getZoom() < ZOOM_PICK) map.setZoom(ZOOM_PICK);
        }
    }, []);
    placeMarkerRef.current = placeMarker;

    /** Drops the pin - used whenever the address is edited by hand. */
    const clearMarker = useCallback(() => {
        if (googleMarkerRef.current) {
            googleMarkerRef.current.setMap(null);
            googleMarkerRef.current = null;
        }
        markerRef.current?.remove();
        markerRef.current = null;
    }, []);

    /* -- Map lifecycle: one create per modal open, torn down on close ------- */
    useEffect(() => {
        if (!isMapOpen) return;
        let cancelled = false;

        setMapStatus("loading");
        setMapError("");
        setProvider(null);

        // The map must never be constructed while its container is still
        // `display: none`, otherwise Leaflet caches a 0x0 viewport and renders
        // a blank grey tile area even after the modal becomes visible. Waiting a
        // frame lets the modal lay out first so the div has a real size.
        const raf = requestAnimationFrame(async () => {
            const element = mapDivRef.current;
            if (!element || cancelled) return;

            // Google first (street-level detail, same as rentongovehvehicle),
            // OpenStreetMap when the key is not usable from this origin.
            const chosen = await resolveMapProvider();
            if (cancelled) return;

            try {
                const center = desiredCenterRef.current ?? DEFAULT_CENTER;
                const current = locationRef.current;
                const hasPoint = isValidCoordinates(current.latitude, current.longitude);
                const initialCenter = hasPoint
                    ? { lat: current.latitude, lng: current.longitude }
                    : center;

                let useGoogle = chosen === "google";
                if (useGoogle) {
                    const g = await loadGoogleMaps();
                    if (cancelled) return;
                    googleRef.current = g;

                    const gmap = new g.maps.Map(element, {
                        center: initialCenter,
                        zoom: hasPoint ? ZOOM_PICK : ZOOM_OPEN,
                        zoomControl: true,
                        clickableIcons: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        mapTypeControl: false,
                    });
                    googleMapRef.current = gmap;

                    if (!readOnly) {
                        gmap.addListener("click", (event: google.maps.MapMouseEvent) => {
                            if (event.latLng) pickRef.current(event.latLng.lat(), event.latLng.lng());
                        });
                    }

                    // Loading the library is not proof the key works: a blocked
                    // or unactivated key still returns a Map object that simply
                    // never draws. `tilesloaded` is the only reliable success
                    // signal, so wait for it and fall back if it never fires.
                    const drew = await new Promise<boolean>((resolve) => {
                        let settled = false;
                        const finish = (ok: boolean) => {
                            if (settled) return;
                            settled = true;
                            clearTimeout(timer);
                            resolve(ok);
                        };
                        const timer = window.setTimeout(() => finish(false), 5000);
                        googleRef.current?.maps.event.addListenerOnce(gmap, "tilesloaded", () =>
                            finish(true)
                        );
                    });
                    if (cancelled) return;

                    if (!drew) {
                        markGoogleMapsUnusable("map never rendered");
                        // Tear the dead Google map down before Leaflet takes the
                        // same container, otherwise both engines fight over it.
                        googleMapRef.current = null;
                        googleRef.current = null;
                        element.innerHTML = "";
                        useGoogle = false;
                    }
                }

                setProvider(useGoogle ? "google" : "leaflet");

                if (!useGoogle) {
                    const map = L.map(element, {
                        center: [initialCenter.lat, initialCenter.lng],
                        zoom: hasPoint ? ZOOM_PICK : ZOOM_OPEN,
                        zoomControl: true,
                        attributionControl: true,
                    });

                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        maxZoom: 19,
                        attribution: "&copy; OpenStreetMap contributors",
                    }).addTo(map);

                    mapRef.current = map;

                    if (!readOnly) {
                        map.on("click", (event: L.LeafletMouseEvent) => {
                            pickRef.current(event.latlng.lat, event.latlng.lng);
                        });
                    }
                }

                // Re-show the pin for an already-selected point.
                if (hasPoint) {
                    placeMarkerRef.current(current.latitude, current.longitude, false);
                }

                // Leaflet needs an explicit invalidateSize when it was created
                // inside a container that had not finished laying out.
                window.setTimeout(() => {
                    if (cancelled) return;
                    mapRef.current?.invalidateSize();
                    const gmap = googleMapRef.current;
                    if (gmap) {
                        googleRef.current?.maps.event.trigger(gmap, "resize");
                    }
                }, 120);

                setMapStatus("ready");
            } catch (err) {
                if (cancelled) return;
                console.error("[LocationPicker] Map failed to initialise:", err);
                setMapError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load the map. Check your network connection."
                );
                setMapStatus("error");
            }
        });

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            if (googleMarkerRef.current) {
                googleMarkerRef.current.setMap(null);
                googleMarkerRef.current = null;
            }
            googleMapRef.current = null;
            googleRef.current = null;
            markerRef.current?.remove();
            markerRef.current = null;
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, [isMapOpen, mapLoadToken, readOnly]);

    /* -- Applying a resolved location ---------------------------------------- */
    const applyResolved = useCallback(
        (next: LocationPickerValue, options?: { syncQuery?: boolean }) => {
            setLocation(next);
            if (options?.syncQuery !== false) {
                setQuery(next.address);
                resolvedTextRef.current = next.address;
            }
            setSuggestions([]);
            setSuggestionsOpen(false);
            setNotice("");
            setConfirmed(false);
            fieldsTouchedRef.current = false;
            if (isValidCoordinates(next.latitude, next.longitude)) {
                lastCenterRef.current = { lat: next.latitude, lng: next.longitude };
                placeMarker(next.latitude, next.longitude, true);
            }
            onLocationChange(next);
        },
        [onLocationChange, placeMarker]
    );

    /* -- Seed: controlled value, then the location saved by LocationSelector -- */
    const propSignature = useMemo(() => {
        if (!value) return "";
        return [
            value.address ?? "",
            value.area ?? "",
            value.city ?? "",
            value.state ?? "",
            value.pincode ?? "",
            value.latitude ?? 0,
            value.longitude ?? 0,
        ].join("|");
    }, [value]);

    useEffect(() => {
        if (!propSignature || propSignature === lastPropSignatureRef.current) return;
        lastPropSignatureRef.current = propSignature;
        const source = value as Partial<LocationPickerValue>;
        const next: LocationPickerValue = {
            address: source.address ?? "",
            area: source.area ?? "",
            city: source.city ?? "",
            state: source.state ?? "",
            pincode: source.pincode ?? "",
            latitude: source.latitude ?? 0,
            longitude: source.longitude ?? 0,
        };
        setLocation(next);
        // A controlled parent echoes the change straight back. If it echoes an
        // empty `address` (which is what happens while the user is still typing
        // in the search box) the query must be left alone, otherwise the
        // in-progress text would be wiped on every keystroke.
        if (next.address) {
            setQuery(next.address);
            resolvedTextRef.current = next.address;
        }
        setConfirmed(isValidCoordinates(next.latitude, next.longitude));
        if (isValidCoordinates(next.latitude, next.longitude)) {
            lastCenterRef.current = { lat: next.latitude, lng: next.longitude };
        }
    }, [propSignature, value]);

    useEffect(() => {
        if (seededRef.current) return;
        seededRef.current = true;
        if (propSignature || !useSavedLocation) return;
        const saved = readSavedLocation();
        if (!saved) return;
        const next: LocationPickerValue = {
            address: saved.address,
            area: saved.area,
            city: saved.city,
            state: saved.state,
            pincode: saved.pincode,
            latitude: saved.latitude,
            longitude: saved.longitude,
        };
        setLocation(next);
        setQuery(next.address);
        resolvedTextRef.current = next.address;
        setConfirmed(true);
        if (isValidCoordinates(next.latitude, next.longitude)) {
            lastCenterRef.current = { lat: next.latitude, lng: next.longitude };
        }
        onLocationChange(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* -- Search suggestions -------------------------------------------------- */
    useEffect(() => {
        const text = query.trim();
        if (!text || text === resolvedTextRef.current || text.length < 2) {
            setSuggestions([]);
            setSuggestionsOpen(false);
            return;
        }

        const seq = ++suggestionSeqRef.current;
        const timer = setTimeout(async () => {
            const predictions = await searchPlacesNominatim(text).catch(() => []);
            if (seq !== suggestionSeqRef.current) return;
            setSuggestions(predictions);
            setSuggestionsOpen(predictions.length > 0);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!suggestionsOpen) return;
        const onPointerDown = (event: MouseEvent) => {
            if (inputWrapRef.current && !inputWrapRef.current.contains(event.target as Node)) {
                setSuggestionsOpen(false);
            }
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, [suggestionsOpen]);

    /* -- Typing: clear the coordinates first, then re-geocode the new address -- */
    const handleQueryChange = (text: string) => {
        setQuery(text);
        setNotice("");
        if (text === resolvedTextRef.current) return;
        // The typed text no longer matches the selected point, so the old
        // coordinates must not be submitted with it. Only the coordinates and
        // the composed address are invalidated - the structured fields the user
        // already filled in are kept.
        setConfirmed(false);
        setResolving(true);
        clearMarker();
        const invalidated: LocationPickerValue = {
            ...locationRef.current,
            address: "",
            latitude: 0,
            longitude: 0,
        };
        setLocation(invalidated);
        onLocationChange(invalidated);
    };

    useEffect(() => {
        const text = query.trim();
        if (!text || text === resolvedTextRef.current) return;
        const seq = ++suggestionSeqRef.current;
        const timer = setTimeout(async () => {
            const resolved = await geocodeAddressNominatim(text).catch(() => null);
            if (seq !== suggestionSeqRef.current) return;
            if (resolved) {
                applyResolved(resolved);
            } else {
                setNotice(`Could not find "${text}". Pick a suggestion or open the map to drop a pin.`);
            }
            setResolving(false);
        }, 900);
        return () => clearTimeout(timer);
    }, [query, applyResolved]);

    const handleSelectSuggestion = async (suggestion: LocationSuggestion) => {
        setResolving(true);
        setNotice("");
        try {
            const resolved = await resolveSuggestion(suggestion);
            if (resolved) {
                applyResolved(resolved);
            } else {
                setNotice("Could not resolve that suggestion. Try another result.");
            }
        } catch (err) {
            console.error("[LocationPicker] Suggestion lookup failed:", err);
            setNotice("Could not resolve that suggestion. Try another result.");
        } finally {
            setResolving(false);
        }
    };

    /* -- Point picking: map click, marker drag, or a GPS fix ---------------- */
    const pickCoordinates = useCallback(
        async (latitude: number, longitude: number) => {
            const seq = ++reverseSeqRef.current;
            setResolving(true);
            setNotice("");

            // Move the pin immediately so it always shows the point being picked,
            // never the previously selected one.
            placeMarkerRef.current(latitude, longitude, true);
            lastCenterRef.current = { lat: latitude, lng: longitude };

            const resolved = await reverseGeocodeNominatim(latitude, longitude).catch((err) => {
                console.error("[LocationPicker] Reverse geocoding failed:", err);
                return null;
            });
            if (seq !== reverseSeqRef.current) return;

            if (resolved) {
                applyResolved(resolved);
            } else {
                const next: LocationPickerValue = {
                    ...locationRef.current,
                    address: "",
                    latitude,
                    longitude,
                };
                setLocation(next);
                onLocationChange(next);
                setNotice("No address found at this point. Drag the pin slightly or type the address.");
            }
            setResolving(false);
        },
        [applyResolved, onLocationChange]
    );
    pickRef.current = pickCoordinates;

    /* -- FLOW 2: Auto Detect -> GPS -> reverse geocode -> open the map ------ */
    const handleAutoDetect = async () => {
        setDetecting(true);
        setNotice("");
        try {
            const { latitude, longitude } = await getBrowserCoordinates();
            desiredCenterRef.current = { lat: latitude, lng: longitude };
            // Open the map first so the pin is visible while the address resolves.
            setIsMapOpen(true);
            await pickCoordinates(latitude, longitude);
        } catch (err: any) {
            console.error("[LocationPicker] Auto detect failed:", err);
            setNotice(err?.message || "Could not detect your location.");
        } finally {
            setDetecting(false);
        }
    };

    /* -- FLOW 1: "Select Location on Map" -> geocode address -> open the map - */
    const handleOpenMap = async () => {
        setOpening(true);
        setNotice("");
        const typed = buildAddress(location);

        if (typed) {
            const resolved = await geocodeAddressNominatim(typed).catch((err) => {
                console.error("[LocationPicker] Forward geocoding failed:", err);
                return null;
            });
            if (resolved) {
                // Keep exactly what the user typed; only adopt the coordinates.
                const merged: LocationPickerValue = {
                    ...resolved,
                    area: location.area || resolved.area,
                    city: location.city || resolved.city,
                    state: location.state || resolved.state,
                    pincode: location.pincode || resolved.pincode,
                    address: typed,
                };
                setLocation(merged);
                resolvedTextRef.current = typed;
                fieldsTouchedRef.current = false;
                lastCenterRef.current = { lat: resolved.latitude, lng: resolved.longitude };
                desiredCenterRef.current = { lat: resolved.latitude, lng: resolved.longitude };
                onLocationChange(merged);
            } else {
                setNotice(`Couldn't find "${typed}". Drop a pin on the map to set the exact spot.`);
                desiredCenterRef.current =
                    lastCenterRef.current ??
                    (isValidCoordinates(location.latitude, location.longitude)
                        ? { lat: location.latitude, lng: location.longitude }
                        : DEFAULT_CENTER);
            }
        } else {
            desiredCenterRef.current =
                lastCenterRef.current ??
                (isValidCoordinates(location.latitude, location.longitude)
                    ? { lat: location.latitude, lng: location.longitude }
                    : DEFAULT_CENTER);
        }

        setOpening(false);
        setIsMapOpen(true);
    };

    const closeMap = () => setIsMapOpen(false);

    /* -- Confirm ------------------------------------------------------------- */
    const handleConfirm = () => {
        if (!isValidCoordinates(location.latitude, location.longitude)) {
            setNotice("Select a point on the map, pick a suggestion, or use Auto Detect first.");
            return;
        }
        const address = location.address || buildAddress(location);
        const confirmedLocation: LocationPickerValue = { ...location, address };
        setLocation(confirmedLocation);
        setConfirmed(true);
        setNotice("");
        saveLocationToStorage(confirmedLocation);
        onLocationChange(confirmedLocation);
        onConfirm?.(confirmedLocation);
        setIsMapOpen(false);
    };

    /* -- Manual edits to the structured fields ------------------------------- */
    const handleFieldChange = (field: LocationField, text: string) => {
        const next: LocationPickerValue = { ...location, [field]: text };
        setLocation(next);
        fieldsTouchedRef.current = true;
        setConfirmed(false);
        setNotice("");
        // The address no longer matches the pin, so the coordinates are no
        // longer valid for it.
        clearMarker();
        onLocationChange({ ...next, address: "", latitude: 0, longitude: 0 });
    };

    // Re-geocode after the user stops editing the structured fields. Only the
    // coordinates are adopted - the typed text is left exactly as entered.
    useEffect(() => {
        if (!fieldsTouchedRef.current) return;
        const address = buildAddress(location);
        if (!address) return;
        setResolving(true);
        const timer = setTimeout(async () => {
            const resolved = await geocodeAddressNominatim(address).catch(() => null);
            if (resolved) {
                const next = { ...location, latitude: resolved.latitude, longitude: resolved.longitude };
                setLocation(next);
                onLocationChange(next);
                if (isValidCoordinates(next.latitude, next.longitude)) {
                    lastCenterRef.current = { lat: next.latitude, lng: next.longitude };
                    placeMarkerRef.current(next.latitude, next.longitude, true);
                }
                setQuery(address);
                resolvedTextRef.current = address;
                setNotice("");
            } else {
                setNotice(`No coordinates found for "${address}". Adjust the address or drop a pin on the map.`);
            }
            setResolving(false);
        }, 900);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.area, location.city, location.state, location.pincode]);

    /* -- Modal chrome: escape to close, no background scroll ---------------- */
    useEffect(() => {
        if (!isMapOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeMap();
        };
        document.addEventListener("keydown", onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isMapOpen]);

    const retryMap = () => {
        setMapError("");
        setMapStatus("loading");
        setMapLoadToken((n) => n + 1);
    };

    const hasPoint = isValidCoordinates(location.latitude, location.longitude);
    const displayAddress = location.address || buildAddress(location);
    const fieldClass = `${inputClassName} w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#00598a] bg-white`;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
                {!readOnly && (
                    <button
                        type="button"
                        onClick={handleAutoDetect}
                        disabled={detecting}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{ backgroundColor: BRAND }}
                    >
                        {detecting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Detecting...
                            </>
                        ) : (
                            <>
                                <MapPin className="w-4 h-4" /> {autoDetectLabel}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* -- Read-only address summary -------------------------------- */}
            {readOnly && displayAddress && (
                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 break-words">
                    {displayAddress}
                </p>
            )}

            {/* -- Structured fields ---------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {FIELD_LABELS.area} *
                    </label>
                    <input
                        type="text"
                        value={location.area}
                        onChange={(e) => handleFieldChange("area", e.target.value)}
                        placeholder={FIELD_PLACEHOLDERS.area}
                        readOnly={readOnly}
                        className={readOnly ? `${fieldClass} bg-gray-50 text-gray-600` : fieldClass}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {FIELD_LABELS.city} *
                    </label>
                    <input
                        type="text"
                        value={location.city}
                        onChange={(e) => handleFieldChange("city", e.target.value)}
                        placeholder={FIELD_PLACEHOLDERS.city}
                        readOnly={readOnly}
                        className={readOnly ? `${fieldClass} bg-gray-50 text-gray-600` : fieldClass}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {FIELD_LABELS.state} *
                    </label>
                    <input
                        type="text"
                        value={location.state}
                        onChange={(e) => handleFieldChange("state", e.target.value)}
                        placeholder={FIELD_PLACEHOLDERS.state}
                        readOnly={readOnly}
                        className={readOnly ? `${fieldClass} bg-gray-50 text-gray-600` : fieldClass}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {FIELD_LABELS.pincode}
                    </label>
                    <input
                        type="text"
                        value={location.pincode}
                        onChange={(e) => handleFieldChange("pincode", e.target.value)}
                        placeholder={FIELD_PLACEHOLDERS.pincode}
                        readOnly={readOnly}
                        className={readOnly ? `${fieldClass} bg-gray-50 text-gray-600` : fieldClass}
                    />
                </div>
            </div>

            {/* -- Open the map picker -------------------------------------- */}
            {!readOnly && (
                <button
                    type="button"
                    onClick={handleOpenMap}
                    disabled={opening}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: BRAND }}
                >
                    {opening ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Finding your address on the map...
                        </>
                    ) : (
                        <>
                            <MapPin className="w-5 h-5" /> Select Location on Map
                        </>
                    )}
                </button>
            )}

            {/* -- Coordinates / confirmation ------------------------------- */}
            {hasPoint ? (
                <div
                    className={`rounded-xl p-3 border ${
                        confirmed ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                    }`}
                >
                    <p className={`text-sm ${confirmed ? "text-green-800" : "text-blue-800"}`}>
                        <span className="font-semibold inline-flex items-center gap-1.5">
                            {confirmed ? (
                                <>
                                    <Check className="w-4 h-4" /> Location set
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-4 h-4" /> Location picked (not confirmed yet)
                                </>
                            )}
                        </span>
                        {displayAddress && (
                            <span className="block mt-1 font-medium break-words">{displayAddress}</span>
                        )}
                        <span className="block mt-1 font-mono text-xs">
                            Latitude: {formatCoord(location.latitude)} · Longitude:{" "}
                            {formatCoord(location.longitude)}
                        </span>
                    </p>
                </div>
            ) : (
                <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-800 flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>
                            <span className="font-medium">Tip:</span> Use Auto Detect, or press
                            &quot;Select Location on Map&quot; to pick the exact spot.
                        </span>
                    </p>
                </div>
            )}

            {notice && (
                <div className="rounded-xl p-3 bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="break-words">{notice}</span>
                    </p>
                </div>
            )}

            {error && (
                <div className="rounded-xl p-3 bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="break-words">{error}</span>
                    </p>
                </div>
            )}

            {/* --------------------------------------------------------------
                Map modal - Swiggy-style address picker
                -------------------------------------------------------------- */}
            {isMapOpen && (
                <div
                    className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Select Location"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={closeMap}
                        aria-hidden="true"
                    />

                    <div className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] bg-white flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                Select Location
                            </h3>
                            <button
                                type="button"
                                onClick={closeMap}
                                aria-label="Close"
                                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                            >
                                <span className="text-xl leading-none">×</span>
                            </button>
                        </div>

                        {/* Map / error */}
                        <div
                            className={`relative w-full ${mapHeightClass} shrink-0 bg-gray-100`}
                            title={
                                provider === "google"
                                    ? "Google Maps"
                                    : provider === "leaflet"
                                      ? "OpenStreetMap"
                                      : "Loading map"
                            }
                        >
                            {/* The container is ALWAYS laid out and sized, even
                                while the tiles are still loading. Leaflet caches the
                                element's viewport at construction time, so hiding
                                this with `display:none` and then showing it later
                                would leave a blank map. The loading and error
                                states are absolute overlays on top instead. */}
                            <div ref={mapDivRef} className="absolute inset-0 w-full h-full" />

                            {mapStatus === "loading" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 px-6 text-center">
                                    <Loader2 className="w-7 h-7 animate-spin text-gray-500" />
                                    <p className="text-sm font-medium text-gray-700">Loading map...</p>
                                    <p className="text-xs text-gray-500">
                                        Map tiles load from OpenStreetMap.
                                    </p>
                                </div>
                            )}

                            {mapStatus === "error" && (
                                <div className="absolute inset-0 overflow-y-auto flex flex-col items-center justify-center gap-3 bg-amber-50 px-5 py-4 text-center">
                                    <AlertTriangle className="w-8 h-8 shrink-0 text-amber-600" />
                                    <p className="text-sm font-semibold text-amber-900">
                                        Unable to load the map.
                                    </p>
                                    {mapError && (
                                        <p className="text-xs text-amber-800 break-words max-w-md leading-relaxed">
                                            {mapError}
                                        </p>
                                    )}
                                    <p className="text-xs text-amber-800 max-w-md leading-relaxed">
                                        Map tiles are loaded from OpenStreetMap over the network. Check
                                        your connection and try again - you can also type your address
                                        above instead.
                                    </p>

                                    <div className="flex flex-wrap items-center justify-center gap-2 mt-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={retryMap}
                                            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                                            style={{ backgroundColor: BRAND }}
                                        >
                                            Try again
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeMap}
                                            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 border border-gray-300"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Search inside the map, like a delivery app */}
                            {mapStatus === "ready" && !readOnly && (
                                <div className="absolute top-3 left-3 right-3 z-10">
                                    <div className="relative" ref={inputWrapRef}>
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => handleQueryChange(e.target.value)}
                                            onFocus={() => suggestions.length && setSuggestionsOpen(true)}
                                            placeholder="Search for a location, area or address"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#00598a] bg-white shadow-md"
                                            autoComplete="off"
                                        />
                                        {resolving && (
                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                                        )}
                                        {suggestionsOpen && suggestions.length > 0 && (
                                            <ul className="absolute z-20 mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                                                {suggestions.map((suggestion) => (
                                                    <li key={suggestion.placeId}>
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => handleSelectSuggestion(suggestion)}
                                                            className="w-full text-left px-4 py-3 hover:bg-[#f0f7fb] transition flex flex-col"
                                                        >
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {suggestion.title}
                                                            </span>
                                                            {suggestion.subtitle && (
                                                                <span className="text-xs text-gray-500">
                                                                    {suggestion.subtitle}
                                                                </span>
                                                            )}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected location summary */}
                        <div className="px-5 py-4 border-t border-gray-100 overflow-y-auto">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Selected Location
                            </p>
                            {hasPoint ? (
                                <>
                                    <p className="mt-1 text-sm font-medium text-gray-900 break-words">
                                        {displayAddress || "Selected point"}
                                    </p>
                                    <p className="mt-1 text-xs font-mono text-gray-500">
                                        {formatCoord(location.latitude)}, {formatCoord(location.longitude)}
                                    </p>
                                </>
                            ) : (
                                <p className="mt-1 text-sm text-gray-500">
                                    No location selected yet. Click the map or drag the pin to choose
                                    a point.
                                </p>
                            )}
                            {notice && (
                                <p className="mt-2 text-xs text-red-600 break-words flex items-start gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span>{notice}</span>
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        {!readOnly && (
                            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={!hasPoint}
                                    className="w-full px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: BRAND }}
                                >
                                    {confirmLabel.toUpperCase()}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
