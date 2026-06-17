// flow: 
// map moves -> updateBounds(...) -> useNearbyPets(bounds) -> backend fetch

import { useCallback, useState } from "react";
import type { MapBounds } from "../../types/map";

export function useMapBounds() {
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  const updateBounds = useCallback((nextBounds: MapBounds) => {
    setBounds(nextBounds);
  }, []);

  return {
    bounds,
    updateBounds,
  };
}