import { Link } from "react-router-dom";
import { RequireAuth } from "../components/auth/RequireAuth";
import { RecentPetCard } from "../components/pets/RecentPetCard";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { EmptyState } from "../components/ui/EmptyState";
import { Section } from "../components/ui/Section";
import { useFavorites } from "../hooks/favorites/useFavorites";

export function FavoritesPage() {
  const { favorites, loading, remove, isPending } = useFavorites();

  return (
    <main>
      <RequireAuth
        title="Sign in to view saved pets"
        description="Saved pets are tied to your Spot account."
      >
        <Section>
          <Container>
            <h1>Saved Pets</h1>

            {loading ? (
              <p>Loading saved pets...</p>
            ) : favorites.length === 0 ? (
              <EmptyState
                title="No saved pets yet"
                description="When you save a lost or found pet, it will appear here."
                action={
                  <Link to="/nearby?nearMe=1">
                    <Button>Browse nearby pets</Button>
                  </Link>
                }
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 16,
                  marginTop: 24,
                }}
              >
                {favorites.map((pet) => (
                  <RecentPetCard
                    key={pet.id}
                    pet={pet}
                    isFavorite
                    favoriteLoading={isPending(pet.id)}
                    onFavoriteClick={() => remove(pet.id)}
                  />
                ))}
              </div>
            )}
          </Container>
        </Section>
      </RequireAuth>
    </main>
  );
}
