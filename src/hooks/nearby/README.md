# Nearby flow notes

Stable rebuilt flow:

- NearbyPage owns selectedPetId directly.
- useNearbyPets loads lightweight map markers from /api/pets/map.
- useSidebarPets loads paginated cards from /api/pets/sidebar.
- usePetDetails loads full drawer data from /api/pets/:id.
- NearbyMapPanel recenters only when selected pet id changes.
- Do not reintroduce URL lat/lng/zoom syncing until map behavior is fully stable.
- Removed old useNearbySelection/useNearbyUrlState flow because the rebuilt page is stable without it.

If map jumping returns, diff against the commit:
"stabilize nearby page and restore full modal flow"