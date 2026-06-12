import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePetReportActions } from "./hooks/usePetReportActions";
import type { MapBounds, PetReportStatus, PetSpecies } from "../../api/types";
import { useAuthSession } from "../auth/useAuthSession";
import { useProfile } from "../auth/useProfile";
import { PostPetButton } from "../post-pet/PostPetButton";
import { PostPetModal } from "../post-pet/PostPetModal";
import type { PostPetDraft } from "../post-pet/types";
import { NearbyFilters } from "./components/NearbyFilters";
import { NearbyMapPanel } from "./components/NearbyMapPanel";
import { NearbySidebar } from "./components/NearbySidebar";
import { PetDetailDrawer } from "./components/PetDetailDrawer";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useMapBounds } from "./hooks/useMapBounds";
import { useNearbyPets } from "./hooks/useNearbyPets";
import { useUserLocation } from "./hooks/useUserLocation";
import { deletePetPhoto } from "../../api/photos";

const DEFAULT_POST_PET_DRAFT: PostPetDraft = {
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

export function NearbyPage() {
  const { bounds, updateBounds } = useMapBounds();
  const userLocation = useUserLocation();

  const [species, setSpecies] = useState<PetSpecies | "all">("all");
  const [reportStatus, setReportStatus] = useState<PetReportStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [postPetOpen, setPostPetOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);

  const [postPetDraft, setPostPetDraft] = useState<PostPetDraft>(
    DEFAULT_POST_PET_DRAFT,
  );

  const auth = useAuthSession();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const debouncedSearch = useDebouncedValue(search, 350);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const filters = useMemo(
    () => ({
      species,
      reportStatus,
      search: debouncedSearch,
    }),
    [species, reportStatus, debouncedSearch],
  );

  const { pets, total, loading, error, reload } = useNearbyPets(
    bounds,
    filters,
  );

  const {
    savingPost,
    deletingPet,
    updatingPost,
    resolvingPet,
    handleCreatePetReport,
    handleDeletePetReport,
    handleUpdatePetReport,
    handleResolvePetReport,
  } = usePetReportActions({
    reload,
    setSelectedPetId,
    setPostPetOpen,
    resetDraft: () => setPostPetDraft(DEFAULT_POST_PET_DRAFT),
  });

  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? null;

  const sidebarPets = selectedPetId
    ? [
        ...pets.filter((pet) => pet.id === selectedPetId),
        ...pets.filter((pet) => pet.id !== selectedPetId),
      ].slice(0, 100)
    : pets.slice(0, 100);

  const handleBoundsChange = useCallback(
    (nextBounds: MapBounds) => {
      updateBounds(nextBounds);
    },
    [updateBounds],
  );

  function handleEditSelectedPet() {
    if (!selectedPet) return;

    setEditingPetId(selectedPet.id);

    setPostPetDraft({
      reportStatus: selectedPet.reportStatus,
      species: selectedPet.species,
      name: selectedPet.name,
      breedLabel: selectedPet.breedLabel,
      description: selectedPet.description ?? "",
      latitude: selectedPet.latitude,
      longitude: selectedPet.longitude,
      photos: [],
      existingPhotos:
        selectedPet.photos
          ?.map((photo) => {
            const imageUrl =
              photo.resolvedUrl ?? photo.imageUrl ?? photo.imagePath;

            if (!imageUrl) return null;

            return {
              id: photo.id,
              imageUrl,
            };
          })
          .filter(
            (photo): photo is { id: number; imageUrl: string } =>
              photo !== null,
          ) ?? [],
    });

    setPostPetOpen(true);
  }

  function handleSubmitPetReport() {
    if (editingPetId) {
      return handleUpdatePetReport(editingPetId, postPetDraft).finally(() => {
        setEditingPetId(null);
      });
    }

    return handleCreatePetReport(postPetDraft);
  }

  function handleClosePostPetModal() {
    setPostPetOpen(false);
    setEditingPetId(null);
    setPostPetDraft(DEFAULT_POST_PET_DRAFT);
  }

  async function handleDeleteExistingPhoto(photoId: number) {
    await deletePetPhoto(photoId);
  
    setPostPetDraft((draft) => ({
      ...draft,
      existingPhotos: draft.existingPhotos?.filter(
        (photo) => photo.id !== photoId,
      ),
    }));
  
    await reload();
  }

  useEffect(() => {
    if (!selectedPetId) return;

    sidebarRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [selectedPetId]);

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "420px minmax(0, 1fr)",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <div ref={sidebarRef} style={{ overflow: "auto" }}>
        <NearbyFilters
          species={species}
          reportStatus={reportStatus}
          search={search}
          onSpeciesChange={setSpecies}
          onReportStatusChange={setReportStatus}
          onSearchChange={setSearch}
        />

        <NearbySidebar
          pets={sidebarPets}
          total={total}
          loading={loading}
          error={error}
          onRetry={reload}
          selectedPetId={selectedPetId}
          onPetSelect={setSelectedPetId}
        />
      </div>

      <div style={{ position: "relative", minWidth: 0, minHeight: 0 }}>
        <NearbyMapPanel
          pets={pets}
          selectedPetId={selectedPetId}
          selectedPet={selectedPet}
          userLocation={userLocation.location}
          onBoundsChange={handleBoundsChange}
          onPetSelect={setSelectedPetId}
        />

        <PostPetButton
          onClick={() => {
            if (auth.loading || profileLoading) return;

            if (!auth.isAuthenticated) {
              navigate("/auth");
              return;
            }

            if (!profile?.isVerified) {
              alert("Verification required before posting.");
              return;
            }

            setPostPetOpen(true);
          }}
        />

        <PetDetailDrawer
          pet={selectedPet}
          onClose={() => setSelectedPetId(null)}
          canDelete={
            auth.isAuthenticated &&
            profile?.isVerified &&
            selectedPet?.owner?.email === profile?.email
          }
          deleting={deletingPet}
          onDelete={handleDeletePetReport}
          onEdit={handleEditSelectedPet}
          onResolve={handleResolvePetReport}
          resolving={resolvingPet}
        />

        <PostPetModal
          open={postPetOpen}
          value={postPetDraft}
          onChange={setPostPetDraft}
          onClose={handleClosePostPetModal}
          userLocation={userLocation.location}
          onSubmit={handleSubmitPetReport}
          saving={savingPost || updatingPost}
          mode={editingPetId ? "edit" : "create"}
          onDeleteExistingPhoto={handleDeleteExistingPhoto}
        />
      </div>
    </main>
  );
}
