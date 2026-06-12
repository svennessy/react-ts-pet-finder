import type { PostPetDraft } from "./types";
import { PostPetLocationPicker } from "./PostPetLocationPicker";
import { PostPetPhotoUpload } from "./PostPetPhotoUpload";

type UserLocation = {
  latitude: number;
  longitude: number;
};

type PostPetFormProps = {
  value: PostPetDraft;
  onChange: (value: PostPetDraft) => void;
  userLocation: UserLocation | null;
  onDeleteExistingPhoto?: (photoId: number) => Promise<void>;
};

export function PostPetForm({
  value,
  onChange,
  userLocation,
  onDeleteExistingPhoto,
}: PostPetFormProps) {
  return (
    <form style={{ display: "grid", gap: 12 }}>
      <select
        value={value.reportStatus}
        onChange={(event) =>
          onChange({
            ...value,
            reportStatus: event.target.value as PostPetDraft["reportStatus"],
          })
        }
      >
        <option value="lost">Lost pet</option>
        <option value="found">Found pet</option>
      </select>

      <select
        value={value.species}
        onChange={(event) =>
          onChange({
            ...value,
            species: event.target.value as PostPetDraft["species"],
          })
        }
      >
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
        <option value="other">Other</option>
      </select>

      <input
        value={value.name}
        onChange={(event) =>
          onChange({
            ...value,
            name: event.target.value,
          })
        }
        placeholder="Pet name"
      />

      <input
        value={value.breedLabel}
        onChange={(event) =>
          onChange({
            ...value,
            breedLabel: event.target.value,
          })
        }
        placeholder="Breed or kind"
      />

      <textarea
        value={value.description}
        onChange={(event) =>
          onChange({
            ...value,
            description: event.target.value,
          })
        }
        placeholder="Description"
        rows={5}
      />

      <PostPetPhotoUpload
        photos={value.photos}
        existingPhotos={value.existingPhotos}
        onChange={(photos) =>
          onChange({
            ...value,
            photos,
          })
        }
        onDeleteExistingPhoto={onDeleteExistingPhoto}
      />

      <PostPetLocationPicker
        latitude={value.latitude}
        longitude={value.longitude}
        userLocation={userLocation}
        onChange={(location) =>
          onChange({
            ...value,
            latitude: location.latitude,
            longitude: location.longitude,
          })
        }
      />

      <p style={{ margin: 0, color: "#6b7280" }}>
        {value.latitude !== null && value.longitude !== null
          ? `Selected location: ${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`
          : "Click the map to set the pet location."}
      </p>
    </form>
  );
}
