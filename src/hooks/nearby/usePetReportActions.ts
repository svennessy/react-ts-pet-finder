import { useState } from "react";
import { uploadPetPhotos } from "../../api/photos";
import {
  createPetReport,
  deletePetReport,
  updatePetReport,
} from "../../api/postPets";
import type { PostPetDraft } from "../../types/forms";

type UsePetReportActionsParams = {
  reload: () => void | Promise<void>;
  setSelectedPetId: (petId: string | null) => void;
  setPostPetOpen: (open: boolean) => void;
  resetDraft: () => void;
  reloadSidebar: () => void | Promise<void>;
  /** When false, keep the selected pet after update/resolve (My Pets). Default true. */
  clearSelectionOnSuccess?: boolean;
};

export function usePetReportActions({
  reload,
  setSelectedPetId,
  setPostPetOpen,
  resetDraft,
  reloadSidebar,
  clearSelectionOnSuccess = true,
}: UsePetReportActionsParams) {
  const [savingPost, setSavingPost] = useState(false);
  const [deletingPet, setDeletingPet] = useState(false);
  const [updatingPost, setUpdatingPost] = useState(false);
  const [resolvingPet, setResolvingPet] = useState(false);

  async function handleCreatePetReport(postPetDraft: PostPetDraft) {
    if (postPetDraft.latitude === null || postPetDraft.longitude === null) {
      alert("Choose a location for the pet.");
      return;
    }

    setSavingPost(true);

    try {
      const photoUrls = await uploadPetPhotos(postPetDraft.photos);

      await createPetReport({
        reportStatus: postPetDraft.reportStatus,
        species: postPetDraft.species,
        name: postPetDraft.name,
        breedLabel: postPetDraft.breedLabel,
        description: postPetDraft.description,
        latitude: postPetDraft.latitude,
        longitude: postPetDraft.longitude,
        photoUrls,
      });

      setPostPetOpen(false);
      resetDraft();

      await reload();
      await reloadSidebar();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save report.");
    } finally {
      setSavingPost(false);
    }
  }

  async function handleUpdatePetReport(
    petId: string,
    postPetDraft: PostPetDraft,
  ) {
    if (postPetDraft.latitude === null || postPetDraft.longitude === null) {
      alert("Choose a location for the pet.");
      return;
    }

    setUpdatingPost(true);

    try {
      const photoUrls = await uploadPetPhotos(postPetDraft.photos);

      await updatePetReport(petId, {
        reportStatus: postPetDraft.reportStatus,
        species: postPetDraft.species,
        name: postPetDraft.name,
        breedLabel: postPetDraft.breedLabel,
        description: postPetDraft.description,
        latitude: postPetDraft.latitude,
        longitude: postPetDraft.longitude,
        photoUrls,
      });

      setPostPetOpen(false);
      resetDraft();
      if (clearSelectionOnSuccess) {
        setSelectedPetId(null);
      }

      await reload();
      await reloadSidebar();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update report.");
    } finally {
      setUpdatingPost(false);
    }
  }

  async function handleDeletePetReport(petId: string) {
    setDeletingPet(true);

    try {
      await deletePetReport(petId);

      setSelectedPetId(null);

      await reload();
      await reloadSidebar();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete report.");
    } finally {
      setDeletingPet(false);
    }
  }

  async function handleResolvePetReport(petId: string) {
    setResolvingPet(true);

    try {
      await updatePetReport(petId, {
        reportStatus: "resolved",
      });

      if (clearSelectionOnSuccess) {
        setSelectedPetId(null);
      }

      await reload();
      await reloadSidebar();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to resolve report.");
    } finally {
      setResolvingPet(false);
    }
  }

  return {
    savingPost,
    deletingPet,
    updatingPost,
    resolvingPet,
    handleCreatePetReport,
    handleDeletePetReport,
    handleUpdatePetReport,
    handleResolvePetReport,
  };
}
