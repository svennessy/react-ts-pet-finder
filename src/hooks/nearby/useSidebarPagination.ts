import { useState } from "react";

export function useSidebarPagination() {
  const [page, setPage] = useState(1);

  function resetPage() {
    setPage(1);
  }

  function nextPage() {
    setPage((value) => value + 1);
  }

  function previousPage() {
    setPage((value) => Math.max(1, value - 1));
  }

  return {
    page,
    setPage,
    resetPage,
    nextPage,
    previousPage,
  };
}