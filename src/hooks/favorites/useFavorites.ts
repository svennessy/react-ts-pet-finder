import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchFavorites,
  removeFavorite,
  saveFavorite,
} from "../../api/favorites";
import type { FavoritePet } from "../../api/favorites";
import type { MapPet } from "../../types/pets";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritePet[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingPetIds, setPendingPetIds] = useState<Set<string>>(new Set());

  const favoriteIds = useMemo(
    () => new Set(favorites.map((pet) => pet.id)),
    [favorites],
  );

  const reload = useCallback(async () => {
    setLoading(true);

    try {
      const result = await fetchFavorites();
      setFavorites(result.pets);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const isFavorite = useCallback(
    (petId: string) => favoriteIds.has(petId),
    [favoriteIds],
  );

  const isPending = useCallback(
    (petId: string) => pendingPetIds.has(petId),
    [pendingPetIds],
  );

  async function save(pet: MapPet) {
    const petId = pet.id;

    setPendingPetIds((current) => new Set(current).add(petId));
    setFavorites((current) =>
      current.some((favorite) => favorite.id === petId)
        ? current
        : [{ ...pet, favoriteId: "" }, ...current],
    );

    try {
      const saved = await saveFavorite(petId);

      setFavorites((current) =>
        current.map((favorite) =>
          favorite.id === petId
            ? { ...favorite, favoriteId: saved.id }
            : favorite,
        ),
      );
    } catch (err) {
      setFavorites((current) =>
        current.filter((favorite) => favorite.id !== petId),
      );
      throw err;
    } finally {
      setPendingPetIds((current) => {
        const next = new Set(current);
        next.delete(petId);
        return next;
      });
    }
  }

  async function remove(petId: string) {
    let removedFavorite: FavoritePet | undefined;

    setPendingPetIds((current) => new Set(current).add(petId));
    setFavorites((current) => {
      removedFavorite = current.find((favorite) => favorite.id === petId);
      return current.filter((favorite) => favorite.id !== petId);
    });

    try {
      await removeFavorite(petId);
    } catch (err) {
      const favoriteToRestore = removedFavorite;

      if (favoriteToRestore) {
        setFavorites((current) =>
          current.some((favorite) => favorite.id === petId)
            ? current
            : [favoriteToRestore, ...current],
        );
      }

      throw err;
    } finally {
      setPendingPetIds((current) => {
        const next = new Set(current);
        next.delete(petId);
        return next;
      });
    }
  }

  return {
    favorites,
    loading,
    reload,
    save,
    remove,
    isFavorite,
    isPending,
  };
}
