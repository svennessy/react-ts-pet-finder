import { useMemo, useState } from "react";
import type {
  PetReportStatus,
  PetSortOption,
  PetSpecies,
} from "../../types/pets";
import { useDebouncedValue } from "./useDebouncedValue";

export function useNearbyFilters() {
  const [species, setSpecies] = useState<PetSpecies | "all">("all");
  const [reportStatus, setReportStatus] = useState<PetReportStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<PetSortOption>("newest");

  const debouncedSearch = useDebouncedValue(search, 350);

  const filters = useMemo(
    () => ({
      species,
      reportStatus,
      search: debouncedSearch,
      sort,
    }),
    [species, reportStatus, debouncedSearch, sort],
  );

  return {
    species,
    setSpecies,
    reportStatus,
    setReportStatus,
    search,
    setSearch,
    sort,
    setSort,
    filters,
  };
}