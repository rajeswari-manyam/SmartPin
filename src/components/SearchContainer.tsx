import React, { useState, useEffect } from "react";
import { useSearchController } from "../hooks/useSearchController";

import LocationSelector from "./LocationSelector";
import VoiceSearchModal from "../modal/VoiceSearchmodal";
import DownloadAppModal from "../modal/DownloadAppModal";

import SearchIcon from "../assets/icons/Search.png";
import VoiceIcon from "../assets/icons/Voice.png";
import MobileIcon from "../assets/icons/mobile.jpeg";

interface SearchContainerProps {
    onLocationChange?: (city: string, lat: number, lng: number) => void;
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

    const handleInputChange = (text: string) => {
        handleSearchChange(text);
        onSearchChange?.(text);
    };

    const handleLocationSave = (city: string, lat: number, lng: number) => {
        handleLocationChange({ city, latitude: lat, longitude: lng, address: city });
        onLocationChange?.(city, lat, lng);
    };

    useEffect(() => {
        if (showDownloadModal || isVoiceModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [showDownloadModal, isVoiceModalOpen]);

    return (
        <>
            <div className="w-full bg-secondary py-3 px-3 md:py-8 md:px-6">
                <div className="max-w-7xl mx-auto">

                    {/* ── Mobile Layout ── */}
                    <div className="flex flex-col gap-2 md:hidden">

                        {/* Row 1: Location + Download App */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <LocationSelector
                                    onSaveLocation={handleLocationSave}
                                    autoDetect={true}
                                />
                            </div>

                            <button
                                className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-3 py-2.5 hover:shadow-md active:scale-95 transition-all"
                                onClick={() => setShowDownloadModal(true)}
                            >
                                <img src={MobileIcon} alt="Download App" className="w-4 h-4" />
                                <span className="text-xs font-semibold whitespace-nowrap text-gray-700">
                                    App
                                </span>
                            </button>
                        </div>

                        {/* Row 2: Search Bar (full width) */}
                        <div className="bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden focus-within:border-primary transition-colors">
                            <div className="flex items-center">
                                {/* Search icon inside input on mobile */}
                                <div className="pl-3">
                                    <img
                                        src={SearchIcon}
                                        alt="Search"
                                        className="w-4 h-4 opacity-40"
                                    />
                                </div>

                                <input
                                    type="text"
                                    value={state.searchText}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Search for services..."
                                    className="flex-1 px-2.5 py-3 outline-none text-gray-700 placeholder-gray-400 text-sm"
                                />

                                {/* Voice Button */}
                                <button
                                    onClick={handleVoiceClick}
                                    className="p-2.5 hover:bg-secondary transition rounded-full"
                                    title="Voice search"
                                >
                                    <img src={VoiceIcon} alt="Voice" className="w-5 h-5" />
                                </button>

                                {/* Search Button */}
                                <button
                                    onClick={onSearchClick}
                                    disabled={state.isSearching}
                                    className="bg-primary hover:brightness-110 active:scale-95 px-4 py-3 transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {state.isSearching ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <img src={SearchIcon} alt="Search" className="w-4 h-4 invert" />
                                            <span className="text-white font-semibold text-xs">
                                                Search
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Desktop Layout ── */}
                    <div className="hidden md:flex flex-row gap-6 items-start">

                        {/* Location Selector */}
                        <div className="w-72 flex-shrink-0">
                            <LocationSelector
                                onSaveLocation={handleLocationSave}
                                autoDetect={true}
                            />
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden focus-within:border-primary transition-colors">
                                <div className="flex items-center">
                                    <div className="pl-5">
                                        <img
                                            src={SearchIcon}
                                            alt="Search"
                                            className="w-5 h-5 opacity-40"
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        value={state.searchText}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                        placeholder="Search for services..."
                                        className="flex-1 px-4 py-4 outline-none text-gray-700 placeholder-gray-400 text-base"
                                    />

                                    {/* Voice Button */}
                                    <button
                                        onClick={handleVoiceClick}
                                        className="p-4 hover:bg-secondary transition rounded-full"
                                        title="Voice search"
                                    >
                                        <img src={VoiceIcon} alt="Voice" className="w-6 h-6" />
                                    </button>

                                    {/* Search Button */}
                                    <button
                                        onClick={onSearchClick}
                                        disabled={state.isSearching}
                                        className="bg-primary hover:brightness-110 px-10 py-4 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {state.isSearching ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span className="text-white font-semibold text-base">
                                                    Searching...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <img src={SearchIcon} alt="Search" className="w-5 h-5 invert" />
                                                <span className="text-white font-semibold text-base">
                                                    Search
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Download App */}
                        <button
                            className="flex-shrink-0 flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-5 py-3.5 hover:shadow-lg transition"
                            onClick={() => setShowDownloadModal(true)}
                        >
                            <img src={MobileIcon} alt="Download App" className="w-5 h-5" />
                            <span className="text-sm font-semibold whitespace-nowrap">Download App</span>
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