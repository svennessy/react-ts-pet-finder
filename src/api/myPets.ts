import { apiGet } from "./client";
import type { PetDetail } from "../types/pets";
import type { PetSighting } from "../types/sightings";

export type MyPet = PetDetail & {
  sightingsCount: number;
  sightings: PetSighting[];
};

export type MyPetsResponse = {
  pets: MyPet[];
  total: number;
};

export function fetchMyPets(signal?: AbortSignal) {
  return apiGet<MyPetsResponse>("/api/profiles/me/pets", signal);
}
