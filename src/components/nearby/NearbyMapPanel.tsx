import { memo, useCallback, useEffect, useMemo, useRef } from "react";
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

type UserLocation = {
  latitude: number;
  longitude: number;
};

type NearbyMapPanelProps = {
  pets: MapMarkerPet[];
  selectedPetId: string | null;
  selectedPet: MapMarkerPet | null;
  userLocation: UserLocation | null;
  loading?: boolean;
  centerOnUserKey?: string | null;
  onBoundsChange: (bounds: MapBounds) => void;
  onPetSelect: (petId: string | null) => void;
  onViewChange?: (view: {
    latitude: number;
    longitude: number;
    zoom: number;
  }) => void;
  mapResizeKey?: string | number | boolean;
};

function getInitialMapView(userLocation: UserLocation | null) {
  return {
    latitude: userLocation?.latitude ?? 39.8283,
    longitude: userLocation?.longitude ?? -98.5795,
    zoom: userLocation ? 11 : 4,
  };
}

function NearbyMapPanelBase({
  pets,
  selectedPetId,
  selectedPet,
  userLocation,
  loading = false,
  onBoundsChange,
  onPetSelect,
  mapResizeKey,
}: NearbyMapPanelProps) {
  const mapRef = useRef<MapRef | null>(null);
  const moveTimeoutRef = useRef<number | null>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  const lastBoundsRef = useRef("");
  const lastCenteredPetIdRef = useRef<string | null>(null);

  const safePets = useMemo(() => {
    return pets.filter((pet) => {
      return (
        Number.isFinite(pet.latitude) &&
        Number.isFinite(pet.longitude) &&
        pet.latitude >= 24 &&
        pet.latitude <= 50 &&
        pet.longitude >= -125 &&
        pet.longitude <= -66
      );
    });
  }, [pets]);

  const geojson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: safePets.map((pet) => ({
        type: "Feature" as const,
        properties: {
          id: pet.id,
          species: pet.species,
          reportStatus: pet.reportStatus,
          selected: pet.id === selectedPetId,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [pet.longitude, pet.latitude],
        },
      })),
    };
  }, [safePets, selectedPetId]);

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

  const scheduleBoundsUpdate = useCallback(() => {
    if (moveTimeoutRef.current) {
      window.clearTimeout(moveTimeoutRef.current);
    }

    moveTimeoutRef.current = window.setTimeout(() => {
      updateBoundsFromMap();
    }, 250);
  }, [updateBoundsFromMap]);

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
      const feature = event.features?.[0];
      if (!feature) return;

      const clusterId = feature.properties?.cluster_id;
      const petId = feature.properties?.id;

      const map = mapRef.current;
      const source = map?.getSource("pets") as
        | maplibregl.GeoJSONSource
        | undefined;

      if (clusterId && source) {
        void source
          .getClusterExpansionZoom(clusterId)
          .then((zoom) => {
            const coordinates = (feature.geometry as GeoJSON.Point).coordinates;

            map?.easeTo({
              center: coordinates as [number, number],
              zoom,
              duration: 500,
            });
          })
          .catch(() => {});

        return;
      }

      if (petId) {
        onPetSelect(String(petId));
      }
    },
    [onPetSelect],
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
        interactiveLayerIds={["clusters", "unclustered-pets", "selected-pets"]}
        onClick={handleMapClick}
        onLoad={updateBoundsFromMap}
        onMoveEnd={scheduleBoundsUpdate}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <NavigationControl position="top-right" />

        <Source
          id="pets"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={13}
          clusterRadius={48}
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

        {selectedPet ? (
          <Popup
            longitude={selectedPet.longitude}
            latitude={selectedPet.latitude}
            anchor="bottom"
            closeButton
            closeOnClick={false}
            onClose={() => onPetSelect(null)}
          >
            <strong>
              {selectedPet.reportStatus === "lost"
                ? "Lost pet"
                : selectedPet.reportStatus === "found"
                  ? "Found pet"
                  : "Resolved pet"}
            </strong>
            <p style={{ margin: "4px 0 0" }}>{selectedPet.species}</p>
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
