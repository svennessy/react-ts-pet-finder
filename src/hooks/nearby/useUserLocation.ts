import { useCallback, useEffect, useState } from "react";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = useCallback(() => {
    return new Promise<UserLocation | null>((resolve) => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser.");
        setLoading(false);
        resolve(null);
        return;
      }

      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setLocation(nextLocation);
          setError(null);
          setLoading(false);
          resolve(nextLocation);
        },
        () => {
          setError("Unable to get your location.");
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10_000,
        },
      );
    });
  }, []);

  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  return {
    location,
    error,
    loading,
    requestLocation,
  };
}