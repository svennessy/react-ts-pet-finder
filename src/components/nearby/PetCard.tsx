import { useEffect, useState } from "react";
import type { PetPhoto, SidebarPet } from "../../types/pets";
import { FavoriteButton } from "../favorites/FavoriteButton";
import { Badge } from "../ui/Badge";
import { formatRelativeTime } from "../../utils/nearby/formatRelativeTime";

type PetCardProps = {
  pet: SidebarPet;
  selected: boolean;
  onSelect: (petId: string) => void;
  isFavorite?: boolean;
  favoriteLoading?: boolean;
  onToggleFavorite?: (petId: string) => void | Promise<void>;
};

function getPhotoUrl(photo: PetPhoto) {
  return photo.resolvedUrl ?? photo.imageUrl ?? photo.imagePath;
}

export function PetCard({
  pet,
  selected,
  onSelect,
  isFavorite = false,
  favoriteLoading = false,
  onToggleFavorite,
}: PetCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPhotoIndex(0);
  }, [pet.id]);

  const statusLabel =
    pet.reportStatus === "lost"
      ? "Lost"
      : pet.reportStatus === "found"
        ? "Found"
        : "Resolved";

  const photos = pet.photos.filter((photo) => {
    return String(photo.petId) === String(pet.id);
  });

  const currentPhoto = photos[photoIndex] ?? null;
  const hasMultiplePhotos = photos.length > 1;

  const location =
    pet.locationLabel || `${pet.latitude.toFixed(4)}, ${pet.longitude.toFixed(4)}`;

  function showPreviousPhoto(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    setPhotoIndex((index) => (index === 0 ? photos.length - 1 : index - 1));
  }

  function showNextPhoto(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    setPhotoIndex((index) => (index === photos.length - 1 ? 0 : index + 1));
  }

  return (
    <article
      onClick={() => onSelect(pet.id)}
      style={{
        border: selected ? "2px solid #2563eb" : "1px solid #e5e7eb",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        background: "white",
        margin: "0 8px 12px",
        boxShadow: selected
          ? "0 8px 22px rgba(37, 99, 235, 0.2)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 230,
          background: "#f3f4f6",
          color: "#6b7280",
        }}
      >
        {currentPhoto ? (
          <img
            key={`${pet.id}-${currentPhoto.id}`}
            src={getPhotoUrl(currentPhoto)}
            alt={pet.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "grid",
              placeItems: "center",
            }}
          >
            No photo
          </div>
        )}

        {hasMultiplePhotos ? (
          <>
            <button
              type="button"
              onClick={showPreviousPhoto}
              aria-label="Previous pet photo"
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 6,
                width: 34,
                height: 34,
                border: 0,
                borderRadius: 999,
                background: "rgba(255,255,255,0.92)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
                cursor: "pointer",
                fontSize: 24,
                lineHeight: 1,
                fontWeight: 800,
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={showNextPhoto}
              aria-label="Next pet photo"
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 6,
                width: 34,
                height: 34,
                border: 0,
                borderRadius: 999,
                background: "rgba(255,255,255,0.92)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
                cursor: "pointer",
                fontSize: 24,
                lineHeight: 1,
                fontWeight: 800,
              }}
            >
              ›
            </button>

            <div
              style={{
                position: "absolute",
                right: 10,
                bottom: 86,
                zIndex: 6,
                background: "rgba(0,0,0,0.68)",
                color: "white",
                padding: "4px 8px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {photoIndex + 1}/{photos.length}
            </div>
          </>
        ) : null}

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "44px 12px 12px",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0))",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <Badge variant={pet.reportStatus}>{statusLabel}</Badge>

            <strong
              style={{
                fontSize: 17,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pet.name}
            </strong>
          </div>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: 12,
              opacity: 0.92,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pet.species} · {formatRelativeTime(pet.createdAt)} · {location}
          </p>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              fontWeight: 700,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pet.breedLabel}
          </p>
        </div>

        {onToggleFavorite ? (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 7,
            }}
          >
            <FavoriteButton
              isFavorite={isFavorite}
              loading={favoriteLoading}
              onClick={() => onToggleFavorite(pet.id)}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
