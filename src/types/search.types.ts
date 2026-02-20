export interface Location {
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
    fullAddress?: string;
}

export interface SearchQuery {
  query: string;
  location: Location;
  timestamp: Date;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  icon?: string;
}

export interface SearchState {
  searchText: string;
  location: Location;
  isListening: boolean;
  isSearching: boolean;
  suggestions: SearchSuggestion[];
  recentSearches: SearchQuery[];
  error: string | null;
}

export type SearchAction =
  | { type: "SET_SEARCH_TEXT"; payload: string }
  | { type: "SET_LOCATION"; payload: Location }
  | { type: "SET_LISTENING"; payload: boolean }
  | { type: "SET_SEARCHING"; payload: boolean }
  | { type: "SET_SUGGESTIONS"; payload: SearchSuggestion[] }
  | { type: "ADD_RECENT_SEARCH"; payload: SearchQuery }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_SEARCH" };
