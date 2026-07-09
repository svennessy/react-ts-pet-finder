import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSidebarPets, type MapPetFilters } from "../../api/pets";
import {
  getMapFetchDebounceMs,
  isFetchableMapBounds,
  type MapBounds,
} from "../../types/map";
import type { SidebarPet } from "../../types/pets";
import { hasCachedUserLocation } from "./useUserLocation";

type UseSidebarPetsResult = {
  sidebarPets: SidebarPet[];
  sidebarTotal: number;
  sidebarLoading: boolean;
  sidebarError: string | null;
  sidebarPage: number;
  sidebarLimit: number;
  setSidebarPage: (page: number) => void;
  nextSidebarPage: () => void;
  previousSidebarPage: () => void;
  reloadSidebar: () => void;
};

const SIDEBAR_LIMIT = 40;

function shouldSkipColdStartWideFetch(bounds: MapBounds, hasLoaded: boolean) {
  return (
    !isFetchableMapBounds(bounds) &&
    !hasLoaded &&
    !hasCachedUserLocation()
  );
}

export function useSidebarPets(
  bounds: MapBounds | null,
  filters: MapPetFilters = {},
): UseSidebarPetsResult {
  const [sidebarPets, setSidebarPets] = useState<SidebarPet[]>([]);
  const [sidebarTotal, setSidebarTotal] = useState(0);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [sidebarError, setSidebarError] = useState<string | null>(null);
  const [sidebarPage, setSidebarPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const hasLoadedSidebarRef = useRef(false);

  const reloadSidebar = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const nextSidebarPage = useCallback(() => {
    setSidebarPage((page) => page + 1);
  }, []);

  const previousSidebarPage = useCallback(() => {
    setSidebarPage((page) => Math.max(1, page - 1));
  }, []);

  useEffect(() => {
    setSidebarPage(1);
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
  ]);

  useEffect(() => {
    if (!bounds) {
      setSidebarPets([]);
      setSidebarTotal(0);
      hasLoadedSidebarRef.current = false;
      return;
    }

    if (shouldSkipColdStartWideFetch(bounds, hasLoadedSidebarRef.current)) {
      return;
    }

    const currentBounds = bounds;
    const currentFilters = filters;
    const currentPage = sidebarPage;
    const controller = new AbortController();

    async function loadSidebarPets() {
      setSidebarLoading(true);
      setSidebarError(null);

      const maxAttempts = 4;
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const result = await fetchSidebarPets(
            currentBounds,
            currentFilters,
            {
              page: currentPage,
              limit: SIDEBAR_LIMIT,
            },
            controller.signal,
          );

          setSidebarPets(result.pets);
          setSidebarTotal(result.total);
          hasLoadedSidebarRef.current = true;
          lastError = null;
          break;
        } catch (err) {
          if (controller.signal.aborted) return;

          lastError = err;
          const message =
            err instanceof Error ? err.message.toLowerCase() : "";
          const canRetry =
            attempt < maxAttempts &&
            (message.includes("failed to fetch") ||
              message.includes("network") ||
              message.includes("fetch failed") ||
              message.includes("request failed with status 5"));

          if (!canRetry) break;

          await new Promise<void>((resolve, reject) => {
            const timeoutId = window.setTimeout(resolve, 600 * attempt);
            controller.signal.addEventListener(
              "abort",
              () => {
                window.clearTimeout(timeoutId);
                reject(new DOMException("Aborted", "AbortError"));
              },
              { once: true },
            );
          }).catch(() => undefined);

          if (controller.signal.aborted) return;
        }
      }

      if (lastError && !controller.signal.aborted) {
        setSidebarError(
          lastError instanceof Error
            ? lastError.message
            : "Failed to load sidebar pets",
        );
      }

      if (!controller.signal.aborted) {
        setSidebarLoading(false);
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadSidebarPets();
    }, Math.max(getMapFetchDebounceMs(bounds), 500));

    return () => {
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
    sidebarPage,
    reloadKey,
  ]);

  return {
    sidebarPets,
    sidebarTotal,
    sidebarLoading,
    sidebarError,
    sidebarPage,
    sidebarLimit: SIDEBAR_LIMIT,
    setSidebarPage,
    nextSidebarPage,
    previousSidebarPage,
    reloadSidebar,
  };
}
