import { Link } from "react-router-dom";
import type { SidebarPet } from "../../types/pets";
import { FavoriteButton } from "../favorites/FavoriteButton";
import { Card } from "../ui/Card";

type RecentPetCardProps = {
  pet: SidebarPet;
  isFavorite?: boolean;
  favoriteLoading?: boolean;
  onFavoriteClick?: () => void | Promise<void>;
};

export function RecentPetCard({
  pet,
  isFavorite = false,
  favoriteLoading = false,
  onFavoriteClick,
}: RecentPetCardProps) {
  const statusLabel =
    pet.reportStatus === "lost"
      ? "Lost"
      : pet.reportStatus === "found"
        ? "Found"
        : "Resolved";

  return (
    <Link
      to={`/nearby?pet=${pet.id}&lat=${pet.latitude}&lng=${pet.longitude}&zoom=13`}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <Card
        style={{
          padding: 18,
          position: "relative",
        }}
      >
        {onFavoriteClick ? (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
            }}
            onClick={(event) => event.preventDefault()}
          >
            <FavoriteButton
              isFavorite={isFavorite}
              loading={favoriteLoading}
              onClick={onFavoriteClick}
            />
          </div>
        ) : null}

        <strong>{statusLabel}</strong>

        <h3 style={{ margin: "8px 0 4px" }}>{pet.name}</h3>

        <p
          style={{
            margin: 0,
            color: "#6b7280",
          }}
        >
          {pet.breedLabel}
        </p>
      </Card>
    </Link>
  );
}
