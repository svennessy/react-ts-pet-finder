export type PetSpecies = "dog" | "cat" | "other";
export type PetReportStatus = "lost" | "found";

export type MapPet = {
  id: string;
  name: string;
  species: PetSpecies;
  reportType: PetReportStatus;
  reportStatus: PetReportStatus;
  breed: string;
  breedLabel: string;
  color: string;
  description: string;
  latitude: number;
  longitude: number;
};

export type MapPetsResponse = {
  pets: MapPet[];
  total: number;
};

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};