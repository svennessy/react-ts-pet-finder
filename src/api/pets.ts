import { apiGet } from "./client";
import type { MapBounds } from "../types/map";
import type {
  MapPet,
  MapPetsResponse,
  PetReportStatus,
  PetSpecies,
  PetSortOption,
} from "../types/pets";

export type MapPetFilters = {
  species?: PetSpecies | "all";
  reportStatus?: PetReportStatus | "all";
  search?: string;
  sort?: PetSortOption;
};

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

export function buildMapPetsQuery(
  bounds: MapBounds,
  filters: MapPetFilters = {},
  limit = 250,
) {
  const safeBounds = normalizeBounds(bounds);

  const params = new URLSearchParams({
    minLat: String(safeBounds.south),
    maxLat: String(safeBounds.north),
    minLng: String(safeBounds.west),
    maxLng: String(safeBounds.east),
    limit: String(limit),
  });

  if (filters.species && filters.species !== "all") {
    params.set("species", filters.species);
  }

  if (filters.reportStatus && filters.reportStatus !== "all") {
    params.set("reportStatus", filters.reportStatus);
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.sort === "newest") {
    params.set("sort", "createdAt");
    params.set("order", "desc");
  }

  if (filters.sort === "oldest") {
    params.set("sort", "createdAt");
    params.set("order", "asc");
  }

  if (filters.sort === "name") {
    params.set("sort", "name");
    params.set("order", "asc");
  }

  return params.toString();
}

export async function fetchPetById(
  petId: string,
  signal?: AbortSignal,
): Promise<MapPet> {
  return apiGet<MapPet>(`/api/pets/${petId}`, signal);
}

export async function fetchMapPets(
  bounds: MapBounds,
  filters: MapPetFilters = {},
  signal?: AbortSignal,
): Promise<MapPetsResponse> {
  const query = buildMapPetsQuery(bounds, filters);

  return apiGet<MapPetsResponse>(`/api/pets/map?${query}`, signal);
}
