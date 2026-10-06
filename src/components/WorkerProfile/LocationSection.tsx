import React from "react";
import LocationPicker, { EMPTY_LOCATION } from "../LocationPicker";
import type { LocationPickerValue } from "../../types/location.types";

interface LocationSectionProps {
    /** Controlled value, identical to the shared picker's value. */
    value?: Partial<LocationPickerValue> | null;
    /** Fired on every change, including when the coordinates are cleared. */
    onLocationChange: (location: LocationPickerValue) => void;
    /** Fired only when the user confirms the point on the map. */
    onConfirm?: (location: LocationPickerValue) => void;
    title?: string;
    error?: string;
    /** Seed from the location saved by `LocationSelector` on first mount. */
    useSavedLocation?: boolean;
}

/**
 * Worker-profile wrapper around the shared Swiggy-style picker.
 *
 * This used to be a standalone address form with its own "Use Current Location"
 * button and no map. It now delegates entirely to `LocationPicker` so the worker
 * flow gets search, auto-detect, map click/drag and the same detailed-area
 * parsing as the customer flow - with no duplicated geocoding logic.
 */
const LocationSection: React.FC<LocationSectionProps> = ({
    value = EMPTY_LOCATION,
    onLocationChange,
    onConfirm,
    title = "Location Details",
    error,
    useSavedLocation = true,
}) => (
    <LocationPicker
        value={value}
        onLocationChange={onLocationChange}
        onConfirm={onConfirm}
        title={title}
        error={error}
        useSavedLocation={useSavedLocation}
    />
);

export default LocationSection;
