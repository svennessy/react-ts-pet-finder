import { useMemo, useRef, useState } from "react";
import type { MapPet } from "../../types/pets";
import { usePetDetails } from "./usePetDetails";

export function useNearbySelection(mapPets: MapPet[]) {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const selectedMapPet = useMemo(
    () => mapPets.find((pet) => pet.id === selectedPetId) ?? null,
    [mapPets, selectedPetId],
  );

  const { pet: selectedPet, loading: selectedPetLoading } =
    usePetDetails(selectedPetId);

  const drawerPet =
    selectedPet && selectedPet.id === selectedPetId && !selectedPetLoading
      ? {
          ...selectedPet,
          photos: (selectedPet.photos ?? []).filter(
            (photo) =>
              !("petId" in photo) ||
              String(photo.petId) === String(selectedPet.id),
          ),
        }
      : null;

  return {
    selectedPetId,
    setSelectedPetId,
    selectedMapPet,
    selectedPet,
    selectedPetLoading,
    drawerPet,
    sidebarRef,
  };
}