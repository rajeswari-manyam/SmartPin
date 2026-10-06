export type SelectedLocation = {
    /**
     * Complete, duplicate-free address, e.g.
     * "Srinagar Katta, Tadigadapa, Vijayawada, Andhra Pradesh, 521137"
     */
    address: string;
    /**
     * Most specific area/locality returned by the geocoder, e.g.
     * "Srinagar Katta, Tadigadapa". Never reduced to a bare city.
     */
    area: string;
    /**
     * Individual components of `area`, most specific first. Useful when a
     * caller needs the single most specific component on its own.
     */
    areaParts?: string[];
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
};

/**
 * Value emitted by `LocationPicker`. Identical to `SelectedLocation` minus the
 * optional `areaParts`, so the picker, `LocationSelector` and every form share
 * one location shape.
 *
 * `latitude` / `longitude` are `0` when no point is currently selected. A
 * coordinate pair is therefore never left behind when the address changes.
 */
export type LocationPickerValue = {
    /** Complete, duplicate-free address. */
    address: string;
    /** Most specific area/locality, e.g. "Srinagar Katta, Tadigadapa". */
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
};
