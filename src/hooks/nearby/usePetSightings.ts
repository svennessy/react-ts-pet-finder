import { useEffect, useState } from "react";
import { fetchPetSightings } from "../../api/sightings";
import type { PetSighting } from "../../types/sightings";

export function usePetSightings(petId: string | null) {
  const [sightings, setSightings] = useState<PetSighting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!petId) {
      setSightings([]);
      return;
    }
    const currentPetId = petId;

    const controller = new AbortController();

    async function load() {
      setLoading(true);

      try {
        const result = await fetchPetSightings(
          currentPetId,
          controller.signal,
        );

        setSightings(result.sightings);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [petId]);

  return {
    sightings,
    loading,
  };
}