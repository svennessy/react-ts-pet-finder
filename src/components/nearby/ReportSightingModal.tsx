import { useState } from "react";

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
  saving: boolean;
};

export function ReportSightingModal({
  open,
  onClose,
  onSubmit,
  defaultLocation,
  saving,
}: ReportSightingModalProps) {
  const [latitude, setLatitude] = useState(defaultLocation.latitude);
  const [longitude, setLongitude] = useState(defaultLocation.longitude);
  const [notes, setNotes] = useState("");

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
          width: "min(440px, 100%)",
          background: "white",
          borderRadius: 18,
          padding: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <h2>Report a sighting</h2>

        <label>
          Latitude
          <input
            value={latitude}
            type="number"
            onChange={(event) => setLatitude(Number(event.target.value))}
          />
        </label>

        <label>
          Longitude
          <input
            value={longitude}
            type="number"
            onChange={(event) => setLongitude(Number(event.target.value))}
          />
        </label>

        <label>
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Where did you see the pet?"
            rows={4}
          />
        </label>

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
      </section>
    </div>
  );
}