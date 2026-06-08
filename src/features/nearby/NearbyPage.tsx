import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPetReport, deletePetReport } from "../../api/postPets";
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
  const [savingPost, setSavingPost] = useState(false);
  const [deletingPet, setDeletingPet] = useState(false);

  const [postPetDraft, setPostPetDraft] = useState<PostPetDraft>({
    reportStatus: "lost",
    species: "dog",
    name: "",
    breedLabel: "",
    description: "",
    latitude: null,
    longitude: null,
    photos: [],
  });

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

  async function handleCreatePetReport() {
    if (postPetDraft.latitude === null || postPetDraft.longitude === null) {
      alert("Choose a location for the pet.");
      return;
    }

    setSavingPost(true);

    try {
      await createPetReport({
        reportStatus: postPetDraft.reportStatus,
        species: postPetDraft.species,
        name: postPetDraft.name,
        breedLabel: postPetDraft.breedLabel,
        description: postPetDraft.description,
        latitude: postPetDraft.latitude,
        longitude: postPetDraft.longitude,
      });

      setPostPetOpen(false);
      setPostPetDraft({
        reportStatus: "lost",
        species: "dog",
        name: "",
        breedLabel: "",
        description: "",
        latitude: null,
        longitude: null,
        photos: [],
      });

      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save report.");
    } finally {
      setSavingPost(false);
    }
  }

  async function handleDeletePetReport(petId: string) {
    setDeletingPet(true);

    try {
      await deletePetReport(petId);
      setSelectedPetId(null);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete report.");
    } finally {
      setDeletingPet(false);
    }
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
            selectedPet?.owner?.id === auth.userId
          }
          deleting={deletingPet}
          onDelete={handleDeletePetReport}
        />

        <PostPetModal
          open={postPetOpen}
          value={postPetDraft}
          onChange={setPostPetDraft}
          onClose={() => setPostPetOpen(false)}
          userLocation={userLocation.location}
          onSubmit={handleCreatePetReport}
          saving={savingPost}
        />
      </div>
    </main>
  );
}
