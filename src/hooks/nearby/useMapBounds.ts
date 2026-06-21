import { useCallback, useRef, useState } from "react";
import type { MapBounds } from "../../types/map";

function isValidBounds(bounds: MapBounds) {
  return (
    Number.isFinite(bounds.north) &&
    Number.isFinite(bounds.south) &&
    Number.isFinite(bounds.east) &&
    Number.isFinite(bounds.west) &&
    bounds.north > bounds.south &&
    bounds.east > bounds.west
  );
}

function boundsKey(bounds: MapBounds) {
  return [
    bounds.north.toFixed(2),
    bounds.south.toFixed(2),
    bounds.east.toFixed(2),
    bounds.west.toFixed(2),
  ].join("|");
}

export function useMapBounds() {
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const lastBoundsKeyRef = useRef("");

  const updateBounds = useCallback((nextBounds: MapBounds) => {
    if (!isValidBounds(nextBounds)) return;

    const key = boundsKey(nextBounds);
    if (key === lastBoundsKeyRef.current) return;

    lastBoundsKeyRef.current = key;
    setBounds(nextBounds);
  }, []);

  return {
    bounds,
    updateBounds,
  };
}