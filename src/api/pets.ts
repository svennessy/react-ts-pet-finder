import { apiGet } from "./client";
import type { MapBounds, MapPetsResponse } from "./types";

function clampLatitude(value: number) {
  return Math.max(-85.051129, Math.min(85.051129, value));
}

function normalizeLongitude(value: number) {
  let lng = value;

  while (lng < -180) lng += 360;
  while (lng > 180) lng -= 360;

  return lng;
}

function normalizeBounds(bounds: MapBounds): MapBounds {
  return {
    north: clampLatitude(bounds.north),
    south: clampLatitude(bounds.south),
    east: normalizeLongitude(bounds.east),
    west: normalizeLongitude(bounds.west),
  };
}

export function buildMapPetsQuery(bounds: MapBounds, limit = 250) {
  const safeBounds = normalizeBounds(bounds);

  const params = new URLSearchParams({
    minLat: String(safeBounds.south),
    maxLat: String(safeBounds.north),
    minLng: String(safeBounds.west),
    maxLng: String(safeBounds.east),
    limit: String(limit),
  });

  return params.toString();
}

export async function fetchMapPets(
  bounds: MapBounds,
  signal?: AbortSignal,
): Promise<MapPetsResponse> {
  const query = buildMapPetsQuery(bounds);

  return apiGet<MapPetsResponse>(`/api/pets/map?${query}`, signal);
}