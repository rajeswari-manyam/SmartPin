// Search Service - Business Logic Layer
import { Location, SearchQuery, SearchSuggestion, VoiceRecognitionResult } from "../types/search.types";

class SearchService {
  private static instance: SearchService;

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // Get user's current location
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // In production, you would call a reverse geocoding API here
          const location: Location = {
  city: "Hyderabad",
  state: "Telangana",
  latitude: latitude,
  longitude: longitude,
};

            resolve(location);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error("Unable to retrieve your location"));
        }
      );
    });
  }

  // Get search suggestions
  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query || query.length < 2) return [];

    // Simulate API call - In production, call your backend API
    return new Promise((resolve) => {
      setTimeout(() => {
        const suggestions: SearchSuggestion[] = [
          { id: "1", text: `${query} plumber`, category: "Plumbing" },
          { id: "2", text: `${query} electrician`, category: "Electrical" },
          { id: "3", text: `${query} carpenter`, category: "Carpentry" },
          { id: "4", text: `${query} cleaning service`, category: "Cleaning" },
          { id: "5", text: `${query} pest control`, category: "Pest Control" },
        ];
        resolve(suggestions);
      }, 300);
    });
  }

  // Perform search
  async performSearch(query: string, location: Location): Promise<any> {
    // In production, call your backend API
    console.log("Searching for:", query, "in", location);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          results: [],
          query,
          location,
        });
      }, 500);
    });
  }

  // Save recent search to localStorage
  saveRecentSearch(searchQuery: SearchQuery): void {
    try {
      const recentSearches = this.getRecentSearches();
      const updatedSearches = [searchQuery, ...recentSearches.slice(0, 9)]; // Keep last 10
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  }

  // Get recent searches from localStorage
  getRecentSearches(): SearchQuery[] {
    try {
      const stored = localStorage.getItem("recentSearches");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading recent searches:", error);
      return [];
    }
  }

  // Clear recent searches
  clearRecentSearches(): void {
    try {
      localStorage.removeItem("recentSearches");
    } catch (error) {
      console.error("Error clearing recent searches:", error);
    }
  }
}

export default SearchService;
