import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { MapPet } from "../../types/pets";
import { PetCard } from "./PetCard";

type NearbySidebarProps = {
  pets: MapPet[];
  total: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedPetId: string | null;
  onPetSelect: (petId: string) => void;
  isFavorite?: (petId: string) => boolean;
  favoriteLoading?: boolean;
  onToggleFavorite?: (petId: string) => void | Promise<void>;
  page: number;
  limit: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

export function NearbySidebar({
  pets,
  total,
  loading,
  error,
  onRetry,
  selectedPetId,
  onPetSelect,
  isFavorite,
  favoriteLoading = false,
  onToggleFavorite,
  page,
  limit,
  onNextPage,
  onPreviousPage,
}: NearbySidebarProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: pets.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 246,
    overscan: 3,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const hasPreviousPage = page > 1;
  const hasNextPage = end < total;

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <header
        style={{
          padding: "12px 18px 8px",
          flex: "0 0 auto",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            lineHeight: 1.15,
          }}
        >
          Pets nearby
        </h2>

        <p
          style={{
            margin: "5px 0 0",
            color: "#6b7280",
            fontSize: 13,
          }}
        >
          {loading
            ? "Loading pets..."
            : `${start.toLocaleString()}-${end.toLocaleString()} of ${total.toLocaleString()} pets in this area`}
        </p>
      </header>

      {error ? (
        <div style={{ padding: "0 18px 12px" }}>
          <p>{error}</p>
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="nearby-card-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {pets.length === 0 && !loading && !error ? (
          <p style={{ padding: "0 18px" }}>No pets found in this area.</p>
        ) : null}

        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualItem) => {
            const pet = pets[virtualItem.index];
            if (!pet) return null;

            return (
              <div
                key={pet.id}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <PetCard
                  pet={pet}
                  selected={pet.id === selectedPetId}
                  onSelect={onPetSelect}
                  isFavorite={isFavorite?.(pet.id) ?? false}
                  favoriteLoading={favoriteLoading}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            );
          })}
        </div>
      </div>

      <footer
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 14px",
          borderTop: "1px solid #e5e7eb",
          background: "white",
        }}
      >
        <button
          type="button"
          disabled={!hasPreviousPage || loading}
          onClick={onPreviousPage}
        >
          Previous
        </button>

        <span style={{ fontSize: 13, color: "#6b7280" }}>Page {page}</span>

        <button
          type="button"
          disabled={!hasNextPage || loading}
          onClick={onNextPage}
        >
          Next
        </button>
      </footer>
    </aside>
  );
}