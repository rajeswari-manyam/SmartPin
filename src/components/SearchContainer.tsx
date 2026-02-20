import React, { useState } from "react";
import { useSearchController } from "../hooks/useSearchController";

import LocationSelector from "./LocationSelector";
import VoiceSearchModal from "../modal/VoiceSearchmodal";
import DownloadAppModal from "../modal/DownloadAppModal";

import SearchIcon from "../assets/icons/Search.png";
import VoiceIcon from "../assets/icons/Voice.png";
import MobileIcon from "../assets/icons/mobile.jpeg";

interface SearchContainerProps {
    onLocationChange?: (city: string, lat: number, lng: number) => void;
    // ── New prop: fires every time the user types in the search box ──
    onSearchChange?: (text: string) => void;
}

const SearchContainer: React.FC<SearchContainerProps> = ({
    onLocationChange,
    onSearchChange,
}) => {
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    const {
        state,
        handleSearchChange,
        handleSearch,
        startVoiceRecognition,
        stopVoiceRecognition,
        handleLocationChange,
    } = useSearchController();

    const handleVoiceClick = () => {
        setIsVoiceModalOpen(true);
        startVoiceRecognition();
    };

    const handleVoiceModalClose = () => {
        setIsVoiceModalOpen(false);
        stopVoiceRecognition();
    };

    const onSearchClick = () => {
        handleSearch();
    };

    // ── Fires on every keystroke — updates internal hook + notifies parent ──
    const handleInputChange = (text: string) => {
        handleSearchChange(text);      // update internal search controller
        onSearchChange?.(text);        // bubble up to HomePage → AllJobs
    };

    const handleLocationSave = (city: string, lat: number, lng: number) => {
        handleLocationChange({ city, latitude: lat, longitude: lng, address: city });
        onLocationChange?.(city, lat, lng);
    };

    return (
        <>
            <div className="w-full bg-secondary py-4 md:py-8 px-3 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-3 md:gap-6 items-stretch lg:items-start">

                        {/* Location Selector */}
                        <div className="w-full lg:w-72 flex-shrink-0">
                            <LocationSelector
                                onSaveLocation={handleLocationSave}
                                autoDetect={true}
                            />
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 space-y-3 md:space-y-4">
                            <div className="bg-white rounded-xl md:rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden focus-within:border-primary transition-colors">
                                <div className="flex items-center">
                                    <div className="hidden sm:block pl-3 md:pl-5">
                                        <img
                                            src={SearchIcon}
                                            alt="Search"
                                            className="w-4 md:w-5 h-4 md:h-5 opacity-40"
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        value={state.searchText}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                        placeholder="Search for services..."
                                        className="flex-1 px-3 md:px-4 py-3 md:py-4 outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
                                    />

                                    {/* Voice Button */}
                                    <button
                                        onClick={handleVoiceClick}
                                        className="p-2 md:p-4 hover:bg-secondary transition rounded-full"
                                        title="Voice search"
                                    >
                                        <img src={VoiceIcon} alt="Voice" className="w-5 md:w-6 h-5 md:h-6" />
                                    </button>

                                    {/* Search Button */}
                                    <button
                                        onClick={onSearchClick}
                                        disabled={state.isSearching}
                                        className="bg-primary hover:brightness-110 px-4 md:px-10 py-3 md:py-4 transition-all duration-300 flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {state.isSearching ? (
                                            <>
                                                <div className="w-4 md:w-5 h-4 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span className="text-white font-semibold text-xs md:text-base hidden sm:inline">
                                                    Searching...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <img src={SearchIcon} alt="Search" className="w-4 md:w-5 h-4 md:h-5 invert" />
                                                <span className="text-white font-semibold text-xs md:text-base hidden sm:inline">
                                                    Search
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Download App — Desktop */}
                        <button
                            className="hidden md:flex flex-shrink-0 items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 lg:px-5 py-3 lg:py-3.5 hover:shadow-lg transition"
                            onClick={() => setShowDownloadModal(true)}
                        >
                            <img src={MobileIcon} alt="Download App" className="w-5 h-5" />
                            <span className="text-sm font-semibold whitespace-nowrap">Download App</span>
                        </button>
                    </div>

                    {/* Download App — Mobile */}
                    <div className="md:hidden mt-3">
                        <button
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3 hover:shadow-lg transition"
                            onClick={() => setShowDownloadModal(true)}
                        >
                            <img src={MobileIcon} alt="Download App" className="w-5 h-5" />
                            <span className="text-sm font-semibold">Download App</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Voice Search Modal */}
            <VoiceSearchModal
                isOpen={isVoiceModalOpen}
                isListening={state.isListening}
                transcript={state.searchText}
                onClose={handleVoiceModalClose}
            />

            {/* Download App Modal */}
            <DownloadAppModal
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
            />
        </>
    );
};

export default SearchContainer;
