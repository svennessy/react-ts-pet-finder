import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NearbyFilters } from "../components/nearby/NearbyFilters";
import { NearbyMapPanel } from "../components/nearby/NearbyMapPanel";
import { NearbySidebar } from "../components/nearby/NearbySidebar";
import { PetDetailDrawer } from "../components/nearby/PetDetailDrawer";
import { useAuthSession } from "../hooks/auth/useAuthSession";
import { useFavorites } from "../hooks/favorites/useFavorites";
import { useMapBounds } from "../hooks/nearby/useMapBounds";
import { useNearbyFilters } from "../hooks/nearby/useNearbyFilters";
import { useNearbyPets } from "../hooks/nearby/useNearbyPets";
import { usePetDetails } from "../hooks/nearby/usePetDetails";
import { useSidebarPets } from "../hooks/nearby/useSidebarPets";
import { useUserLocation } from "../hooks/nearby/useUserLocation";
import type { MapBounds } from "../types/map";
import { PostPetButton } from "../components/post-pet/PostPetButton";
import { PostPetModal } from "../components/post-pet/PostPetModal";
import { useProfile } from "../hooks/auth/useProfile";
import { usePetReportActions } from "../hooks/nearby/usePetReportActions";
import { usePostPetDraft } from "../hooks/nearby/usePostPetDraft";

export function NearbyPage() {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const favorites = useFavorites();

  const { bounds, updateBounds } = useMapBounds();
  const userLocation = useUserLocation();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    species,
    setSpecies,
    reportStatus,
    setReportStatus,
    sort,
    setSort,
    filters,
  } = useNearbyFilters();

  const { pets, loading: mapLoading } = useNearbyPets(bounds, filters);

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

  const selectedMapPet =
    pets.find((pet) => pet.id === selectedPetId) ??
    sidebarPets.find((pet) => pet.id === selectedPetId) ??
    null;

  const handleBoundsChange = useCallback(
    (nextBounds: MapBounds) => {
      updateBounds(nextBounds);
    },
    [updateBounds],
  );

  const { profile, loading: profileLoading } = useProfile();
  const { postPetDraft, setPostPetDraft, resetPostPetDraft } =
    usePostPetDraft();
  const [postPetOpen, setPostPetOpen] = useState(false);

  const { savingPost, handleCreatePetReport } = usePetReportActions({
    reload: () => {},
    reloadSidebar,
    setSelectedPetId,
    setPostPetOpen,
    resetDraft: resetPostPetDraft,
  });

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

  function handleClosePostPetModal() {
    setPostPetOpen(false);
    resetPostPetDraft();
  }

  function handleSelectPet(petId: string | null) {
    setSelectedPetId(petId);

    if (petId) {
      setSidebarCollapsed(true);
    }
  }

  function handleCloseDrawer() {
    setSelectedPetId(null);
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
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 9999,
            }}
          >
            open
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

        <PetDetailDrawer
          pet={selectedPet}
          loading={Boolean(selectedPetId) && selectedPetLoading}
          onClose={handleCloseDrawer}
          canDelete={false}
          deleting={false}
          resolving={false}
          isFavorite={
            selectedPetId ? favorites.isFavorite(selectedPetId) : false
          }
          favoriteLoading={
            selectedPetId ? favorites.isPending(selectedPetId) : false
          }
          onToggleFavorite={handleToggleFavorite}
        />

        <PostPetButton onClick={handleOpenPostPetModal} />

        <PostPetModal
          open={postPetOpen}
          value={postPetDraft}
          onChange={setPostPetDraft}
          onClose={handleClosePostPetModal}
          userLocation={userLocation.location}
          onSubmit={() => handleCreatePetReport(postPetDraft)}
          saving={savingPost}
          mode="create"
          onDeleteExistingPhoto={async () => {}}
        />
      </div>
    </main>
  );
}
