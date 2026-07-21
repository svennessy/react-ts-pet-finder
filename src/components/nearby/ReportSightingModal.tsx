import { useEffect, useState } from "react";
import type { UserLocation } from "../../types/map";
import { PostPetLocationPicker } from "../post-pet/PostPetLocationPicker";

type ReportSightingModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    latitude: number;
    longitude: number;
    notes: string;
  }) => Promise<void>;
  defaultLocation: {
    latitude: number;
    longitude: number;
  };
  userLocation?: UserLocation | null;
  saving: boolean;
};

export function ReportSightingModal({
  open,
  onClose,
  onSubmit,
  defaultLocation,
  userLocation = null,
  saving,
}: ReportSightingModalProps) {
  const [latitude, setLatitude] = useState(defaultLocation.latitude);
  const [longitude, setLongitude] = useState(defaultLocation.longitude);
  const [notes, setNotes] = useState("");
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    if (!open) return;

    setLatitude(defaultLocation.latitude);
    setLongitude(defaultLocation.longitude);
    setNotes("");
    setSessionKey((value) => value + 1);
  }, [open, defaultLocation.latitude, defaultLocation.longitude]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <section
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          background: "white",
          borderRadius: 18,
          padding: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          display: "grid",
          gap: 14,
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 4px" }}>Report a sighting</h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
            Drop a pin where you saw the pet, then drag it to adjust.
          </p>
        </div>

        <PostPetLocationPicker
          mapKey={sessionKey}
          latitude={latitude}
          longitude={longitude}
          userLocation={userLocation}
          onChange={(location) => {
            setLatitude(location.latitude);
            setLongitude(location.longitude);
          }}
        />

        <label style={{ display: "grid", gap: 6 }}>
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Where did you see the pet?"
            rows={3}
            style={{
              width: "100%",
              resize: "vertical",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              padding: 10,
              font: "inherit",
            }}
          />
        </label>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              onSubmit({
                latitude,
                longitude,
                notes,
              })
            }
          >
            {saving ? "Saving..." : "Submit sighting"}
          </button>
        </div>
      </section>
    </div>
  );
}
