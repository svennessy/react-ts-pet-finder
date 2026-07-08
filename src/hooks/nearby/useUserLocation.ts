import { useCallback, useEffect, useState } from "react";
import type { UserLocation } from "../../types/map";

const LAST_LOCATION_KEY = "pet-finder:last-user-location";

export function hasCachedUserLocation() {
  try {
    return Boolean(sessionStorage.getItem(LAST_LOCATION_KEY));
  } catch {
    return false;
  }
}

type LocationRequestOptions = {
  highAccuracy?: boolean;
};

function readCachedLocation(): UserLocation | null {
  try {
    const raw = sessionStorage.getItem(LAST_LOCATION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<UserLocation>;
    if (
      typeof parsed.latitude === "number" &&
      Number.isFinite(parsed.latitude) &&
      typeof parsed.longitude === "number" &&
      Number.isFinite(parsed.longitude)
    ) {
      return {
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      };
    }
  } catch {
    // Ignore invalid cache entries.
  }

  return null;
}

function writeCachedLocation(location: UserLocation) {
  try {
    sessionStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
  } catch {
    // Ignore storage failures.
  }
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(() =>
    readCachedLocation(),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => !readCachedLocation());

  const requestLocation = useCallback((options: LocationRequestOptions = {}) => {
    const highAccuracy = options.highAccuracy ?? false;

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

          writeCachedLocation(nextLocation);
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
          enableHighAccuracy: highAccuracy,
          maximumAge: highAccuracy ? 0 : 5 * 60 * 1000,
          timeout: highAccuracy ? 10_000 : 5_000,
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
