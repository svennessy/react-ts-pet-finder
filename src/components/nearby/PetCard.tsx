import { useState } from "react";
import type { MapPet, PetPhoto } from "../../types/pets";
import { formatRelativeTime } from "../../utils/nearby/formatRelativeTime";

type PetCardProps = {
  pet: MapPet & {
    photos?: PetPhoto[];
    owner?: {
      city?: {
        name: string;
        stateCode: string;
      };
    };
  };
  selected: boolean;
  onSelect: (petId: string) => void;
};

function getPhotoUrl(photo: PetPhoto) {
  return photo.resolvedUrl ?? photo.imageUrl ?? photo.imagePath;
}

export function PetCard({ pet, selected, onSelect }: PetCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

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
    (pet.owner?.city
      ? `${pet.owner.city.name}, ${pet.owner.city.stateCode}`
      : `${pet.latitude.toFixed(4)}, ${pet.longitude.toFixed(4)}`);

  return (
    <article
      onClick={() => onSelect(pet.id)}
      style={{
        border: selected ? "2px solid #2563eb" : "1px solid #ddd",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        background: "white",
        marginBottom: 12,
        boxShadow: selected
          ? "0 8px 24px rgba(37, 99, 235, 0.25)"
          : "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {currentPhoto ? (
        <div style={{ position: "relative" }}>
          <img
            src={getPhotoUrl(currentPhoto)}
            alt={pet.name}
            style={{
              width: "100%",
              height: 190,
              objectFit: "cover",
              display: "block",
            }}
          />

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPhotoIndex((index) =>
                    index === 0 ? photos.length - 1 : index - 1,
                  );
                }}
                style={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPhotoIndex((index) =>
                    index === photos.length - 1 ? 0 : index + 1,
                  );
                }}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                ›
              </button>

              <div
                style={{
                  position: "absolute",
                  right: 8,
                  bottom: 8,
                  background: "rgba(0,0,0,0.65)",
                  color: "white",
                  padding: "3px 7px",
                  borderRadius: 999,
                  fontSize: 12,
                }}
              >
                {photoIndex + 1}/{photos.length}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div
          style={{
            height: 160,
            display: "grid",
            placeItems: "center",
            background: "#f3f4f6",
            color: "#6b7280",
          }}
        >
          No photo
        </div>
      )}

      <div style={{ padding: 14 }}>
        <strong
          style={{
            color: pet.reportStatus === "lost" ? "#dc2626" : "#16a34a",
          }}
        >
          {statusLabel}
        </strong>

        <h3 style={{ margin: "8px 0 4px" }}>{pet.name}</h3>

        <p style={{ margin: "0 0 6px", color: "#6b7280", fontSize: 13 }}>
          {statusLabel} • {formatRelativeTime(pet.createdAt)}
        </p>

        <p style={{ margin: 0 }}>{pet.breedLabel}</p>

        <p style={{ margin: "6px 0 0", color: "#6b7280" }}>{location}</p>
      </div>
    </article>
  );
}
