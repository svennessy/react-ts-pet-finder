import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePetPhoto } from "../api/photos";
import { NearbyFilters } from "../components/nearby/NearbyFilters";
import { NearbyMapPanel } from "../components/nearby/NearbyMapPanel";
import { NearbyModals } from "../components/nearby/NearbyModals";
import { NearbySidebar } from "../components/nearby/NearbySidebar";
import { PostPetButton } from "../components/post-pet/PostPetButton";
import { useAuthSession } from "../hooks/auth/useAuthSession";
import { useProfile } from "../hooks/auth/useProfile";
import { useFavorites } from "../hooks/favorites/useFavorites";
import { useMapBounds } from "../hooks/nearby/useMapBounds";
import { useNearbyFilters } from "../hooks/nearby/useNearbyFilters";
import { useNearbyPets } from "../hooks/nearby/useNearbyPets";
import { usePetDetails } from "../hooks/nearby/usePetDetails";
import { usePetReportActions } from "../hooks/nearby/usePetReportActions";
import { usePostPetDraft } from "../hooks/nearby/usePostPetDraft";
import { useSidebarPets } from "../hooks/nearby/useSidebarPets";
import { useUserLocation } from "../hooks/nearby/useUserLocation";
import type { MapBounds } from "../types/map";

export function NearbyPage() {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const { profile, loading: profileLoading } = useProfile();
  const favorites = useFavorites();

  const { bounds, updateBounds } = useMapBounds();
  const userLocation = useUserLocation();

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [postPetOpen, setPostPetOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);

  const {
    species,
    setSpecies,
    reportStatus,
    setReportStatus,
    sort,
    setSort,
    filters,
  } = useNearbyFilters();

  const { pets, loading: mapLoading, reload } = useNearbyPets(bounds, filters);

  const {
    sidebarPets,
    sidebarTotal,
    sidebarLoading,
    sidebarError,
    sidebarPage,
    sidebarLimit,
    nextSidebarPage,
    previousSidebarPage,
    reloadSidebar,
  } = useSidebarPets(bounds, filters);

  const { pet: selectedPet, loading: selectedPetLoading } =
    usePetDetails(selectedPetId);

  const { postPetDraft, setPostPetDraft, resetPostPetDraft, fillDraftFromPet } =
    usePostPetDraft();

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
    reloadSidebar,
    setSelectedPetId,
    setPostPetOpen,
    resetDraft: resetPostPetDraft,
  });

  const selectedMapPet =
    pets.find((pet) => pet.id === selectedPetId) ??
    sidebarPets.find((pet) => pet.id === selectedPetId) ??
    selectedPet ??
    null;

  const handleBoundsChange = useCallback(
    (nextBounds: MapBounds) => {
      updateBounds(nextBounds);
    },
    [updateBounds],
  );

  function handleSelectPet(petId: string | null) {
    setSelectedPetId(petId);

    if (petId) {
      setSidebarCollapsed(true);
    }
  }

  function handleCloseDrawer() {
    setSelectedPetId(null);
  }

  function handleOpenPostPetModal() {
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
  }

  function handleEditSelectedPet() {
    if (!selectedPet) return;

    setEditingPetId(String(selectedPet.id));
    fillDraftFromPet(selectedPet);
    setPostPetOpen(true);
  }

  function handleClosePostPetModal() {
    setPostPetOpen(false);
    setEditingPetId(null);
    resetPostPetDraft();
  }

  function handleSubmitPetReport() {
    if (editingPetId) {
      return handleUpdatePetReport(editingPetId, postPetDraft).finally(() => {
        setEditingPetId(null);
      });
    }

    return handleCreatePetReport(postPetDraft);
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
    await reloadSidebar();
  }

  async function handleToggleFavorite(petId: string) {
    if (!auth.isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (favorites.isFavorite(petId)) {
      await favorites.remove(petId);
      return;
    }

    const petToSave =
      sidebarPets.find((pet) => pet.id === petId) ??
      selectedPet ??
      selectedMapPet;

    if (!petToSave) return;

    await favorites.save(petToSave);
  }

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: sidebarCollapsed
          ? "0px minmax(0, 1fr)"
          : "420px minmax(0, 1fr)",
        height: "calc(100vh - 64px)",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          minWidth: 0,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "white",
          opacity: sidebarCollapsed ? 0 : 1,
          pointerEvents: sidebarCollapsed ? "none" : "auto",
        }}
      >
        <NearbyFilters
          species={species}
          reportStatus={reportStatus}
          sort={sort}
          onSpeciesChange={setSpecies}
          onReportStatusChange={setReportStatus}
          onSortChange={setSort}
        />

        <NearbySidebar
          pets={sidebarPets}
          total={sidebarTotal}
          loading={sidebarLoading}
          error={sidebarError}
          onRetry={reloadSidebar}
          selectedPetId={selectedPetId}
          onPetSelect={handleSelectPet}
          isFavorite={favorites.isFavorite}
          favoriteLoading={false}
          onToggleFavorite={handleToggleFavorite}
          page={sidebarPage}
          limit={sidebarLimit}
          onNextPage={nextSidebarPage}
          onPreviousPage={previousSidebarPage}
        />
      </div>

      <div style={{ position: "relative", minWidth: 0, minHeight: 0 }}>
        {sidebarCollapsed ? (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Open sidebar"
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 9999,
              width: 36,
              height: 76,
              border: "1px solid rgba(0,0,0,0.08)",
              borderLeft: 0,
              borderRadius: "0 16px 16px 0",
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: 800,
              color: "#374151",
            }}
          >
            ❯
          </button>
        ) : null}

        <NearbyMapPanel
          pets={pets}
          selectedPetId={selectedPetId}
          selectedPet={selectedMapPet}
          userLocation={userLocation.location}
          loading={mapLoading}
          mapResizeKey={sidebarCollapsed}
          onBoundsChange={handleBoundsChange}
          onPetSelect={handleSelectPet}
        />

        <PostPetButton onClick={handleOpenPostPetModal} />

        <NearbyModals
          selectedPetId={selectedPetId}
          selectedPet={selectedPet}
          drawerPet={selectedPet}
          postPetOpen={postPetOpen}
          postPetDraft={postPetDraft}
          editingPetId={editingPetId}
          sightingOpen={false}
          userLocation={userLocation.location}
          canDelete={Boolean(
            auth.isAuthenticated &&
              profile?.isVerified &&
              selectedPet?.owner?.email === profile?.email,
          )}
          deletingPet={deletingPet}
          resolvingPet={resolvingPet}
          savingPost={savingPost}
          updatingPost={updatingPost}
          savingSighting={false}
          isFavorite={selectedPetId ? favorites.isFavorite(selectedPetId) : false}
          favoriteLoading={
            selectedPetId ? favorites.isPending(selectedPetId) : false
          }
          onToggleFavorite={handleToggleFavorite}
          onCloseDrawer={handleCloseDrawer}
          onDeletePet={handleDeletePetReport}
          onEditPet={handleEditSelectedPet}
          onResolvePet={handleResolvePetReport}
          onReportSighting={() => {}}
          onChangePostPetDraft={setPostPetDraft}
          onClosePostPetModal={handleClosePostPetModal}
          onSubmitPetReport={handleSubmitPetReport}
          onDeleteExistingPhoto={handleDeleteExistingPhoto}
          onCloseSightingModal={() => {}}
          onSubmitSighting={async () => {}}
        />
      </div>
    </main>
  );
}