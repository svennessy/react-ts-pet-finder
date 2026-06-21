import type { MapPet } from "./pets";

export type BulletinSighting = PetSighting & {
  pet: MapPet;
};

export type PetSighting = {
  id: string;
  petId: string;
  latitude: number;
  longitude: number;
  locationLabel: string | null;
  notes: string | null;
  photoUrl: string | null;
  createdAt: string;
};

export type CreatePetSightingBody = {
  latitude: number;
  longitude: number;
  notes?: string;
  photoUrl?: string;
};