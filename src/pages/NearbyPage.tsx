import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { usePetSightings } from "../hooks/nearby/usePetSightings";
import { usePostPetDraft } from "../hooks/nearby/usePostPetDraft";
import { useSidebarPets } from "../hooks/nearby/useSidebarPets";
import { useSightingsActions } from "../hooks/nearby/useSightingsActions";
import { useUserLocation } from "../hooks/nearby/useUserLocation";
import type { MapBounds } from "../types/map";
import type { MapMarkerPet } from "../types/pets";

export function NearbyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const auth = useAuthSession();
  const { profile, loading: profileLoading } = useProfile();
  const favorites = useFavorites();

  const { bounds, updateBounds } = useMapBounds();
  const userLocation = useUserLocation();

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [postPetOpen, setPostPetOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [centerOnUserKey, setCenterOnUserKey] = useState(0);
  const [highlightedSightingId, setHighlightedSightingId] = useState<
    string | null
  >(null);
  const [focusRequest, setFocusRequest] = useState<{
    key: number;
    latitude: number;
    longitude: number;
    zoom?: number;
  } | null>(null);

  const {
    species,
    setSpecies,
    reportStatus,
    setReportStatus,
    sort,
    setSort,
    filters,
  } = useNearbyFilters();

  const {
    pets,
    clusters,
    loading: mapLoading,
    error: mapError,
    total: mapTotal,
    returned: mapReturned,
    reload,
  } = useNearbyPets(bounds, filters);

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

  const { pet: selectedPet } = usePetDetails(selectedPetId);
  const {
    sightings: selectedPetSightings,
    reload: reloadSelectedPetSightings,
  } = usePetSightings(selectedPetId);

  const {
    sightingOpen,
    setSightingOpen,
    savingSighting,
    handleSubmitSighting,
  } = useSightingsActions(selectedPet);

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

  const selectedMarkerPet = useMemo((): MapMarkerPet | null => {
    const fromMap = pets.find((pet) => pet.id === selectedPetId);
    if (fromMap) return fromMap;
    if (!selectedPet || String(selectedPet.id) !== selectedPetId) return null;

    return {
      id: String(selectedPet.id),
      name: selectedPet.name,
      species: selectedPet.species,
      reportStatus: selectedPet.reportStatus,
      latitude: selectedPet.latitude,
      longitude: selectedPet.longitude,
      cityName: selectedPet.cityName,
      stateCode: selectedPet.stateCode,
    };
  }, [pets, selectedPet, selectedPetId]);

  const mapPets = useMemo(() => {
    if (!selectedMarkerPet) return pets;
    if (pets.some((pet) => pet.id === selectedMarkerPet.id)) return pets;
    return [...pets, selectedMarkerPet];
  }, [pets, selectedMarkerPet]);

  const selectedFavoritePet =
    sidebarPets.find((pet) => pet.id === selectedPetId) ?? selectedPet ?? null;

  const handleBoundsChange = useCallback(
    (nextBounds: MapBounds) => {
      updateBounds(nextBounds);
    },
    [updateBounds],
  );

  function handleSelectPet(petId: string | null) {
    setSelectedPetId(petId);
    if (!petId) {
      setHighlightedSightingId(null);
    }

    if (petId) {
      setSidebarCollapsed(true);
    }
  }

  async function handleSubmitSightingAndReload(values: {
    latitude: number;
    longitude: number;
    notes: string;
  }) {
    await handleSubmitSighting(values);
    reloadSelectedPetSightings();
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
      sidebarPets.find((pet) => pet.id === petId) ?? selectedFavoritePet;

    if (!petToSave) return;

    await favorites.save(petToSave);
  }

  async function handleCenterOnUser() {
    const location =
      userLocation.location ??
      (await userLocation.requestLocation({ highAccuracy: true }));

    if (!location) {
      alert(
        "Unable to get your location. Allow location access in the browser and try again.",
      );
      return;
    }

    // Refresh quietly when we already had a cached point.
    if (userLocation.location) {
      void userLocation.requestLocation({ highAccuracy: true });
    }

    setSelectedPetId(null);
    setCenterOnUserKey((value) => value + 1);
  }

  const nearMeParam = searchParams.get("nearMe");
  const centerParam = searchParams.get("center");
  const petParam = searchParams.get("pet");
  const sightingParam = searchParams.get("sighting");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const zoomParam = searchParams.get("zoom");

  useEffect(() => {
    if (!nearMeParam && !centerParam) return;

    let cancelled = false;

    async function centerFromQuery() {
      const location =
        userLocation.location ??
        (await userLocation.requestLocation({ highAccuracy: true }));

      if (cancelled || !location) return;

      setSelectedPetId(null);
      setHighlightedSightingId(null);
      setCenterOnUserKey((value) => value + 1);

      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("center");
          next.delete("nearMe");
          return next;
        },
        { replace: true },
      );
    }

    void centerFromQuery();

    return () => {
      cancelled = true;
    };
    // Only react to the query flags — not to location object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearMeParam, centerParam]);

  useEffect(() => {
    if (!petParam) return;

    setSelectedPetId(petParam);
    setSidebarCollapsed(true);
    setHighlightedSightingId(sightingParam);

    const latitude = latParam ? Number(latParam) : NaN;
    const longitude = lngParam ? Number(lngParam) : NaN;
    const zoom = zoomParam ? Number(zoomParam) : 14;

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      setFocusRequest((current) => ({
        key: (current?.key ?? 0) + 1,
        latitude,
        longitude,
        zoom: Number.isFinite(zoom) ? zoom : 14,
      }));
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("pet");
        next.delete("sighting");
        next.delete("lat");
        next.delete("lng");
        next.delete("zoom");
        return next;
      },
      { replace: true },
    );
  }, [
    latParam,
    lngParam,
    petParam,
    setSearchParams,
    sightingParam,
    zoomParam,
  ]);

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
          pets={mapPets}
          clusters={clusters}
          selectedPetId={selectedPetId}
          selectedPet={selectedMarkerPet}
          userLocation={userLocation.location}
          sightings={selectedPetSightings}
          highlightedSightingId={highlightedSightingId}
          focusRequest={focusRequest}
          loading={mapLoading}
          markerTotal={mapTotal}
          markerReturned={mapReturned}
          centerOnUserKey={centerOnUserKey}
          mapResizeKey={sidebarCollapsed}
          onBoundsChange={handleBoundsChange}
          onPetSelect={handleSelectPet}
        />

        {mapError ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 16,
              transform: "translateX(-50%)",
              zIndex: 10000,
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.96)",
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
              maxWidth: "min(420px, calc(100% - 32px))",
            }}
          >
            <span style={{ fontSize: 13, color: "#374151" }}>
              Map pets failed to load. {mapError}
            </span>
            <button
              type="button"
              onClick={reload}
              style={{
                border: 0,
                borderRadius: 8,
                padding: "6px 10px",
                background: "#111827",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            void handleCenterOnUser();
          }}
          disabled={userLocation.loading && !userLocation.location}
          aria-label="Center map on my location"
          title="Center map on my location"
          style={{
            position: "absolute",
            right: 16,
            top: 72,
            zIndex: 9999,
            width: 42,
            height: 42,
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.12)",
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
            cursor:
              userLocation.loading && !userLocation.location
                ? "not-allowed"
                : "pointer",
            fontSize: 18,
            fontWeight: 800,
            display: "grid",
            placeItems: "center",
            color: "#111827",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v3" />
            <path d="M12 19v3" />
            <path d="M2 12h3" />
            <path d="M19 12h3" />
          </svg>
        </button>

        <PostPetButton onClick={handleOpenPostPetModal} />

        <NearbyModals
          selectedPetId={selectedPetId}
          selectedPet={selectedPet}
          drawerPet={selectedPet}
          postPetOpen={postPetOpen}
          postPetDraft={postPetDraft}
          editingPetId={editingPetId}
          sightingOpen={sightingOpen}
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
          savingSighting={savingSighting}
          isFavorite={
            selectedPetId ? favorites.isFavorite(selectedPetId) : false
          }
          favoriteLoading={
            selectedPetId ? favorites.isPending(selectedPetId) : false
          }
          onToggleFavorite={handleToggleFavorite}
          onCloseDrawer={handleCloseDrawer}
          onDeletePet={handleDeletePetReport}
          onEditPet={handleEditSelectedPet}
          onResolvePet={handleResolvePetReport}
          onReportSighting={() => setSightingOpen(true)}
          onChangePostPetDraft={setPostPetDraft}
          onClosePostPetModal={handleClosePostPetModal}
          onSubmitPetReport={handleSubmitPetReport}
          onDeleteExistingPhoto={handleDeleteExistingPhoto}
          onCloseSightingModal={() => setSightingOpen(false)}
          onSubmitSighting={handleSubmitSightingAndReload}
        />
      </div>
    </main>
  );
}
