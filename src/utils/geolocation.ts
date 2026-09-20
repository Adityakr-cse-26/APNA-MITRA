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
    console.info("Geolocation is not supported by this browser. Using standard testing location.");
    return MOCK_FALLBACK;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString(),
        });
      },
      (error) => {
        console.info("Geolocation fallback triggered (" + error.message + "). Using standard testing location.");
        resolve(MOCK_FALLBACK);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};
