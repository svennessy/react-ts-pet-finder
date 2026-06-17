import type { PetReportStatus, PetSpecies } from "./pets";

export type ExistingPhoto = {
  id: number;
  imageUrl: string;
};

export type PostPetDraft = {
  reportStatus: PetReportStatus;
  species: PetSpecies;
  name: string;
  breedLabel: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  photos: File[];
  existingPhotos?: ExistingPhoto[];
};
