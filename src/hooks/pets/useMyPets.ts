import { useCallback, useEffect, useState } from "react";
import { fetchMyPets, type MyPet } from "../../api/myPets";

export function useMyPets(enabled = true) {
  const [pets, setPets] = useState<MyPet[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setPets([]);
      setTotal(0);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchMyPets(controller.signal);
        setPets(result.pets);
        setTotal(result.total);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load your pets",
        );
        setPets([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [enabled, reloadKey]);

  return {
    pets,
    total,
    loading,
    error,
    reload,
  };
}
