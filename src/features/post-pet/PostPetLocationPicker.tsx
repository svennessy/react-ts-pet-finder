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
};

const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;

const mapTilerStyle =
  `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerKey}`;

export function PostPetLocationPicker({
  latitude,
  longitude,
  userLocation,
  onChange,
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

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ height: 260, borderRadius: 14, overflow: "hidden" }}>
        <Map
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={{
            longitude: longitude ?? userLocation?.longitude ?? -98.5795,
            latitude: latitude ?? userLocation?.latitude ?? 39.8283,
            zoom: latitude && longitude ? 13 : userLocation ? 11 : 3,
          }}
          mapStyle={mapTilerStyle}
          onClick={(event) => {
            onChange({
              latitude: event.lngLat.lat,
              longitude: event.lngLat.lng,
            });
          }}
        >
          <NavigationControl position="top-right" />

          {latitude !== null && longitude !== null ? (
            <Marker latitude={latitude} longitude={longitude} anchor="bottom" />
          ) : null}
        </Map>
      </div>

      {userLocation ? (
        <button type="button" onClick={useMyLocation}>
          Use my current location
        </button>
      ) : null}
    </div>
  );
}