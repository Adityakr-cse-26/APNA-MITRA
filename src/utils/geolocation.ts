export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export const getCurrentLocation = async (): Promise<LocationData | null> => {
  // Mock location fallback for AI Studio Preview iframe if blocked
  const MOCK_FALLBACK = {
    latitude: 22.7235,
    longitude: 88.4800,
    accuracy: 15,
    timestamp: new Date().toISOString()
  };

  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by this browser.");
    console.warn("Geolocation unsupported. Using mock location.");
    return MOCK_FALLBACK;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("=== GEOLOCATION DIAGNOSTIC (SUCCESS) ===");
        console.log("Raw position object received:", position);
        console.log("Latitude:", position.coords.latitude);
        console.log("Longitude:", position.coords.longitude);
        console.log("Accuracy:", position.coords.accuracy);
        console.log("Timestamp:", position.timestamp, new Date(position.timestamp).toISOString());
        console.log("========================================");
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
        });
      },
      (error) => {
        console.warn("Geolocation fallback triggered:", error.message);
        console.warn("Location Error: " + error.message + ". Please ensure location permissions are granted.");
        console.warn("Browser location blocked or timed out. Using mock Barasat, Kolkata location for testing.");
        resolve(MOCK_FALLBACK);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};
