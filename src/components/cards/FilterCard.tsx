import React, { useState } from "react";
import { Filter, X, MapPin, DollarSign, Briefcase } from "lucide-react";

interface FiltersProps {
    sortBy: string;
    setSortBy: (value: string) => void;
    filterBy: string;
    setFilterBy: (value: string) => void;
    workerCount: number;
    onNewJobPost?: () => void;
    onApplyFilters?: (filters: {
        latitude?: number;
        longitude?: number;
        range?: number;
        maxPrice?: number;
        minExperience?: number;
    }) => void;
    onClearFilters?: () => void;
}

const Filters: React.FC<FiltersProps> = ({
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    workerCount,
    onNewJobPost,
    onApplyFilters,
    onClearFilters
}) => {
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Filter states
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [range, setRange] = useState("10");
    const [maxPrice, setMaxPrice] = useState("");
    const [minExperience, setMinExperience] = useState("");

    const handleApplyFilters = () => {
        if (onApplyFilters) {
            onApplyFilters({
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                range: range ? parseInt(range) : 10,
                maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
                minExperience: minExperience ? parseInt(minExperience) : undefined
            });
        }
        setShowFilterModal(false);
    };

    const handleClearAllFilters = () => {
        setLatitude("");
        setLongitude("");
        setRange("10");
        setMaxPrice("");
        setMinExperience("");
        if (onClearFilters) {
            onClearFilters();
        }
        setShowFilterModal(false);
    };

    const hasActiveFilters = latitude || longitude || maxPrice || minExperience;

    return (
        <>
            <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                        {workerCount} worker{workerCount !== 1 ? 's' : ''} found
                    </span>
                    <button
                        onClick={() => setShowFilterModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
                    >
                        <Filter size={18} />
                        <span className="text-sm font-medium">Filters</span>
                        {hasActiveFilters && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></span>
                        )}
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="distance">Sort: Distance</option>
                        <option value="price">Sort: Price</option>
                        <option value="rating">Sort: Rating</option>
                    </select>

                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="All">All Experience</option>
                        <option value="1+ years">1+ years</option>
                        <option value="3+ years">3+ years</option>
                        <option value="5+ years">5+ years</option>
                        <option value="10+ years">10+ years</option>
                    </select>
                </div>
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                            <h2 className="text-lg font-semibold">Filter Workers</h2>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-6">
                            {/* Location Filters */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin size={18} className="text-blue-600" />
                                    <h3 className="font-semibold text-gray-800">Location</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            placeholder="e.g., 17.4940"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            placeholder="e.g., 78.4595"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Search Range (km)
                                        </label>
                                        <input
                                            type="number"
                                            value={range}
                                            onChange={(e) => setRange(e.target.value)}
                                            placeholder="10"
                                            min="1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (navigator.geolocation) {
                                                navigator.geolocation.getCurrentPosition(
                                                    (position) => {
                                                        setLatitude(position.coords.latitude.toString());
                                                        setLongitude(position.coords.longitude.toString());
                                                    },
                                                    (error) => {
                                                        alert("Unable to get your location. Please enter manually.");
                                                    }
                                                );
                                            }
                                        }}
                                        className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                    >
                                        Use My Current Location
                                    </button>
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <DollarSign size={18} className="text-green-600" />
                                    <h3 className="font-semibold text-gray-800">Price</h3>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Maximum Price (₹/hour)
                                    </label>
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="e.g., 1000"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Experience Filter */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Briefcase size={18} className="text-purple-600" />
                                    <h3 className="font-semibold text-gray-800">Experience</h3>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Minimum Experience (years)
                                    </label>
                                    <input
                                        type="number"
                                        value={minExperience}
                                        onChange={(e) => setMinExperience(e.target.value)}
                                        placeholder="e.g., 5"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 flex gap-3">
                            <button
                                onClick={handleClearAllFilters}
                                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Filters;
