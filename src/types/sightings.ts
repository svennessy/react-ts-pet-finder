import type { SidebarPet } from "./pets";

export type BulletinSighting = PetSighting & {
  pet: SidebarPet;
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
