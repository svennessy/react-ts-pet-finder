import { useEffect, useState } from "react";
import { fetchPetById } from "../../api/pets";
import type { PetDetail } from "../../types/pets";

export function usePetDetails(petId: string | null) {
  const [pet, setPet] = useState<PetDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!petId) {
      setPet(null);
      setError(null);
      return;
    }

    const currentPetId = petId;
    const controller = new AbortController();

    setPet(null); // important: prevents old pet/photo flash
    setError(null);

    async function loadPet() {
      setLoading(true);

      try {
        const result = await fetchPetById(currentPetId, controller.signal);
        setPet(result);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error ? err.message : "Failed to load pet details",
        );
        setPet(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPet();

    return () => {
      controller.abort();
    };
  }, [petId]);

  return {
    pet,
    loading,
    error,
  };
}
