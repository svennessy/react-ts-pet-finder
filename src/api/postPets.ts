import { apiPost, apiDelete } from "./client";
import type { PetReportStatus, PetSpecies } from "./types";

export type CreatePetReportBody = {
  reportStatus: PetReportStatus;
  species: PetSpecies;
  name: string;
  breedLabel: string;
  description: string;
  latitude: number;
  longitude: number;
};

export type CreatePetReportResponse = {
  id: string;
};

export async function createPetReport(body: CreatePetReportBody) {
  return apiPost<CreatePetReportResponse, CreatePetReportBody>(
    "/api/pets",
    body,
  );
}

export async function deletePetReport(petId: string) {
  return apiDelete<{ id: string }>(`/api/pets/${petId}`);
}
