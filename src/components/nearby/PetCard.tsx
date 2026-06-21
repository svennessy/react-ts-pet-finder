import type { MapPet, PetPhoto } from "../../types/pets";
import { FavoriteButton } from "../favorites/FavoriteButton";
import { Badge } from "../ui/Badge";
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
  const statusLabel =
    pet.reportStatus === "lost"
      ? "Lost"
      : pet.reportStatus === "found"
        ? "Found"
        : "Resolved";

  const photos = (pet.photos ?? []).filter((photo) => {
    if (!("petId" in photo)) return true;
    return String(photo.petId) === String(pet.id);
  });

  const currentPhoto = photos[0] ?? null;

  if (pet.id === "40015" || pet.id === "40016") {
    console.log("IMAGE SRC", {
      petId: pet.id,
      name: pet.name,
      photoCount: photos.length,
      currentPhotoId: currentPhoto?.id,
      currentPhotoPetId: currentPhoto?.petId,
      currentPhotoPath:
        currentPhoto?.resolvedUrl ??
        currentPhoto?.imageUrl ??
        currentPhoto?.imagePath,
    });
  }

  if (pet.name === "Goose" || pet.name === "Willy") {
    console.log("PET CARD RENDER", {
      petId: pet.id,
      name: pet.name,
      photos: photos.map((photo) => ({
        id: photo.id,
        petId: photo.petId,
        imagePath: photo.imagePath,
        resolvedUrl: photo.resolvedUrl,
        imageUrl: photo.imageUrl,
      })),
      currentPhoto,
    });
  }

  const location =
    pet.locationLabel ||
    (pet.owner?.city
      ? `${pet.owner.city.name}, ${pet.owner.city.stateCode}`
      : `${pet.latitude.toFixed(4)}, ${pet.longitude.toFixed(4)}`);

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
            {pet.species}
            {pet.createdAt && <> · {formatRelativeTime(pet.createdAt)}</>}
            {location && <> · {location}</>}
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
              zIndex: 5,
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
