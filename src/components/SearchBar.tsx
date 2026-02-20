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
    placeholder = "Search for plumbers, electricians, carpenters, cleaning services...",
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
                <div className="relative flex items-center bg-gray-50 rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-200">
                    {/* Search Icon */}
                    <div className="pl-5 pr-3">
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
                        className={`flex-1 py-4 ${typography.search.input} text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none`}
                        disabled={isSearching}
                    />

                    {/* Clear Button */}
                    {searchText && !isListening && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={buttonStyles.search.clear}
                        >
                            <TimesIcon className={typography.icon.sm} />
                        </button>
                    )}

                    {/* Voice Search Button */}
                    <button
                        type="button"
                        onClick={onVoiceSearch}
                        disabled={isSearching}
                        className={isListening ? buttonStyles.search.voice.listening : buttonStyles.search.voice.default}
                        title={isListening ? "Listening..." : "Voice Search"}
                    >
                        <MicrophoneIcon className={typography.icon.base} />
                    </button>

                    {/* Search Button */}
                    <button
                        type="submit"
                        disabled={!searchText.trim() || isSearching}
                        className={buttonStyles.search.submit}
                    >
                        {isSearching ? "Searching..." : "Search"}
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
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-96 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3 group"
                            >
                                <SearchIcon className={`${typography.icon.xs} text-gray-400 group-hover:text-blue-600 transition-colors`} />
                                <div className="flex-1">
                                    <p className={`${typography.fontSize.sm} font-medium text-gray-800 group-hover:text-blue-700`}>
                                        {suggestion.text}
                                    </p>
                                    {suggestion.category && (
                                        <p className={`${typography.fontSize.xs} text-gray-500`}>
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
                <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
                    <div className="flex gap-1">
                        <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-75"></span>
                        <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-150"></span>
                    </div>
                    <p className={`${typography.fontSize.sm} font-medium text-red-700`}>
                        Listening... Speak now
                    </p>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
