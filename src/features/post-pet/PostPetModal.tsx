import type { PostPetDraft } from "./types";
import { PostPetForm } from "./PostPetForm";

type UserLocation = {
  latitude: number;
  longitude: number;
};

type PostPetModalProps = {
  open: boolean;
  value: PostPetDraft;
  onChange: (value: PostPetDraft) => void;
  onClose: () => void;
  userLocation: UserLocation | null;
  onSubmit: () => void;
  saving: boolean;
};

export function PostPetModal({
  open,
  value,
  onChange,
  onClose,
  userLocation,
  onSubmit,
  saving,
}: PostPetModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
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
          maxHeight: "90vh",
          overflow: "auto",
          background: "white",
          borderRadius: 18,
          padding: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Post a pet</h2>
            <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
              Create a lost or found pet report.
            </p>
          </div>

          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <PostPetForm
          value={value}
          onChange={onChange}
          userLocation={userLocation}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          style={{
            marginTop: 16,
            width: "100%",
            border: 0,
            borderRadius: 999,
            padding: "12px 16px",
            background: saving ? "#9ca3af" : "#2563eb",
            color: "white",
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save report"}
        </button>
      </section>
    </div>
  );
}