import type { CSSProperties } from "react";
import type {
  PetReportStatus,
  PetSpecies,
  PetSortOption,
} from "../../types/pets";

type NearbyFiltersProps = {
  species: PetSpecies | "all";
  reportStatus: PetReportStatus | "all";
  search: string;
  sort: PetSortOption;
  onSortChange: (sort: PetSortOption) => void;
  onSpeciesChange: (species: PetSpecies | "all") => void;
  onReportStatusChange: (status: PetReportStatus | "all") => void;
  onSearchChange: (search: string) => void;
};

function pillStyle(active: boolean): CSSProperties {
  return {
    border: active ? "1px solid #2563eb" : "1px solid #d1d5db",
    background: active ? "#eff6ff" : "white",
    color: active ? "#1d4ed8" : "#374151",
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: active ? 700 : 500,
  };
}

export function NearbyFilters({
  species,
  reportStatus,
  search,
  onSpeciesChange,
  onReportStatusChange,
  onSearchChange,
  sort,
  onSortChange,
}: NearbyFiltersProps) {
  return (
    <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search pets or breeds"
        style={{
          width: "100%",
          boxSizing: "border-box",
          marginBottom: 10,
          padding: "10px 12px",
          borderRadius: 999,
          border: "1px solid #d1d5db",
        }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {(["newest", "oldest", "name"] as const).map((nextSort) => (
          <button
            key={nextSort}
            type="button"
            style={pillStyle(sort === nextSort)}
            onClick={() => onSortChange(nextSort)}
          >
            {nextSort === "newest"
              ? "Newest"
              : nextSort === "oldest"
                ? "Oldest"
                : "Name"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {(["all", "lost", "found", "resolved"] as const).map((status) => (
          <button
            key={status}
            type="button"
            style={pillStyle(reportStatus === status)}
            onClick={() => onReportStatusChange(status)}
          >
            {status === "all"
              ? "Lost & found"
              : status === "lost"
                ? "Lost"
                : status === "found"
                  ? "Found"
                  : "Resolved"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["all", "dog", "cat", "other"] as const).map((nextSpecies) => (
          <button
            key={nextSpecies}
            type="button"
            style={pillStyle(species === nextSpecies)}
            onClick={() => onSpeciesChange(nextSpecies)}
          >
            {nextSpecies === "all"
              ? "All pets"
              : nextSpecies === "dog"
                ? "Dogs"
                : nextSpecies === "cat"
                  ? "Cats"
                  : "Other"}
          </button>
        ))}
      </div>
    </div>
  );
}
