import { useState } from "react";
import { createPetSighting } from "../../api/sightings";
import type { PetDetail } from "../../types/pets";

type SubmitSightingValues = {
  latitude: number;
  longitude: number;
  notes: string;
};

export function useSightingsActions(selectedPet: PetDetail | null) {
  const [sightingOpen, setSightingOpen] = useState(false);
  const [savingSighting, setSavingSighting] = useState(false);

  async function handleSubmitSighting(values: SubmitSightingValues) {
    if (!selectedPet) return;

    setSavingSighting(true);

    try {
      await createPetSighting(selectedPet.id, {
        latitude: values.latitude,
        longitude: values.longitude,
        notes: values.notes,
      });

      setSightingOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save sighting.");
    } finally {
      setSavingSighting(false);
    }
  }

  return {
    sightingOpen,
    setSightingOpen,
    savingSighting,
    handleSubmitSighting,
  };
}