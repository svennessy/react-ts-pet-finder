import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMapPets, type MapPetFilters } from "../../api/pets";
import { isFetchableMapBounds, type MapBounds } from "../../types/map";
import type { MapMarkerPet } from "../../types/pets";
import { hasCachedUserLocation } from "./useUserLocation";

type UseNearbyPetsResult = {
  pets: MapMarkerPet[];
  total: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

function shouldSkipColdStartWideFetch(bounds: MapBounds, hasLoaded: boolean) {
  return (
    !isFetchableMapBounds(bounds) &&
    !hasLoaded &&
    !hasCachedUserLocation()
  );
}

export function useNearbyPets(
  bounds: MapBounds | null,
  filters: MapPetFilters = {},
): UseNearbyPetsResult {
  const [pets, setPets] = useState<MapMarkerPet[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const hasLoadedPetsRef = useRef(false);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!bounds) {
      setPets([]);
      setTotal(0);
      hasLoadedPetsRef.current = false;
      return;
    }

    if (shouldSkipColdStartWideFetch(bounds, hasLoadedPetsRef.current)) {
      return;
    }

    const currentBounds = bounds;
    const currentFilters = filters;
    const controller = new AbortController();

    async function loadPets() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchMapPets(
          currentBounds,
          currentFilters,
          controller.signal,
        );

        setPets(result.pets);
        setTotal(result.total);
        hasLoadedPetsRef.current = true;
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(err instanceof Error ? err.message : "Failed to load pets");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadPets();
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    bounds?.north,
    bounds?.south,
    bounds?.east,
    bounds?.west,
    filters.species,
    filters.reportStatus,
    filters.search,
    filters.sort,
    reloadKey,
  ]);

  return {
    pets,
    total,
    loading,
    error,
    reload,
  };
}
