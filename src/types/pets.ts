export type PetSpecies = "dog" | "cat" | "other";

export type PetReportStatus = "lost" | "found" | "resolved";

export type PetSortOption = "newest" | "oldest" | "name";

export type PetPhoto = {
  id: number;
  petId: number;
  imagePath: string;
  imageUrl?: string;
  resolvedUrl?: string;
  sortOrder: number;
  stanfordInstanceKey?: string | null;
  createdAt?: string;
};

export type PetOwner = {
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

export type MapMarkerPet = {
  id: string;
  name: string;
  species: PetSpecies;
  reportType?: PetReportStatus;
  reportStatus: PetReportStatus;
  latitude: number;
  longitude: number;
  cityName?: string | null;
  stateCode?: string | null;
};

export type SidebarPet = {
  id: string;
  name: string;
  description?: string;
  species: PetSpecies;
  reportType?: PetReportStatus;
  reportStatus: PetReportStatus;
  breed?: string;
  breedLabel: string;
  color?: string;
  latitude: number;
  longitude: number;
  cityName?: string | null;
  stateCode?: string | null;
  locationLabel?: string | null;
  createdAt: string;
  photos: PetPhoto[];
};

export type PetDetail = SidebarPet & {
  owner?: PetOwner;
};

export type MapCluster = {
  id: string;
  count: number;
  latitude: number;
  longitude: number;
  reportStatus: PetReportStatus;
  samplePetId: string;
};

export type MapPetsResponse = {
  pets: MapMarkerPet[];
  clusters?: MapCluster[];
  total: number;
  returned?: number;
};

export type SidebarPetsResponse = {
  pets: SidebarPet[];
  total: number;
  page?: number;
  limit?: number;
};

export type PetDetailResponse = PetDetail;
