import { useCallback, useEffect, useState } from "react";
import { fetchMapPets, type MapPetFilters } from "../../../api/pets";
import type { MapBounds, MapPet } from "../../../api/types";

type UseNearbyPetsResult = {
  pets: MapPet[];
  total: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

export function useNearbyPets(
  bounds: MapBounds | null,
  filters: MapPetFilters = {},
): UseNearbyPetsResult {
  const [pets, setPets] = useState<MapPet[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!bounds) return;

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
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(err instanceof Error ? err.message : "Failed to load pets");
        setPets([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPets();

    return () => {
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