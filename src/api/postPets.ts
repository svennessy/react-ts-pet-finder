import { apiPost, apiDelete, apiPatch } from "./client";
import type { PetReportStatus, PetSpecies } from "./types";

export type CreatePetReportBody = {
  reportStatus: PetReportStatus;
  species: PetSpecies;
  name: string;
  breedLabel: string;
  description: string;
  latitude: number;
  longitude: number;
  photoUrls?: string[];
};

export type CreatePetReportResponse = {
  id: string;
};

export type UpdatePetReportBody = Partial<CreatePetReportBody>;

export async function createPetReport(body: CreatePetReportBody) {
  return apiPost<CreatePetReportResponse, CreatePetReportBody>(
    "/api/pets",
    body,
  );
}

export async function deletePetReport(petId: string) {
  return apiDelete<{ id: string }>(`/api/pets/${petId}`);
}

export async function updatePetReport(
  petId: string,
  body: UpdatePetReportBody,
) {
  return apiPatch<{ id: string }, UpdatePetReportBody>(
    `/api/pets/${petId}`,
    body,
  );
}