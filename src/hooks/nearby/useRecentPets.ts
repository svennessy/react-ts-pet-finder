import { useEffect, useState } from "react";
import { fetchRecentPets } from "../../api/pets";
import type { MapPet } from "../../types/pets";

export function useRecentPets() {
  const [pets, setPets] = useState<MapPet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecentPets() {
      setLoading(true);

      try {
        const result = await fetchRecentPets(controller.signal);
        setPets(result.pets);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadRecentPets();

    return () => controller.abort();
  }, []);

  return { pets, loading };
}