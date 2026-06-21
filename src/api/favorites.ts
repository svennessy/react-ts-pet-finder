import { apiDelete, apiGet, apiPost } from "./client";
import type { MapPet } from "../types/pets";

export type FavoritePet = MapPet & {
  favoriteId: string;
};

export type FavoritesResponse = {
  pets: FavoritePet[];
  total: number;
};

export async function fetchFavorites(signal?: AbortSignal) {
  return apiGet<FavoritesResponse>("/api/favorites", signal);
}

export async function saveFavorite(petId: string) {
  return apiPost<{ id: string; petId: string }, Record<string, never>>(
    `/api/favorites/${petId}`,
    {},
  );
}

export async function removeFavorite(petId: string) {
  return apiDelete<{ petId: string }>(`/api/favorites/${petId}`);
}