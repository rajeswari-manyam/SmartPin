import { useState, useCallback } from "react";
import VoiceService from "../services/voiceService";

// Assuming Location type from your existing code
interface Location {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface SearchState {
  searchText: string;
  location: Location;
  isSearching: boolean;
  isListening: boolean;
}

export const useSearchController = () => {
  const [state, setState] = useState<SearchState>({
    searchText: "",
    location: {},
    isSearching: false,
    isListening: false,
  });

  const voiceService = VoiceService.getInstance();

  const handleSearchChange = useCallback((text: string) => {
    setState((prev) => ({ ...prev, searchText: text }));
  }, []);

  const handleSearch = useCallback(() => {
    if (!state.searchText.trim()) return;

    setState((prev) => ({ ...prev, isSearching: true }));

    // Simulate search API call
    setTimeout(() => {
      console.log("Searching for:", state.searchText);
      setState((prev) => ({ ...prev, isSearching: false }));
    }, 1500);
  }, [state.searchText]);

  const startVoiceRecognition = useCallback(() => {
    if (!voiceService.isSpeechRecognitionSupported()) {
      alert("Voice recognition is not supported in your browser");
      return;
    }

    setState((prev) => ({ ...prev, isListening: true }));

    voiceService.startListening(
      (result) => {
        // Update search text with interim and final results
        setState((prev) => ({
          ...prev,
          searchText: result.transcript,
        }));

        // If it's a final result, you can trigger search automatically
        if (result.isFinal) {
          setState((prev) => ({ ...prev, isListening: false }));
          // Optionally trigger search automatically
          // handleSearch();
        }
      },
      (error) => {
        console.error("Voice recognition error:", error);
        setState((prev) => ({ ...prev, isListening: false }));
        alert(error);
      }
    );
  }, [voiceService]);

  const stopVoiceRecognition = useCallback(() => {
    voiceService.stopListening();
    setState((prev) => ({ ...prev, isListening: false }));
  }, [voiceService]);

  const getCurrentLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setState((prev) => ({
            ...prev,
            location: {
              latitude,
              longitude,
              address: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
            },
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  }, []);

  const handleLocationChange = useCallback((location: Location) => {
    setState((prev) => ({ ...prev, location }));
  }, []);

  return {
    state,
    handleSearchChange,
    handleSearch,
    startVoiceRecognition,
    stopVoiceRecognition,
    getCurrentLocation,
    handleLocationChange,
  };
};
