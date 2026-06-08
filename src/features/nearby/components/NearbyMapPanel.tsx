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
import type { MapBounds, MapPet } from "../../../api/types";

const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;

const mapTilerStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerKey}`;

type UserLocation = {
  latitude: number;
  longitude: number;
};

type NearbyMapPanelProps = {
  pets: MapPet[];
  selectedPetId: string | null;
  selectedPet: MapPet | null;
  userLocation: UserLocation | null;
  onBoundsChange: (bounds: MapBounds) => void;
  onPetSelect: (petId: string | null) => void;
};

function NearbyMapPanelBase({
  pets,
  selectedPetId,
  selectedPet,
  userLocation,
  onBoundsChange,
  onPetSelect,
}: NearbyMapPanelProps) {
  const mapRef = useRef<MapRef | null>(null);
  const lastFlownPetIdRef = useRef<string | null>(null);
  const hasCenteredOnUserRef = useRef(false);

  const geojson = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: pets.map((pet) => ({
        type: "Feature" as const,
        properties: {
          id: pet.id,
          name: pet.name,
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
  }, [pets, selectedPetId]);

  const updateBoundsFromMap = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();

    onBoundsChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
  }, [onBoundsChange]);

  const recenterToUser = useCallback(() => {
    if (!userLocation) return;

    const map = mapRef.current;
    if (!map) return;

    map.easeTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 11,
      duration: 700,
    });
  }, [userLocation]);

  useEffect(() => {
    if (!userLocation) return;
    if (hasCenteredOnUserRef.current) return;

    hasCenteredOnUserRef.current = true;
    recenterToUser();
  }, [userLocation, recenterToUser]);

  useEffect(() => {
    if (!selectedPet) return;
    if (lastFlownPetIdRef.current === selectedPet.id) return;

    lastFlownPetIdRef.current = selectedPet.id;

    const map = mapRef.current;
    if (!map) return;

    map.easeTo({
      center: [selectedPet.longitude, selectedPet.latitude],
      zoom: Math.max(map.getZoom(), 12),
      duration: 600,
    });
  }, [selectedPet?.id, selectedPet]);

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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{
          longitude: userLocation?.longitude ?? -98.5795,
          latitude: userLocation?.latitude ?? 39.8283,
          zoom: userLocation ? 11 : 4,
        }}
        mapStyle={mapTilerStyle}
        interactiveLayerIds={["clusters", "unclustered-pets", "selected-pets"]}
        onClick={handleMapClick}
        onLoad={updateBoundsFromMap}
        onMoveEnd={updateBoundsFromMap}
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
            <strong>{selectedPet.name}</strong>
            <p style={{ margin: "4px 0 0" }}>
              {selectedPet.reportStatus} · {selectedPet.species} ·{" "}
              {selectedPet.breedLabel}
            </p>
          </Popup>
        ) : null}
      </Map>

      {userLocation ? (
        <button
          type="button"
          onClick={recenterToUser}
          style={{
            position: "absolute",
            right: 16,
            bottom: 32,
            zIndex: 5,
            border: 0,
            borderRadius: 999,
            padding: "10px 14px",
            background: "white",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          }}
        >
          Near me
        </button>
      ) : null}
    </div>
  );
}

export const NearbyMapPanel = memo(NearbyMapPanelBase);
