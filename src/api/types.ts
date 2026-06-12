export type PetSpecies = "dog" | "cat" | "other";

export type PetReportStatus = "lost" | "found" | "resolved";

export type PetPhoto = {
  id: number;
  petId: number;
  imagePath: string;
  imageUrl?: string;
  resolvedUrl?: string;
  sortOrder: number;
};

export type MapPet = {
  id: string;
  name: string;
  description: string;
  species: PetSpecies;
  reportType: PetReportStatus;
  reportStatus: PetReportStatus;
  breed: string;
  breedLabel: string;
  color: string;
  latitude: number;
  longitude: number;
  cityName?: string | null;
  stateCode?: string | null;
  locationLabel?: string | null;
  photos?: PetPhoto[];
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    city: {
      name: string;
      stateCode: string;
      stateName: string;
    };
  };
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
