import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Map, {
  Layer,
  NavigationControl,
  Popup,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapBounds } from "../../types/map";
import type { MapMarkerPet } from "../../types/pets";

const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;
const mapTilerStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerKey}`;

const SPIDERFY_RADIUS_PIXELS = 54;
const SPIDERFY_MIN_ZOOM = 12;
const SPIDERFY_COLLAPSE_ZOOM = 11.5;
const SPIDERFY_CIRCLE_POINTS = 72;
const LOCATION_GROUP_DECIMALS = 4;
const SAME_LOCATION_METERS = 25;

type UserLocation = {
  latitude: number;
  longitude: number;
};

type SpiderfyGroup = {
  petIds: string[];
  latitude: number;
  longitude: number;
};

type DisplayPet = MapMarkerPet & {
  displayLatitude: number;
  displayLongitude: number;
  originalLatitude: number;
  originalLongitude: number;
  sharedLocationCount: number;
};

type NearbyMapPanelProps = {
  pets: MapMarkerPet[];
  selectedPetId: string | null;
  selectedPet: MapMarkerPet | null;
  userLocation: UserLocation | null;
  loading?: boolean;
  centerOnUserKey?: number;
  onBoundsChange: (bounds: MapBounds) => void;
  onPetSelect: (petId: string | null) => void;
  mapResizeKey?: string | number | boolean;
};

function getInitialMapView(userLocation: UserLocation | null) {
  return {
    latitude: userLocation?.latitude ?? 39.8283,
    longitude: userLocation?.longitude ?? -98.5795,
    zoom: userLocation ? 11 : 4,
  };
}

function normalizeCoordinate(value: number | string) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
}

function normalizeMapPet(pet: MapMarkerPet): MapMarkerPet | null {
  const latitude = normalizeCoordinate(pet.latitude);
  const longitude = normalizeCoordinate(pet.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    ...pet,
    id: String(pet.id),
    latitude,
    longitude,
  };
}

function locationKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(LOCATION_GROUP_DECIMALS)}:${longitude.toFixed(LOCATION_GROUP_DECIMALS)}`;
}

function distanceMeters(
  leftLat: number,
  leftLng: number,
  rightLat: number,
  rightLng: number,
) {
  const earthRadius = 6371000;
  const leftLatRad = (leftLat * Math.PI) / 180;
  const rightLatRad = (rightLat * Math.PI) / 180;
  const deltaLat = ((rightLat - leftLat) * Math.PI) / 180;
  const deltaLng = ((rightLng - leftLng) * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(leftLatRad) *
      Math.cos(rightLatRad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return (
    2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function shareSameLocation(left: MapMarkerPet, right: MapMarkerPet) {
  if (
    locationKey(left.latitude, left.longitude) ===
    locationKey(right.latitude, right.longitude)
  ) {
    return true;
  }

  return (
    distanceMeters(
      left.latitude,
      left.longitude,
      right.latitude,
      right.longitude,
    ) <= SAME_LOCATION_METERS
  );
}

function groupPetsBySameLocation(pets: MapMarkerPet[]) {
  const groups: MapMarkerPet[][] = [];

  for (const pet of pets) {
    const existingGroup = groups.find((group) =>
      shareSameLocation(group[0], pet),
    );
    if (existingGroup) {
      existingGroup.push(pet);
      continue;
    }

    groups.push([pet]);
  }

  return groups;
}

function getSpiderfyRadiusPixels(count: number) {
  const countBoost = Math.min(1.4, 0.95 + count * 0.12);
  return SPIDERFY_RADIUS_PIXELS * countBoost;
}

function offsetCoordinateByPixels({
  map,
  latitude,
  longitude,
  xPixels,
  yPixels,
}: {
  map: maplibregl.Map;
  latitude: number;
  longitude: number;
  xPixels: number;
  yPixels: number;
}) {
  const anchor = map.project([longitude, latitude]);
  const offset = map.unproject([anchor.x + xPixels, anchor.y + yPixels]);
  return { latitude: offset.lat, longitude: offset.lng };
}

function buildCircleCoordinates({
  map,
  latitude,
  longitude,
  radiusPixels,
}: {
  map: maplibregl.Map;
  latitude: number;
  longitude: number;
  radiusPixels: number;
}) {
  const coordinates: [number, number][] = [];

  for (let index = 0; index <= SPIDERFY_CIRCLE_POINTS; index += 1) {
    const angle = (index / SPIDERFY_CIRCLE_POINTS) * Math.PI * 2;
    const point = offsetCoordinateByPixels({
      map,
      latitude,
      longitude,
      xPixels: Math.cos(angle) * radiusPixels,
      yPixels: Math.sin(angle) * radiusPixels,
    });
    coordinates.push([point.longitude, point.latitude]);
  }

  return coordinates;
}

function getLeafPetId(leaf: GeoJSON.Feature) {
  const rawId = leaf.properties?.id;
  if (rawId === undefined || rawId === null) return null;
  return String(rawId);
}

function getLeafCoordinates(leaf: GeoJSON.Feature) {
  if (leaf.geometry?.type !== "Point") return null;

  const coords = leaf.geometry.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const longitude = normalizeCoordinate(coords[0]);
  const latitude = normalizeCoordinate(coords[1]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function resolvePetsFromLeaves(leaves: GeoJSON.Feature[], pets: MapMarkerPet[]) {
  const resolved: MapMarkerPet[] = [];
  const seen = new Set<string>();

  for (const leaf of leaves) {
    const petId = getLeafPetId(leaf);

    if (petId) {
      const pet = pets.find((candidate) => candidate.id === petId);
      if (pet && !seen.has(pet.id)) {
        seen.add(pet.id);
        resolved.push(pet);
      }
      continue;
    }

    const coords = getLeafCoordinates(leaf);
    if (!coords) continue;

    const pet = pets.find(
      (candidate) =>
        !seen.has(candidate.id) &&
        locationKey(candidate.latitude, candidate.longitude) ===
          locationKey(coords.latitude, coords.longitude),
    );

    if (pet) {
      seen.add(pet.id);
      resolved.push(pet);
    }
  }

  return resolved.sort((left, right) => left.id.localeCompare(right.id));
}

function getStackPetIdsFromProperties(
  properties: GeoJSON.GeoJsonProperties | null,
) {
  const raw = properties?.stackPetIds;
  if (typeof raw !== "string" || raw.length === 0) return null;
  return raw.split(",").filter(Boolean).sort();
}

function openStackFromPetIds(
  petIds: string[],
  safePets: MapMarkerPet[],
  openSpiderfyGroup: (group: SpiderfyGroup, shouldZoomIn?: boolean) => void,
  map: maplibregl.Map | null,
) {
  const stackPets = petIds
    .map((id) => safePets.find((pet) => pet.id === id))
    .filter((pet): pet is MapMarkerPet => Boolean(pet));

  if (stackPets.length <= 1) return false;

  const anchorPet = stackPets[0];
  openSpiderfyGroup(
    {
      petIds,
      latitude: anchorPet.latitude,
      longitude: anchorPet.longitude,
    },
    map ? map.getZoom() < SPIDERFY_MIN_ZOOM : false,
  );

  return true;
}

function NearbyMapPanelBase({
  pets,
  selectedPetId,
  selectedPet,
  userLocation,
  loading = false,
  onBoundsChange,
  onPetSelect,
  centerOnUserKey,
  mapResizeKey,
}: NearbyMapPanelProps) {
  const mapRef = useRef<MapRef | null>(null);
  const moveTimeoutRef = useRef<number | null>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  const lastBoundsRef = useRef("");
  const lastCenteredPetIdRef = useRef<string | null>(null);
  const initialLocationCenteredRef = useRef(false);
  const activeSpiderfyGroupRef = useRef<SpiderfyGroup | null>(null);

  const [activeSpiderfyGroup, setActiveSpiderfyGroup] =
    useState<SpiderfyGroup | null>(null);
  const [mapViewKey, setMapViewKey] = useState(0);

  useEffect(() => {
    activeSpiderfyGroupRef.current = activeSpiderfyGroup;
  }, [activeSpiderfyGroup]);

  const openSpiderfyGroup = useCallback(
    (group: SpiderfyGroup, shouldZoomIn = false) => {
      onPetSelect(null);
      setActiveSpiderfyGroup(group);
      setMapViewKey((value) => value + 1);

      if (!shouldZoomIn) return;

      const map = mapRef.current;
      if (!map) return;

      map.easeTo({
        center: [group.longitude, group.latitude],
        zoom: Math.max(map.getZoom(), SPIDERFY_MIN_ZOOM + 0.5),
        duration: 500,
      });
    },
    [onPetSelect],
  );

  const collapseSpiderfyIfNeeded = useCallback(() => {
    const map = mapRef.current;
    if (!map || !activeSpiderfyGroupRef.current) return;

    if (map.getZoom() < SPIDERFY_COLLAPSE_ZOOM) {
      setActiveSpiderfyGroup(null);
    }
  }, []);

  const safePets = useMemo(() => {
    return pets
      .map((pet) => normalizeMapPet(pet))
      .filter((pet): pet is MapMarkerPet => {
        if (!pet) return false;

        return (
          pet.latitude >= 24 &&
          pet.latitude <= 50 &&
          pet.longitude >= -125 &&
          pet.longitude <= -66
        );
      });
  }, [pets]);

  const locationGroups = useMemo(
    () => groupPetsBySameLocation(safePets),
    [safePets],
  );

  const {
    displayPets,
    sharedLocationCircles,
    soloPetFeatures,
    stackFeatures,
  } = useMemo(() => {
    const map = mapRef.current?.getMap();
    const activeIds = new Set(activeSpiderfyGroup?.petIds ?? []);
    const nextDisplayPets: DisplayPet[] = [];
    const nextSharedLocationCircles: GeoJSON.Feature<GeoJSON.LineString>[] = [];
    const nextSoloPetFeatures: Array<{
      type: "Feature";
      properties: Record<string, string | number | boolean>;
      geometry: GeoJSON.Point;
    }> = [];
    const nextStackFeatures: Array<{
      type: "Feature";
      properties: Record<string, string | number | boolean>;
      geometry: GeoJSON.Point;
    }> = [];

    for (const groupPets of locationGroups) {
      const sortedPets = [...groupPets].sort((left, right) =>
        left.id.localeCompare(right.id),
      );
      const anchorPet = sortedPets[0];
      const groupPetIds = sortedPets.map((pet) => pet.id);
      const isActiveGroup =
        sortedPets.length > 1 && groupPetIds.every((id) => activeIds.has(id));

      if (sortedPets.length === 1) {
        if (activeIds.has(anchorPet.id)) continue;

        nextSoloPetFeatures.push({
          type: "Feature",
          properties: {
            id: anchorPet.id,
            species: anchorPet.species,
            reportStatus: anchorPet.reportStatus,
            selected: anchorPet.id === selectedPetId,
          },
          geometry: {
            type: "Point",
            coordinates: [anchorPet.longitude, anchorPet.latitude],
          },
        });
        continue;
      }

      if (isActiveGroup && activeSpiderfyGroup) {
        const radiusPixels = getSpiderfyRadiusPixels(sortedPets.length);

        if (map) {
          nextSharedLocationCircles.push({
            type: "Feature",
            properties: { count: sortedPets.length },
            geometry: {
              type: "LineString",
              coordinates: buildCircleCoordinates({
                map,
                latitude: activeSpiderfyGroup.latitude,
                longitude: activeSpiderfyGroup.longitude,
                radiusPixels,
              }),
            },
          });
        }

        sortedPets.forEach((pet, index) => {
          const angle = (index / sortedPets.length) * Math.PI * 2 - Math.PI / 2;
          const point = map
            ? offsetCoordinateByPixels({
                map,
                latitude: activeSpiderfyGroup.latitude,
                longitude: activeSpiderfyGroup.longitude,
                xPixels: Math.cos(angle) * radiusPixels,
                yPixels: Math.sin(angle) * radiusPixels,
              })
            : {
                latitude: activeSpiderfyGroup.latitude,
                longitude: activeSpiderfyGroup.longitude,
              };

          nextDisplayPets.push({
            ...pet,
            displayLatitude: point.latitude,
            displayLongitude: point.longitude,
            originalLatitude: anchorPet.latitude,
            originalLongitude: anchorPet.longitude,
            sharedLocationCount: sortedPets.length,
          });
        });
        continue;
      }

      nextStackFeatures.push({
        type: "Feature",
        properties: {
          stackPetIds: groupPetIds.join(","),
          stackedCount: sortedPets.length,
          reportStatus: anchorPet.reportStatus,
        },
        geometry: {
          type: "Point",
          coordinates: [anchorPet.longitude, anchorPet.latitude],
        },
      });
    }

    return {
      displayPets: nextDisplayPets,
      sharedLocationCircles: nextSharedLocationCircles,
      soloPetFeatures: nextSoloPetFeatures,
      stackFeatures: nextStackFeatures,
    };
  }, [activeSpiderfyGroup, locationGroups, mapViewKey, selectedPetId]);

  useEffect(() => {
    if (!activeSpiderfyGroup) return;
    setMapViewKey((value) => value + 1);
  }, [activeSpiderfyGroup]);

  const selectedDisplayPet = useMemo(() => {
    if (!selectedPet) return null;

    const spiderfied = displayPets.find((pet) => pet.id === selectedPet.id);
    if (!spiderfied) return selectedPet;

    return {
      ...selectedPet,
      latitude: spiderfied.displayLatitude,
      longitude: spiderfied.displayLongitude,
    };
  }, [displayPets, selectedPet]);

  const petsGeojson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: soloPetFeatures.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          selected:
            typeof feature.properties.id === "string" &&
            feature.properties.id === selectedPetId,
        },
      })),
    };
  }, [selectedPetId, soloPetFeatures]);

  const stackGeojson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: stackFeatures,
    };
  }, [stackFeatures]);

  const spiderfiedPetsGeojson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: displayPets.map((pet) => ({
        type: "Feature" as const,
        properties: {
          id: pet.id,
          reportStatus: pet.reportStatus,
          selected: pet.id === selectedPetId,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [pet.displayLongitude, pet.displayLatitude],
        },
      })),
    };
  }, [displayPets, selectedPetId]);

  const sharedLocationsGeojson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: sharedLocationCircles,
    };
  }, [sharedLocationCircles]);

  const spiderfyCenterGeojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: activeSpiderfyGroup
        ? [
            {
              type: "Feature" as const,
              properties: {},
              geometry: {
                type: "Point" as const,
                coordinates: [
                  activeSpiderfyGroup.longitude,
                  activeSpiderfyGroup.latitude,
                ],
              },
            },
          ]
        : [],
    }),
    [activeSpiderfyGroup],
  );

  const updateBoundsFromMap = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();

    const north = Math.min(bounds.getNorth(), 49.5);
    const south = Math.max(bounds.getSouth(), 24);
    const east = Math.min(bounds.getEast(), -66);
    const west = Math.max(bounds.getWest(), -125);

    if (north <= south || east <= west) return;

    const key = [
      north.toFixed(3),
      south.toFixed(3),
      east.toFixed(3),
      west.toFixed(3),
    ].join("|");

    if (lastBoundsRef.current === key) return;

    lastBoundsRef.current = key;

    onBoundsChange({
      north,
      south,
      east,
      west,
    });
  }, [onBoundsChange]);

  const updateZoomFromMap = useCallback(() => {
    if (!mapRef.current) return;
    setMapViewKey((value) => value + 1);
  }, []);

  const scheduleBoundsUpdate = useCallback(() => {
    if (moveTimeoutRef.current) {
      window.clearTimeout(moveTimeoutRef.current);
    }

    moveTimeoutRef.current = window.setTimeout(() => {
      collapseSpiderfyIfNeeded();
      updateZoomFromMap();
      updateBoundsFromMap();
    }, 250);
  }, [collapseSpiderfyIfNeeded, updateBoundsFromMap, updateZoomFromMap]);

  const handleMapMove = useCallback(() => {
    if (!activeSpiderfyGroupRef.current) return;
    updateZoomFromMap();
  }, [updateZoomFromMap]);

  const handleMapLoad = useCallback(() => {
    updateZoomFromMap();
    updateBoundsFromMap();
  }, [updateBoundsFromMap, updateZoomFromMap]);

  useEffect(() => {
    if (!userLocation) return;
    if (initialLocationCenteredRef.current) return;

    const map = mapRef.current;
    if (!map) return;

    const zoom = map.getZoom();
    const center = map.getCenter();
    const alreadyNearUser =
      zoom >= 10 &&
      Math.hypot(
        center.lng - userLocation.longitude,
        center.lat - userLocation.latitude,
      ) < 0.5;

    initialLocationCenteredRef.current = true;

    if (alreadyNearUser) return;

    map.easeTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: Math.max(zoom, 11),
      duration: 500,
    });
  }, [userLocation]);

  useEffect(() => {
    if (!selectedPet?.id) return;
    if (lastCenteredPetIdRef.current === selectedPet.id) return;

    lastCenteredPetIdRef.current = selectedPet.id;

    mapRef.current?.easeTo({
      center: [selectedPet.longitude, selectedPet.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      duration: 450,
    });
  }, [selectedPet?.id, selectedPet?.latitude, selectedPet?.longitude]);

  useEffect(() => {
    if (!centerOnUserKey || !userLocation) return;

    lastCenteredPetIdRef.current = null;

    const map = mapRef.current;
    if (!map) return;

    map.easeTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: Math.max(map.getZoom(), 11),
      duration: 450,
    });
  }, [centerOnUserKey, userLocation]);

  useEffect(() => {
    if (resizeTimeoutRef.current) {
      window.clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = window.setTimeout(() => {
      mapRef.current?.resize();
      updateBoundsFromMap();
    }, 260);

    return () => {
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [mapResizeKey, updateBoundsFromMap]);

  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        window.clearTimeout(moveTimeoutRef.current);
      }

      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const handleMapClick = useCallback(
    (event: maplibregl.MapLayerMouseEvent) => {
      const features = event.features ?? [];
      if (features.length === 0) {
        setActiveSpiderfyGroup(null);
        return;
      }

      const map = mapRef.current;
      const source = map?.getSource("pets") as
        | maplibregl.GeoJSONSource
        | undefined;

      const stackPetIds = features
        .map((feature) => getStackPetIdsFromProperties(feature.properties))
        .find((ids): ids is string[] => Boolean(ids && ids.length > 1));

      if (stackPetIds) {
        openStackFromPetIds(
          stackPetIds,
          safePets,
          openSpiderfyGroup,
          map?.getMap() ?? null,
        );
        return;
      }

      const clusterFeature = features.find(
        (feature) =>
          feature.properties?.cluster_id !== undefined &&
          feature.properties?.cluster_id !== null,
      );

      if (clusterFeature && source) {
        const clusterId = clusterFeature.properties?.cluster_id;
        const pointCount = Number(clusterFeature.properties?.point_count ?? 0);
        const coordinates = (clusterFeature.geometry as GeoJSON.Point)
          .coordinates as [number, number];

        void source
          .getClusterLeaves(clusterId, pointCount, 0)
          .then((leaves) => {
            const clusterPets = resolvePetsFromLeaves(leaves, safePets);
            const petIds = clusterPets.map((pet) => pet.id).sort();

            if (
              clusterPets.length > 1 &&
              clusterPets.every((pet) => shareSameLocation(clusterPets[0], pet))
            ) {
              const anchorPet = clusterPets[0];
              openSpiderfyGroup(
                {
                  petIds,
                  latitude: anchorPet.latitude,
                  longitude: anchorPet.longitude,
                },
                map ? map.getZoom() < SPIDERFY_MIN_ZOOM : false,
              );
              return;
            }

            setActiveSpiderfyGroup(null);
            void source
              .getClusterExpansionZoom(clusterId)
              .then((nextZoom) => {
                map?.easeTo({
                  center: coordinates,
                  zoom: nextZoom,
                  duration: 500,
                });
              })
              .catch(() => {});
          })
          .catch(() => {});

        return;
      }

      const petFeature = features.find((feature) => feature.properties?.id);
      const petId = petFeature?.properties?.id;

      if (petId) {
        const id = String(petId);

        if (activeSpiderfyGroup?.petIds.includes(id)) {
          onPetSelect(id);
          return;
        }

        const clickedPet = safePets.find((pet) => pet.id === id);
        if (!clickedPet || !map) {
          onPetSelect(id);
          return;
        }

        const overlappingPets = safePets
          .filter((pet) => shareSameLocation(clickedPet, pet))
          .sort((left, right) => left.id.localeCompare(right.id));

        if (
          overlappingPets.length > 1 &&
          openStackFromPetIds(
            overlappingPets.map((pet) => pet.id),
            safePets,
            openSpiderfyGroup,
            map.getMap(),
          )
        ) {
          return;
        }

        setActiveSpiderfyGroup(null);
        onPetSelect(id);
      }
    },
    [activeSpiderfyGroup, onPetSelect, openSpiderfyGroup, safePets],
  );

  const handleMouseEnter = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.getCanvas().style.cursor = "pointer";
  }, []);

  const handleMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.getCanvas().style.cursor = "";
  }, []);

  const initialView = useMemo(
    () => getInitialMapView(userLocation),
    [userLocation],
  );

  const spiderfyCenterOpacity = activeSpiderfyGroup ? 1 : 0;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        minZoom={4}
        maxZoom={18}
        renderWorldCopies={false}
        initialViewState={{
          longitude: initialView.longitude,
          latitude: initialView.latitude,
          zoom: initialView.zoom,
        }}
        mapStyle={mapTilerStyle}
        interactiveLayerIds={[
          "location-stacks",
          "location-stack-count",
          "clusters",
          "unclustered-pets",
          "selected-pets",
          "spiderfied-pets",
          "selected-spiderfied-pets",
        ]}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        onMove={handleMapMove}
        onMoveEnd={scheduleBoundsUpdate}
        onZoomEnd={scheduleBoundsUpdate}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <NavigationControl position="top-right" />

        <Source
          id="shared-locations"
          type="geojson"
          data={sharedLocationsGeojson}
        >
          <Layer
            id="shared-location-ring-outline"
            type="line"
            paint={{
              "line-color": "#111827",
              "line-width": 6,
              "line-opacity": 0.9,
              "line-dasharray": [2, 1.5],
            }}
          />
          <Layer
            id="shared-location-rings"
            type="line"
            paint={{
              "line-color": "#ffffff",
              "line-width": 3.5,
              "line-opacity": 1,
              "line-dasharray": [2, 1.5],
            }}
          />
        </Source>

        <Source id="spiderfy-center" type="geojson" data={spiderfyCenterGeojson}>
          <Layer
            id="spiderfy-center-dot"
            type="circle"
            paint={{
              "circle-radius": 5,
              "circle-color": "#ffffff",
              "circle-stroke-width": 3,
              "circle-stroke-color": "#111827",
              "circle-opacity": spiderfyCenterOpacity,
            }}
          />
        </Source>

        <Source id="location-stacks-source" type="geojson" data={stackGeojson}>
          <Layer
            id="location-stacks"
            type="circle"
            paint={{
              "circle-color": [
                "case",
                ["==", ["get", "reportStatus"], "lost"],
                "#ef4444",
                "#22c55e",
              ],
              "circle-radius": [
                "step",
                ["get", "stackedCount"],
                16,
                3,
                20,
                10,
                24,
              ],
              "circle-opacity": 0.95,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            }}
          />

          <Layer
            id="location-stack-count"
            type="symbol"
            layout={{
              "text-field": ["to-string", ["get", "stackedCount"]],
              "text-size": 13,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />
        </Source>

        <Source
          id="pets"
          type="geojson"
          data={petsGeojson}
          cluster
          clusterMaxZoom={SPIDERFY_MIN_ZOOM}
          clusterRadius={48}
          promoteId="id"
        >
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#2563eb",
                25,
                "#7c3aed",
                100,
                "#dc2626",
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                18,
                25,
                24,
                100,
                32,
              ],
              "circle-opacity": 0.9,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            }}
          />

          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": ["get", "point_count_abbreviated"],
              "text-size": 13,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />

          <Layer
            id="unclustered-pets"
            type="circle"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["!=", ["get", "selected"], true],
            ]}
            paint={{
              "circle-color": [
                "case",
                ["==", ["get", "reportStatus"], "lost"],
                "#ef4444",
                "#22c55e",
              ],
              "circle-radius": 7,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.95,
            }}
          />

          <Layer
            id="selected-pets"
            type="circle"
            filter={[
              "all",
              ["!", ["has", "point_count"]],
              ["==", ["get", "selected"], true],
            ]}
            paint={{
              "circle-color": "#facc15",
              "circle-radius": 10,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>

        <Source
          id="spiderfied-pets-source"
          type="geojson"
          data={spiderfiedPetsGeojson}
        >
          <Layer
            id="spiderfied-pets"
            type="circle"
            filter={["!=", ["get", "selected"], true]}
            paint={{
              "circle-color": [
                "case",
                ["==", ["get", "reportStatus"], "lost"],
                "#ef4444",
                "#22c55e",
              ],
              "circle-radius": 10,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.98,
            }}
          />
          <Layer
            id="selected-spiderfied-pets"
            type="circle"
            filter={["==", ["get", "selected"], true]}
            paint={{
              "circle-color": "#facc15",
              "circle-radius": 12,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>

        {selectedDisplayPet ? (
          <Popup
            longitude={selectedDisplayPet.longitude}
            latitude={selectedDisplayPet.latitude}
            anchor="bottom"
            closeButton
            closeOnClick={false}
            onClose={() => onPetSelect(null)}
          >
            <strong>{selectedDisplayPet.name}</strong>
            <p style={{ margin: "4px 0 0" }}>
              {selectedDisplayPet.reportStatus === "lost"
                ? "Lost"
                : selectedDisplayPet.reportStatus === "found"
                  ? "Found"
                  : "Resolved"}{" "}
              · {selectedDisplayPet.species}
            </p>
          </Popup>
        ) : null}
      </Map>

      {loading ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 16,
            transform: "translateX(-50%)",
            zIndex: 8,
            background: "white",
            borderRadius: 999,
            padding: "10px 14px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
          }}
        >
          Loading pets...
        </div>
      ) : null}
    </div>
  );
}

export const NearbyMapPanel = memo(NearbyMapPanelBase);
