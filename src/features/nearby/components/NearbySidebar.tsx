import type { MapPet } from "../../../api/types";
import { PetCard } from "./PetCard";

type NearbySidebarProps = {
  pets: MapPet[];
  total: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedPetId: string | null;
  onPetSelect: (petId: string) => void;
};

export function NearbySidebar({
  pets,
  total,
  loading,
  error,
  onRetry,
  selectedPetId,
  onPetSelect,
}: NearbySidebarProps) {
  return (
    <aside>
      <header>
        <h2>Pets nearby</h2>
        <p>
          {loading
            ? "Loading pets..."
            : `${total.toLocaleString()} pets in this area`}
        </p>
      </header>

      {error ? (
        <div>
          <p>{error}</p>
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : null}

      <div>
        {pets.length === 0 && !loading && !error ? (
          <p>No pets found in this area.</p>
        ) : null}

        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            selected={pet.id === selectedPetId}
            onSelect={onPetSelect}
          />
        ))}
      </div>
    </aside>
  );
}