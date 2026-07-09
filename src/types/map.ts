export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom?: number;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
};

/** Allow full-US view (continental overview). */
export const MAP_MIN_ZOOM = 4;

export function getBoundsSpan(bounds: MapBounds) {
  return {
    lat: bounds.north - bounds.south,
    lng: bounds.east - bounds.west,
  };
}

export function getBoundsArea(bounds: MapBounds) {
  const span = getBoundsSpan(bounds);
  return span.lat * span.lng;
}

// Skip only the automatic cold-start fetch before geolocation centers the map.
export function isFetchableMapBounds(bounds: MapBounds) {
  const span = getBoundsSpan(bounds);
  return span.lat <= 5 && span.lng <= 7;
}

export function getMapPetsFetchLimit() {
  return 8000;
}

export function getMapFetchDebounceMs(bounds: MapBounds) {
  const zoom = bounds.zoom ?? 10;
  const area = getBoundsArea(bounds);

  if (zoom < 6 || area > 30) return 650;
  if (zoom < 8 || area > 10) return 450;
  return 300;
}
