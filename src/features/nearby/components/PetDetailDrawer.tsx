import { useEffect, useState } from "react";
import type { MapPet, PetPhoto } from "../../../api/types";

type PetDetailDrawerProps = {
  pet: MapPet | null;
  onClose: () => void;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: (petId: string) => void;
  onEdit?: () => void;
  onResolve?: (petId: string) => void;
  resolving?: boolean;
};

function getPhotoUrl(photo: PetPhoto) {
  return photo.resolvedUrl ?? photo.imageUrl ?? photo.imagePath;
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
}: PetDetailDrawerProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPhotoIndex(0);
  }, [pet?.id]);

  if (!pet) return null;

  const statusLabel = pet.reportStatus === "lost" ? "Lost" : "Found";
  const photos = pet.photos ?? [];
  const currentPhoto = photos[photoIndex] ?? null;

  const location =
    pet.locationLabel ||
    (pet.owner?.city
      ? `${pet.owner.city.name}, ${pet.owner.city.stateCode}`
      : `${pet.latitude.toFixed(4)}, ${pet.longitude.toFixed(4)}`);

  return (
    <aside
      style={{
        position: "absolute",
        right: 16,
        top: 16,
        width: 360,
        maxHeight: "calc(100vh - 32px)",
        overflow: "auto",
        background: "white",
        borderRadius: 16,
        boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
        zIndex: 10,
      }}
    >
      {currentPhoto ? (
        <div style={{ position: "relative" }}>
          <img
            src={getPhotoUrl(currentPhoto)}
            alt={pet.name}
            style={{
              width: "100%",
              height: 240,
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
        <button type="button" onClick={onClose}>
          Close
        </button>

        <h2>{pet.name}</h2>

        <p>
          <strong>{statusLabel}</strong> · {pet.species}
        </p>

        <p>{pet.breedLabel}</p>
        <p>{location}</p>

        {pet.description ? (
          <>
            <h3>Description</h3>
            <p>{pet.description}</p>
          </>
        ) : null}

        {pet.owner ? (
          <>
            <h3>Reported By</h3>
            <p>
              {pet.owner.firstName} {pet.owner.lastName}
            </p>
          </>
        ) : null}

        {canDelete && pet.reportStatus !== "resolved" && onResolve ? (
          <button
            type="button"
            disabled={resolving}
            onClick={() => {
              const confirmed = window.confirm("Mark this report as resolved?");

              if (confirmed) {
                onResolve(pet.id);
              }
            }}
            style={{
              marginTop: 16,
              width: "100%",
              border: 0,
              borderRadius: 999,
              padding: "12px 16px",
              background: "#16a34a",
              color: "white",
              fontWeight: 700,
            }}
          >
            {resolving ? "Updating..." : "Mark resolved"}
          </button>
        ) : null}
        {canDelete && onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            style={{
              marginTop: 16,
              width: "100%",
              border: 0,
              borderRadius: 999,
              padding: "12px 16px",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
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
                onDelete(pet.id);
              }
            }}
            style={{
              marginTop: 16,
              width: "100%",
              border: 0,
              borderRadius: 999,
              padding: "12px 16px",
              background: "#dc2626",
              color: "white",
              fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            {deleting ? "Deleting..." : "Delete report"}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
