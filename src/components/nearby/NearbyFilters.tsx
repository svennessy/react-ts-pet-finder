import type { CSSProperties } from "react";
import type {
  PetReportStatus,
  PetSpecies,
  PetSortOption,
} from "../../types/pets";

type NearbyFiltersProps = {
  species: PetSpecies | "all";
  reportStatus: PetReportStatus | "all";
  sort: PetSortOption;
  onSortChange: (sort: PetSortOption) => void;
  onSpeciesChange: (species: PetSpecies | "all") => void;
  onReportStatusChange: (status: PetReportStatus | "all") => void;
};

function controlStyle(): CSSProperties {
  return {
    border: "1px solid #d1d5db",
    borderRadius: 999,
    background: "white",
    padding: "7px 10px",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  };
}

export function NearbyFilters({
  species,
  reportStatus,
  onSpeciesChange,
  onReportStatusChange,
  sort,
  onSortChange,
}: NearbyFiltersProps) {
  return (
    <div style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 6,
        }}
      >
        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as PetSortOption)
          }
          style={controlStyle()}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>

        <select
          value={reportStatus}
          onChange={(event) =>
            onReportStatusChange(event.target.value as PetReportStatus | "all")
          }
          style={controlStyle()}
        >
          <option value="all">Lost & found</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={species}
          onChange={(event) =>
            onSpeciesChange(event.target.value as PetSpecies | "all")
          }
          style={controlStyle()}
        >
          <option value="all">All pets</option>
          <option value="dog">Dogs</option>
          <option value="cat">Cats</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
}
