import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type {
  CreatePetSightingBody,
  PetSighting,
  BulletinSighting,
  UpdateSightingVerificationBody,
} from "../types/sightings";

export type {
  CreatePetSightingBody,
  PetSighting,
  BulletinSighting,
  UpdateSightingVerificationBody,
};

export async function fetchRecentSightings(signal?: AbortSignal) {
  return apiGet<{ sightings: BulletinSighting[]; total: number }>(
    "/api/sightings/recent",
    signal,
  );
}

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

export async function updateSightingVerification(
  sightingId: string,
  body: UpdateSightingVerificationBody,
) {
  return apiPatch<
    {
      id: string;
      petId: string;
      verificationStatus: string;
      verifiedAt: string | null;
    },
    UpdateSightingVerificationBody
  >(`/api/sightings/${sightingId}`, body);
}

export async function deleteSighting(sightingId: string) {
  return apiDelete<{ id: string }>(`/api/sightings/${sightingId}`);
}
