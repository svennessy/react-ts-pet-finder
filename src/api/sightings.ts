import { apiGet, apiPost } from "./client";
import type { CreatePetSightingBody, PetSighting } from "../types/sightings";

export type { CreatePetSightingBody, PetSighting };

export async function fetchPetSightings(petId: string, signal?: AbortSignal) {
  return apiGet<{ sightings: PetSighting[] }>(
    `/api/pets/${petId}/sightings`,
    signal,
  );
}

export async function createPetSighting(
  petId: string,
  body: CreatePetSightingBody,
) {
  return apiPost<{ id: string }, CreatePetSightingBody>(
    `/api/pets/${petId}/sightings`,
    body,
  );
}
