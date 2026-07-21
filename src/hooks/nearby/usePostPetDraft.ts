import { useState } from "react";
import type { PostPetDraft } from "../../types/forms";
import type { PetDetail } from "../../types/pets";

export const DEFAULT_POST_PET_DRAFT: PostPetDraft = {
  reportStatus: "lost",
  species: "dog",
  name: "",
  breedLabel: "",
  description: "",
  latitude: null,
  longitude: null,
  photos: [],
  existingPhotos: [],
};

export function usePostPetDraft() {
  const [postPetDraft, setPostPetDraft] = useState<PostPetDraft>(
    DEFAULT_POST_PET_DRAFT,
  );

  function resetPostPetDraft() {
    setPostPetDraft({
      ...DEFAULT_POST_PET_DRAFT,
      photos: [],
      existingPhotos: [],
    });
  }

  function fillDraftFromPet(pet: PetDetail) {
    setPostPetDraft({
      reportStatus: pet.reportStatus,
      species: pet.species,
      name: pet.name ?? "",
      breedLabel: pet.breedLabel ?? "",
      description: pet.description ?? "",
      latitude: pet.latitude,
      longitude: pet.longitude,
      photos: [],
      existingPhotos:
        pet.photos
          ?.map((photo) => {
            const imageUrl =
              photo.resolvedUrl ?? photo.imageUrl ?? photo.imagePath;
            const id = Number(photo.id);

            if (!imageUrl || !Number.isFinite(id)) return null;

            return {
              id,
              imageUrl,
            };
          })
          .filter(
            (photo): photo is { id: number; imageUrl: string } =>
              photo !== null,
          ) ?? [],
    });
  }

  return {
    postPetDraft,
    setPostPetDraft,
    resetPostPetDraft,
    fillDraftFromPet,
  };
}
