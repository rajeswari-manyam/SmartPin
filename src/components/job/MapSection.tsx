import React from "react";
import LocationPicker from "../LocationPicker";
import type { LocationPickerValue } from "../../types/location.types";

interface MapSectionProps {
    /** The stored point to show. */
    value?: Partial<LocationPickerValue> | null;
    /** Fired on every change, including when the coordinates are cleared. */
    onLocationChange: (location: LocationPickerValue) => void;
    /** Fired only when the user confirms the point on the map. */
    onConfirm?: (location: LocationPickerValue) => void;
    title?: string;
    error?: string;
    /**
     * `false` renders the map and marker read-only for "where is this service?"
     * views - no search, no auto-detect and no confirm button, because the point
     * is fixed.
     */
    editable?: boolean;
    mapHeightClass?: string;
    useSavedLocation?: boolean;
}

/**
 * Job-flow map section.
 *
 * This used to be a dashed placeholder box with an unused `mapUrl` prop that
 * never rendered a map. It now renders the real `LocationPicker`, so a job form
 * or job detail view shows the same live Google map, marker and address that the
 * customer actually submitted. Set `editable={false}` to display it read-only.
 */
const MapSection: React.FC<MapSectionProps> = ({
    value,
    onLocationChange,
    onConfirm,
    title = "Service Location",
    error,
    editable = true,
    mapHeightClass = "h-80",
    useSavedLocation = true,
}) => (
    <LocationPicker
        value={value}
        onLocationChange={onLocationChange}
        onConfirm={onConfirm}
        title={title}
        error={error}
        readOnly={!editable}
        mapHeightClass={mapHeightClass}
        useSavedLocation={useSavedLocation}
    />
);

export default MapSection;
