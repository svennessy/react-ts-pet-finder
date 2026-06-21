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

type SidebarPetsOptions = {
  page?: number;
  limit?: number;
};

function clampLatitude(value: number) {
  return Math.max(-85.051129, Math.min(85.051129, value));
}

function clampLongitude(value: number) {
  return Math.max(-125, Math.min(-66, value));
}

function normalizeBounds(bounds: MapBounds): MapBounds {
  const north = Math.min(50, Math.max(24, clampLatitude(bounds.north)));
  const south = Math.min(50, Math.max(24, clampLatitude(bounds.south)));
  const east = clampLongitude(bounds.east);
  const west = clampLongitude(bounds.west);

  return {
    north: Math.max(north, south),
    south: Math.min(north, south),
    east: Math.max(east, west),
    west: Math.min(east, west),
  };
}

export function buildMapPetsQuery(
  bounds: MapBounds,
  filters: MapPetFilters = {},
  limit = 5000,
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

  return params;
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
  const query = buildMapPetsQuery(bounds, filters, 5000);

  return apiGet<MapPetsResponse>(`/api/pets/map?${query.toString()}`, signal);
}

export async function fetchSidebarPets(
  bounds: MapBounds,
  filters: MapPetFilters = {},
  options: SidebarPetsOptions = {},
  signal?: AbortSignal,
): Promise<MapPetsResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 40;

  const query = buildMapPetsQuery(bounds, filters, limit);

  query.set("page", String(page));
  query.set("limit", String(limit));

  return apiGet<MapPetsResponse>(
    `/api/pets/sidebar?${query.toString()}`,
    signal,
  );
}

export async function fetchRecentPets(signal?: AbortSignal) {
  return apiGet<{
    pets: MapPet[];
    total: number;
  }>("/api/pets?sort=createdAt&order=desc&page=1&limit=6", signal);
}