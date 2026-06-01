import { useCallback, useState } from "react";
import type { MapBounds } from "../../api/types";
import { NearbyMapPanel } from "./components/NearbyMapPanel";
import { NearbySidebar } from "./components/NearbySidebar";
import { useMapBounds } from "./hooks/useMapBounds";
import { useNearbyPets } from "./hooks/useNearbyPets";

export function NearbyPage() {
  const { bounds, updateBounds } = useMapBounds();
  const { pets, total, loading, error, reload } = useNearbyPets(bounds);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const handleBoundsChange = useCallback(
    (nextBounds: MapBounds) => {
      updateBounds(nextBounds);
    },
    [updateBounds],
  );

  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? null;

  const sidebarPets = selectedPetId
    ? [
        ...pets.filter((pet) => pet.id === selectedPetId),
        ...pets.filter((pet) => pet.id !== selectedPetId),
      ].slice(0, 100)
    : pets.slice(0, 100);

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
      <div style={{ overflow: "auto" }}>
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

      <div style={{ minWidth: 0, minHeight: 0 }}>
        <NearbyMapPanel
          pets={pets}
          selectedPetId={selectedPetId}
          selectedPet={selectedPet}
          onBoundsChange={handleBoundsChange}
          onPetSelect={setSelectedPetId}
        />
      </div>
    </main>
  );
}
