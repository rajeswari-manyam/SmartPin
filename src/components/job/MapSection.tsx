import React from "react";
import LocationIcon from "../../assets/icons/Location.png";

interface MapSectionProps {
    mapUrl?: string;
    onMapClick?: () => void;
}

const MapSection: React.FC<MapSectionProps> = ({ mapUrl, onMapClick }) => {
    return (
        <div
            onClick={onMapClick}
            className="h-80 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer bg-slate-100 hover:bg-slate-50 transition-colors"
        >
            <img 
                src={LocationIcon} 
                alt="Location" 
                className="w-16 h-16 opacity-80 mb-2" 
            />
            <span className="text-slate-500 font-medium">
                View Customer Location
            </span>
        </div>
    );
};

export default MapSection;
