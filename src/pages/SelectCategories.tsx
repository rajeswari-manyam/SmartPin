import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaMicrophone } from 'react-icons/fa';
import { categories } from '../components/categories/Categories';
import SearchBar from '../components/SearchBar';
import Header from '../components/common/Header';
import TitleSection from '../components/common/TitleSelection';
import CategoriesGrid from '../components/categories/CategoriesGrid';
import NoResults from '../components/categories/NoResult';
import Button from '../components/ui/Buttons';
import FooterNote from '../components/common/FooterNote';
import { fontSize } from '../styles/typography';
import VoiceService from '../services/voiceService';
import { VoiceRecognitionResult } from '../types/search.types';
import VoiceIcon from '../assets/icons/Voice.png';
import { useNavigate } from "react-router-dom";

const MicIcon = ({ className }: { className?: string }) => (
    <img src={VoiceIcon} alt="Voice Search" className={`object-contain ${className}`} />
);

const SelectCategoriesScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [voiceService] = useState(() => VoiceService.getInstance());
    const [isVoiceSupported, setIsVoiceSupported] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setIsVoiceSupported(voiceService.isSpeechRecognitionSupported());
    }, [voiceService]);

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleVoiceResult = (result: VoiceRecognitionResult) => {
        setTranscript(result.transcript);

        // Update search query in real-time for immediate filtering
        const spokenText = result.transcript.toLowerCase().trim();

        // Don't update search query - keep categories visible
        // Instead, we'll match and select categories directly

        if (result.isFinal) {
            // Split spoken text into individual words
            const spokenWords = spokenText.split(/\s+/).filter((word: string) => word.length > 2);

            // Find all matching categories
            const matchedCategories = categories.filter(category => {
                const categoryName = category.name.toLowerCase();
                const categoryWords = categoryName.split(/[\s&]+/); // Split by space and &

                // Check if any spoken word matches any part of category name
                return spokenWords.some((spokenWord: string) =>
                    categoryWords.some(categoryWord =>
                        categoryWord.includes(spokenWord) ||
                        spokenWord.includes(categoryWord) ||
                        categoryName.includes(spokenWord)
                    )
                );
            });

            if (matchedCategories.length > 0) {
                // Select all matched categories
                const newSelections = matchedCategories.map(cat => cat.id);
                setSelectedCategories(prev => {
                    const combined = Array.from(new Set([...prev, ...newSelections]));
                    return combined;
                });

                // Show success feedback
                console.log('Matched categories:', matchedCategories.map(c => c.name));
            } else {
                // No matches found - try updating search query to show filtered results
                setSearchQuery(spokenText);
            }

            // Stop listening after final result
            setTimeout(() => {
                setIsListening(false);
                voiceService.stopListening();
                setTranscript('');
            }, 500);
        }
    };

    const handleVoiceError = (errorMessage: string) => {
        setVoiceError(errorMessage);
        setIsListening(false);
        setTranscript('');
        setTimeout(() => setVoiceError(null), 3000);
    };

    const handleVoiceSearch = () => {
        if (!isVoiceSupported) {
            setVoiceError("Voice recognition is not supported in your browser");
            setTimeout(() => setVoiceError(null), 3000);
            return;
        }

        if (isListening) {
            voiceService.stopListening();
            setIsListening(false);
            setTranscript('');
        } else {
            setIsListening(true);
            setTranscript('');
            setVoiceError(null);
            setSearchQuery(''); // Clear search query when starting voice
            voiceService.startListening(handleVoiceResult, handleVoiceError);
        }
    };

    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
    };

    const handleContinue = () => {
        if (selectedCategories.length > 0) {
            console.log("Selected categories:", selectedCategories);

            navigate("/worker-profile", {
                state: {
                    selectedCategories,
                },
            });
        }
    };

    const handleBack = () => {
        console.log('Going back');
    };

    const handleSkip = () => {
        console.log('Skipping category selection');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header onBack={handleBack} onSkip={handleSkip} />

            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:py-12">
                <TitleSection
                    title="Choose Your Service Categories"
                    subtitle="Select the categories you're interested in to personalize your experience"
                />

                {/* Custom Search Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search Input */}
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full px-6 py-4 text-xl text-gray-700 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all duration-300 shadow-sm"
                        />
                        {transcript && isListening && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                <p className="text-sm text-blue-600">
                                    Listening: <span className="font-semibold">{transcript}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Voice Search Button */}
                    <button
                        onClick={handleVoiceSearch}
                        disabled={!isVoiceSupported}
                        className={`flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00598a] to-[#00598a] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px] hover:scale-105 ${isListening ? 'animate-pulse ring-4 ring-red-300' : ''
                            } ${!isVoiceSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isListening ? (
                            <span className="text-white font-bold">Listening...</span>
                        ) : (
                            <>
                                <MicIcon className="w-8 h-8 text-white" />
                                <span className="text-xl font-semibold">Voice Search</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Voice Error Message */}
                {voiceError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{voiceError}</p>
                    </div>
                )}

                {/* Voice Instructions */}
                {isListening && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                            🎤 <strong>Speak clearly:</strong> Say category names like "plumbing", "electrical",
                            "cleaning", or "gardening" to search and select them automatically.
                        </p>
                    </div>
                )}

                {selectedCategories.length > 0 && (
                    <div className="mt-4 text-center">
                        <p className={`${fontSize.sm} text-gray-600`}>
                            {selectedCategories.length}{' '}
                            {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                        </p>
                    </div>
                )}

                {filteredCategories.length > 0 ? (
                    <CategoriesGrid
                        categories={filteredCategories}
                        selectedCategories={selectedCategories}
                        onToggle={handleCategoryToggle}
                    />
                ) : (
                    <NoResults searchQuery={searchQuery} />
                )}

                <div className="flex justify-center mt-8">
                    <Button
                        onClick={handleContinue}
                        disabled={selectedCategories.length === 0}
                        size="xl"
                        className="px-8 sm:px-12 md:px-16 rounded-full shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Continue →
                    </Button>
                </div>

                <FooterNote />
            </div>
        </div>
    );
};

export default SelectCategoriesScreen;
