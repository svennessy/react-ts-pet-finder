import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePetPhoto } from "../api/photos";
import { createPetSighting } from "../api/sightings";
import type { MapBounds } from "../types/map";
import type { PostPetDraft } from "../types/forms";
import type {
  PetReportStatus,
  PetSortOption,
  PetSpecies,
} from "../types/pets";
import { useAuthSession } from "../hooks/auth/useAuthSession";
import { useProfile } from "../hooks/auth/useProfile";
import { NearbyFilters } from "../components/nearby/NearbyFilters";
import { NearbyMapPanel } from "../components/nearby/NearbyMapPanel";
import { NearbySidebar } from "../components/nearby/NearbySidebar";
import { PetDetailDrawer } from "../components/nearby/PetDetailDrawer";
import { ReportSightingModal } from "../components/nearby/ReportSightingModal";
import { useDebouncedValue } from "../hooks/nearby/useDebouncedValue";
import { useMapBounds } from "../hooks/nearby/useMapBounds";
import { useNearbyPets } from "../hooks/nearby/useNearbyPets";
import { usePetDetails } from "../hooks/nearby/usePetDetails";
import { usePetReportActions } from "../hooks/nearby/usePetReportActions";
import { useUserLocation } from "../hooks/nearby/useUserLocation";
import { PostPetButton } from "../components/post-pet/PostPetButton";
import { PostPetModal } from "../components/post-pet/PostPetModal";


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
  const [sort, setSort] = useState<PetSortOption>("newest");
  const [sightingOpen, setSightingOpen] = useState(false);
  const [savingSighting, setSavingSighting] = useState(false);

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
      sort,
    }),
    [species, reportStatus, debouncedSearch, sort],
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

  const selectedMapPet = pets.find((pet) => pet.id === selectedPetId) ?? null;

  const { pet: selectedPet, loading: selectedPetLoading } =
    usePetDetails(selectedPetId);

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

  function handleMapViewChange(view: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) {
    const params = new URLSearchParams(window.location.search);

    params.set("lat", view.latitude.toFixed(5));
    params.set("lng", view.longitude.toFixed(5));
    params.set("zoom", view.zoom.toFixed(2));

    window.history.replaceState(null, "", `?${params.toString()}`);
  }

  async function handleSubmitSighting(values: {
    latitude: number;
    longitude: number;
    notes: string;
  }) {
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

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "420px minmax(0, 1fr)",
        height: "calc(100vh - 64px)",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <div ref={sidebarRef} style={{ overflow: "auto" }}>
        <NearbyFilters
          species={species}
          reportStatus={reportStatus}
          search={search}
          sort={sort}
          onSpeciesChange={setSpecies}
          onReportStatusChange={setReportStatus}
          onSearchChange={setSearch}
          onSortChange={setSort}
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
          selectedPet={selectedMapPet}
          userLocation={userLocation.location}
          onBoundsChange={handleBoundsChange}
          onPetSelect={setSelectedPetId}
          onViewChange={handleMapViewChange}
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
          loading={selectedPetLoading}
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
          onReportSighting={() => setSightingOpen(true)}
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

        {selectedPet ? (
          <ReportSightingModal
            open={sightingOpen}
            onClose={() => setSightingOpen(false)}
            onSubmit={handleSubmitSighting}
            defaultLocation={{
              latitude: selectedPet.latitude,
              longitude: selectedPet.longitude,
            }}
            saving={savingSighting}
          />
        ) : null}
      </div>
    </main>
  );
}
