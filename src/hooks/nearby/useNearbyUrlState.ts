export function useNearbyUrlState() {
  function getShouldStartNearMe() {
    const params = new URLSearchParams(window.location.search);
    return params.get("nearMe") === "1";
  }

  function getPetIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("pet");
  }

  function updateMapViewUrl() {
    // Disabled during map stabilization.
    // Writing lat/lng/zoom during move/zoom can fight MapLibre and cause jumps.
  }

  return {
    shouldStartNearMe: getShouldStartNearMe(),
    getPetIdFromUrl,
    updateMapViewUrl,
  };
}
