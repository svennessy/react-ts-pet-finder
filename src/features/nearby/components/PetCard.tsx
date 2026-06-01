import type { MapPet } from "../../../api/types";

type PetCardProps = {
  pet: MapPet;
  selected: boolean;
  onSelect: (petId: string) => void;
};

export function PetCard({ pet, selected, onSelect }: PetCardProps) {
  const statusLabel = pet.reportStatus === "lost" ? "Lost" : "Found";

  return (
    <article
      onClick={() => onSelect(pet.id)}
      style={{
        border: selected ? "2px solid #2563eb" : "1px solid #ddd",
        padding: 12,
        cursor: "pointer",
      }}
    >
      <div>
        <strong>{statusLabel}</strong>
        <span> · {pet.species}</span>
      </div>

      <h3>{pet.name}</h3>

      <p>{pet.breedLabel}</p>

      <p>
        {pet.latitude.toFixed(4)}, {pet.longitude.toFixed(4)}
      </p>
    </article>
  );
}
