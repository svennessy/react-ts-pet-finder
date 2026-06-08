import type { PetReportStatus, PetSpecies } from "../../api/types";

export type PostPetDraft = {
  reportStatus: PetReportStatus;
  species: PetSpecies;
  name: string;
  breedLabel: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  photos: File[];
};
