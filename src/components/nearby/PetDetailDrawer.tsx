import { useEffect, useState } from "react";
import type { PetDetail, PetPhoto } from "../../types/pets";
import { formatRelativeTime } from "../../utils/nearby/formatRelativeTime";
import { Badge } from "../ui/Badge";
import { FavoriteButton } from "../favorites/FavoriteButton";

type PetDetailDrawerProps = {
  pet: PetDetail | null;
  onClose: () => void;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: (petId: string) => void;
  onEdit?: () => void;
  onResolve?: (petId: string) => void;
  resolving?: boolean;
  loading?: boolean;
  onReportSighting?: () => void;
  isFavorite?: boolean;
  favoriteLoading?: boolean;
  onToggleFavorite?: (petId: string) => void | Promise<void>;
};

function DrawerCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close pet details"
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        width: 34,
        height: 34,
        border: 0,
        borderRadius: 999,
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        cursor: "pointer",
        fontSize: 18,
        fontWeight: 800,
        lineHeight: 1,
        zIndex: 20,
      }}
    >
      ×
    </button>
  );
}

function getPhotoUrl(photo: PetPhoto) {
  return photo.resolvedUrl ?? photo.imageUrl ?? photo.imagePath;
}

function compactButtonStyle(background: string, disabled = false) {
  return {
    border: 0,
    borderRadius: 999,
    padding: "10px 12px",
    background,
    color: "white",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
  };
}

export function PetDetailDrawer({
  pet,
  onClose,
  canDelete = false,
  deleting = false,
  onDelete,
  onEdit,
  onResolve,
  resolving = false,
  loading = false,
  onReportSighting,
  isFavorite = false,
  favoriteLoading = false,
  onToggleFavorite,
}: PetDetailDrawerProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPhotoIndex(0);
  }, [pet?.id]);

  if (loading) {
    return (
      <aside
        style={{
          position: "absolute",
          right: 16,
          top: 16,
          width: 420,
          background: "white",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        <DrawerCloseButton onClose={onClose} />
        <p>Loading pet details...</p>
      </aside>
    );
  }

  if (!pet?.id) return null;

  const petId = String(pet.id);

  const statusLabel =
    pet.reportStatus === "lost"
      ? "Lost"
      : pet.reportStatus === "found"
        ? "Found"
        : "Resolved";

  const photos = pet.photos ?? [];
  const currentPhoto = photos[photoIndex] ?? null;

  const location =
    pet.locationLabel ||
    (pet.cityName && pet.stateCode
      ? `${pet.cityName}, ${pet.stateCode}`
      : pet.cityName) ||
    (pet.owner?.city
      ? `${pet.owner.city.name}, ${pet.owner.city.stateCode}`
      : `${pet.latitude.toFixed(4)}, ${pet.longitude.toFixed(4)}`);

  return (
    <aside
      style={{
        position: "absolute",
        right: 16,
        bottom: 16,
        width: 420,
        maxHeight: "70vh",
        overflow: "auto",
        background: "white",
        borderRadius: 16,
        boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
        zIndex: 10,
      }}
    >
      <DrawerCloseButton onClose={onClose} />

      {currentPhoto ? (
        <div style={{ position: "relative" }}>
          <img
            key={`${petId}-${currentPhoto.id}-${getPhotoUrl(currentPhoto)}`}
            src={getPhotoUrl(currentPhoto)}
            alt={pet.name}
            style={{
              width: "100%",
              height: 220,
              objectFit: "cover",
              display: "block",
            }}
          />

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setPhotoIndex((index) =>
                    index === 0 ? photos.length - 1 : index - 1,
                  )
                }
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() =>
                  setPhotoIndex((index) =>
                    index === photos.length - 1 ? 0 : index + 1,
                  )
                }
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                ›
              </button>

              <div
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: 10,
                  background: "rgba(0,0,0,0.65)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                }}
              >
                {photoIndex + 1}/{photos.length}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              lineHeight: 1.15,
            }}
          >
            {pet.name}
          </h2>

          {onToggleFavorite ? (
            <FavoriteButton
              isFavorite={isFavorite}
              loading={favoriteLoading}
              onClick={() => onToggleFavorite(petId)}
            />
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            color: "#6b7280",
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          <Badge variant={pet.reportStatus}>{statusLabel}</Badge>
          <span>{pet.species}</span>

          {pet.createdAt ? (
            <>
              <span>•</span>
              <span>{formatRelativeTime(pet.createdAt)}</span>
            </>
          ) : null}
        </div>

        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{pet.breedLabel}</p>

        <p style={{ margin: 0, color: "#6b7280" }}>{location}</p>

        {pet.description ? (
          <>
            <h3 style={{ margin: "12px 0 4px", fontSize: 15 }}>Description</h3>
            <p style={{ margin: 0, color: "#374151", lineHeight: 1.45 }}>
              {pet.description}
            </p>
          </>
        ) : null}

        {pet.owner ? (
          <>
            <h3 style={{ margin: "12px 0 4px", fontSize: 15 }}>Reported By</h3>
            <p style={{ margin: 0, color: "#374151" }}>
              {pet.owner.firstName} {pet.owner.lastName}
            </p>
          </>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 14,
          }}
        >
          {onReportSighting && pet.reportStatus !== "resolved" ? (
            <button
              type="button"
              onClick={onReportSighting}
              style={compactButtonStyle("#f97316")}
            >
              Report sighting
            </button>
          ) : null}

          {canDelete && pet.reportStatus !== "resolved" && onResolve ? (
            <button
              type="button"
              disabled={resolving}
              onClick={() => {
                const confirmed = window.confirm(
                  "Mark this report as resolved?",
                );

                if (confirmed) {
                  onResolve(petId);
                }
              }}
              style={compactButtonStyle("#16a34a", resolving)}
            >
              {resolving ? "Updating..." : "Mark resolved"}
            </button>
          ) : null}

          {canDelete && onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              style={compactButtonStyle("#2563eb")}
            >
              Edit report
            </button>
          ) : null}

          {canDelete && onDelete ? (
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                const confirmed = window.confirm(
                  "Delete this pet report? This cannot be undone.",
                );

                if (confirmed) {
                  onDelete(petId);
                }
              }}
              style={compactButtonStyle("#dc2626", deleting)}
            >
              {deleting ? "Deleting..." : "Delete report"}
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
