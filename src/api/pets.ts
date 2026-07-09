import { apiGet } from "./client";
import type { MapBounds } from "../types/map";
import { getMapPetsFetchLimit } from "../types/map";
import type {
  MapMarkerPet,
  MapPetsResponse,
  PetDetail,
  PetReportStatus,
  PetSpecies,
  PetSortOption,
  SidebarPetsResponse,
} from "../types/pets";
import type { SidebarPet } from "../types/pets";

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
  limit = getMapPetsFetchLimit(),
) {
  const safeBounds = normalizeBounds(bounds);

  const params = new URLSearchParams({
    minLat: String(safeBounds.south),
    maxLat: String(safeBounds.north),
    minLng: String(safeBounds.west),
    maxLng: String(safeBounds.east),
    limit: String(limit),
  });

  if (bounds.zoom !== undefined) {
    params.set("zoom", String(bounds.zoom));
  }

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
): Promise<PetDetail> {
  return apiGet<PetDetail>(`/api/pets/${petId}`, signal);
}

function normalizeMapMarkerPet(pet: MapMarkerPet): MapMarkerPet {
  return {
    id: String(pet.id),
    name: typeof pet.name === "string" && pet.name.length > 0 ? pet.name : "Pet",
    species: pet.species,
    reportStatus: pet.reportStatus,
    latitude: Number(pet.latitude),
    longitude: Number(pet.longitude),
    ...(pet.cityName ? { cityName: pet.cityName } : {}),
    ...(pet.stateCode ? { stateCode: pet.stateCode } : {}),
    ...(pet.reportType ? { reportType: pet.reportType } : {}),
  };
}

function normalizeSidebarPet(pet: SidebarPet): SidebarPet {
  return {
    ...pet,
    id: String(pet.id),
    photos: Array.isArray(pet.photos) ? pet.photos : [],
    breedLabel: pet.breedLabel ?? pet.breed ?? "Unknown",
  };
}

export async function fetchMapPets(
  bounds: MapBounds,
  filters: MapPetFilters = {},
  signal?: AbortSignal,
): Promise<MapPetsResponse> {
  const query = buildMapPetsQuery(bounds, filters);
  const url = `/api/pets/map?${query.toString()}`;

  console.log("[map:fetch] request", {
    url,
    bounds,
    filters,
    zoom: bounds.zoom,
  });

  const result = await apiGet<MapPetsResponse>(url, signal);

  const clusterCount = result.clusters?.length ?? 0;
  const clusterSum =
    result.clusters?.reduce((sum, cluster) => sum + cluster.count, 0) ?? 0;

  console.log("[map:fetch] response", {
    total: result.total,
    returned: result.returned,
    pets: result.pets?.length ?? 0,
    clusters: clusterCount,
    clusterSum,
    sampleCluster: result.clusters?.[0] ?? null,
    samplePet: result.pets?.[0] ?? null,
  });

  return {
    pets: (result.pets ?? []).map(normalizeMapMarkerPet),
    clusters: result.clusters ?? [],
    total: result.total,
    returned: result.returned ?? result.pets?.length ?? 0,
  };
}

export async function fetchSidebarPets(
  bounds: MapBounds,
  filters: MapPetFilters = {},
  options: SidebarPetsOptions = {},
  signal?: AbortSignal,
): Promise<SidebarPetsResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 40;

  const query = buildMapPetsQuery(bounds, filters, limit);

  query.set("page", String(page));
  query.set("limit", String(limit));

  const result = await apiGet<SidebarPetsResponse>(
    `/api/pets/sidebar?${query.toString()}`,
    signal,
  );

  return {
    ...result,
    pets: result.pets.map(normalizeSidebarPet),
    total: result.total,
    page: result.page ?? page,
    limit: result.limit ?? limit,
  };
}

export async function fetchRecentPets(signal?: AbortSignal) {
  return apiGet<{
    pets: SidebarPet[];
    total: number;
  }>("/api/pets?sort=createdAt&order=desc&page=1&limit=6", signal);
}
