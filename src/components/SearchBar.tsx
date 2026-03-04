import React, { useRef, useEffect } from "react";
import { FaSearch, FaMicrophone, FaTimes } from "react-icons/fa";
import { SearchSuggestion } from "../types/search.types";
import typography from "../styles/typography";
import buttonStyles from "../styles/ButtonStyle";

const SearchIcon = FaSearch as any;
const MicrophoneIcon = FaMicrophone as any;
const TimesIcon = FaTimes as any;

interface SearchBarProps {
    searchText: string;
    isListening: boolean;
    isSearching: boolean;
    suggestions: SearchSuggestion[];
    onSearchChange: (text: string) => void;
    onSearch: (query?: string) => void;
    onVoiceSearch: () => void;
    onClearSearch: () => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    searchText,
    isListening,
    isSearching,
    suggestions,
    onSearchChange,
    onSearch,
    onVoiceSearch,
    onClearSearch,
    placeholder = "Search services...",
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    useEffect(() => {
        if (isListening && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isListening]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchText.trim()) {
            onSearch();
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        onSearchChange(suggestion.text);
        onSearch(suggestion.text);
        setShowSuggestions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
        setShowSuggestions(true);
    };

    const handleClear = () => {
        onClearSearch();
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full">
            <form onSubmit={handleSubmit} className="relative">
                {/* Search Input Container */}
                <div className="relative flex items-center bg-gray-50 rounded-xl md:rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-200">

                    {/* Search Icon — hidden on mobile to save space */}
                    <div className="hidden sm:flex pl-4 md:pl-5 pr-2 md:pr-3">
                        <SearchIcon className={`${typography.icon.base} text-gray-400`} />
                    </div>

                    {/* Input Field */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchText}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={placeholder}
                        className={`flex-1 pl-3 sm:pl-0 pr-1 py-3 md:py-4 ${typography.search?.input ?? "text-sm"} text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none`}
                        disabled={isSearching}
                    />

                    {/* Clear Button */}
                    {searchText && !isListening && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={`${buttonStyles.search?.clear ?? ""} p-2 text-gray-400 hover:text-gray-600 active:scale-95 transition-all`}
                            aria-label="Clear search"
                        >
                            <TimesIcon className={typography.icon?.sm ?? "w-3 h-3"} />
                        </button>
                    )}

                    {/* Voice Search Button */}
                    <button
                        type="button"
                        onClick={onVoiceSearch}
                        disabled={isSearching}
                        className={`${isListening
                            ? buttonStyles.search?.voice?.listening ?? "bg-red-100 text-red-600"
                            : buttonStyles.search?.voice?.default ?? "text-gray-500 hover:text-blue-600"
                            } p-2 md:p-3 rounded-full transition-all active:scale-95`}
                        title={isListening ? "Listening..." : "Voice Search"}
                        aria-label={isListening ? "Listening" : "Voice Search"}
                    >
                        <MicrophoneIcon className={`${typography.icon?.base ?? "w-4 h-4"} ${isListening ? "animate-pulse" : ""}`} />
                    </button>

                    {/* Search Button */}
                    <button
                        type="submit"
                        disabled={!searchText.trim() || isSearching}
                        className={`${buttonStyles.search?.submit ?? "bg-blue-600 text-white"} 
                            px-3 md:px-6 py-3 md:py-4 rounded-r-xl md:rounded-r-2xl
                            flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed
                            active:scale-95 transition-all text-sm md:text-base font-semibold`}
                    >
                        {isSearching ? (
                            <>
                                {/* Spinner on mobile instead of text */}
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin sm:hidden" />
                                <span className="hidden sm:inline">Searching...</span>
                            </>
                        ) : (
                            <>
                                <SearchIcon className="sm:hidden w-4 h-4" />
                                <span className="hidden sm:inline">Search</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSuggestions(false)}
                    />

                    {/* Suggestions List */}
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-72 md:max-h-96 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 md:px-5 py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition-colors duration-150 flex items-center gap-3 group border-b border-gray-50 last:border-0"
                            >
                                <SearchIcon className={`${typography.icon?.xs ?? "w-3 h-3"} text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-colors`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`${typography.fontSize?.sm ?? "text-sm"} font-medium text-gray-800 group-hover:text-blue-700 truncate`}>
                                        {suggestion.text}
                                    </p>
                                    {suggestion.category && (
                                        <p className={`${typography.fontSize?.xs ?? "text-xs"} text-gray-500 truncate`}>
                                            {suggestion.category}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Voice Recognition Status */}
            {isListening && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 z-50">
                    <div className="flex gap-1 flex-shrink-0">
                        <span className="w-1 h-3.5 md:h-4 bg-red-500 rounded-full animate-pulse" />
                        <span className="w-1 h-3.5 md:h-4 bg-red-500 rounded-full animate-pulse delay-75" />
                        <span className="w-1 h-3.5 md:h-4 bg-red-500 rounded-full animate-pulse delay-150" />
                    </div>
                    <p className={`${typography.fontSize?.sm ?? "text-sm"} font-medium text-red-700`}>
                        Listening... Speak now
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;