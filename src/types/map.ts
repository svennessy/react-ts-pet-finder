export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
};

export function getBoundsSpan(bounds: MapBounds) {
  return {
    lat: bounds.north - bounds.south,
    lng: bounds.east - bounds.west,
  };
}

// Continental-scale viewports (e.g. the US fallback at zoom 4).
// Used only to skip the automatic cold-start fetch before geolocation centers the map.
export function isFetchableMapBounds(bounds: MapBounds) {
  const span = getBoundsSpan(bounds);
  return span.lat <= 5 && span.lng <= 7;
}