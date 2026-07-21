import Map, { Marker, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import { useCallback, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type UserLocation = {
  latitude: number;
  longitude: number;
};

type PostPetLocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  userLocation?: UserLocation | null;
  onChange: (location: { latitude: number; longitude: number }) => void;
  /** Remount map when this changes (e.g. modal open / pet id). */
  mapKey?: string | number;
};

const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;

const mapTilerStyle =
  `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerKey}`;

function LocationPin() {
  return (
    <div
      style={{
        width: 28,
        height: 36,
        display: "grid",
        placeItems: "start center",
        cursor: "grab",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
        userSelect: "none",
      }}
      title="Drag to adjust location"
    >
      <svg width="28" height="36" viewBox="0 0 28 36" aria-hidden="true">
        <path
          d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z"
          fill="#ef4444"
        />
        <circle cx="14" cy="14" r="5.5" fill="#ffffff" />
      </svg>
    </div>
  );
}

export function PostPetLocationPicker({
  latitude,
  longitude,
  userLocation,
  onChange,
  mapKey,
}: PostPetLocationPickerProps) {
  const mapRef = useRef<MapRef | null>(null);

  const useMyLocation = useCallback(() => {
    if (!userLocation) return;

    onChange({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    });

    mapRef.current?.easeTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 13,
      duration: 600,
    });
  }, [userLocation, onChange]);

  const hasPin = latitude !== null && longitude !== null;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ height: 260, borderRadius: 14, overflow: "hidden" }}>
        <Map
          key={mapKey}
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={{
            longitude: longitude ?? userLocation?.longitude ?? -98.5795,
            latitude: latitude ?? userLocation?.latitude ?? 39.8283,
            zoom: hasPin ? 14 : userLocation ? 11 : 3,
          }}
          mapStyle={mapTilerStyle}
          cursor="crosshair"
          onClick={(event) => {
            onChange({
              latitude: event.lngLat.lat,
              longitude: event.lngLat.lng,
            });
          }}
        >
          <NavigationControl position="top-right" />

          {hasPin ? (
            <Marker
              latitude={latitude}
              longitude={longitude}
              anchor="bottom"
              draggable
              onDrag={(event) => {
                onChange({
                  latitude: event.lngLat.lat,
                  longitude: event.lngLat.lng,
                });
              }}
              onDragEnd={(event) => {
                onChange({
                  latitude: event.lngLat.lat,
                  longitude: event.lngLat.lng,
                });
              }}
            >
              <LocationPin />
            </Marker>
          ) : null}
        </Map>
      </div>

      <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
        {hasPin
          ? `Selected: ${latitude!.toFixed(5)}, ${longitude!.toFixed(5)} — drag the pin or click the map to adjust.`
          : "Click the map to drop a pin, then drag it to fine-tune."}
      </p>

      {userLocation ? (
        <button type="button" onClick={useMyLocation}>
          Use my current location
        </button>
      ) : null}
    </div>
  );
}
