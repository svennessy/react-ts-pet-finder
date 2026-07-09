import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMapPets, type MapPetFilters } from "../../api/pets";
import {
  getMapFetchDebounceMs,
  type MapBounds,
} from "../../types/map";
import type { MapCluster, MapMarkerPet } from "../../types/pets";

const MAX_FETCH_ATTEMPTS = 6;
const RETRY_BASE_MS = 800;

type UseNearbyPetsResult = {
  pets: MapMarkerPet[];
  clusters: MapCluster[];
  total: number;
  returned: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

function isRetryableFetchError(err: unknown) {
  if (!(err instanceof Error)) return false;
  if (err.name === "AbortError") return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("econnrefused") ||
    message.includes("fetch failed") ||
    message.includes("request failed with status 5")
  );
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    function onAbort() {
      window.clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    }

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function useNearbyPets(
  bounds: MapBounds | null,
  filters: MapPetFilters = {},
): UseNearbyPetsResult {
  const [pets, setPets] = useState<MapMarkerPet[]>([]);
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const [total, setTotal] = useState(0);
  const [returned, setReturned] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const hasLoadedPetsRef = useRef(false);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!bounds) {
      console.log("[map:hook] no bounds yet — skipping fetch");
      setPets([]);
      setClusters([]);
      setTotal(0);
      setReturned(0);
      hasLoadedPetsRef.current = false;
      return;
    }

    const debounceMs = getMapFetchDebounceMs(bounds);
    console.log("[map:hook] scheduling fetch", {
      bounds,
      debounceMs,
      filters,
      reloadKey,
    });

    const currentBounds = bounds;
    const currentFilters = filters;
    const controller = new AbortController();

    async function loadPets() {
      setLoading(true);
      setError(null);
      console.log("[map:hook] fetch start");

      let lastError: unknown = null;

      for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
        try {
          const result = await fetchMapPets(
            currentBounds,
            currentFilters,
            controller.signal,
          );

          const nextClusters = result.clusters ?? [];
          console.log("[map:hook] fetch ok — setting state", {
            pets: result.pets.length,
            clusters: nextClusters.length,
            total: result.total,
            returned: result.returned,
            attempt,
          });

          setPets(result.pets);
          setClusters(nextClusters);
          setTotal(result.total);
          setReturned(
            result.returned ??
              nextClusters.reduce((sum, cluster) => sum + cluster.count, 0) ??
              result.pets.length,
          );
          hasLoadedPetsRef.current = true;
          lastError = null;
          break;
        } catch (err) {
          if (controller.signal.aborted) {
            console.log("[map:hook] fetch aborted");
            return;
          }

          lastError = err;
          const canRetry =
            attempt < MAX_FETCH_ATTEMPTS && isRetryableFetchError(err);

          console.error("[map:hook] fetch error", { attempt, canRetry, err });

          if (!canRetry) break;

          await sleep(RETRY_BASE_MS * attempt, controller.signal);
        }
      }

      if (lastError && !controller.signal.aborted) {
        const message =
          lastError instanceof Error ? lastError.message : "Failed to load pets";
        setError(message);
      }

      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadPets();
    }, debounceMs);

    return () => {
      console.log("[map:hook] cleanup — aborting in-flight fetch");
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    bounds?.north,
    bounds?.south,
    bounds?.east,
    bounds?.west,
    bounds?.zoom,
    filters.species,
    filters.reportStatus,
    filters.search,
    filters.sort,
    reloadKey,
  ]);

  return {
    pets,
    clusters,
    total,
    returned,
    loading,
    error,
    reload,
  };
}
