type ExistingPhoto = {
  id: number;
  imageUrl: string;
};

type PostPetPhotoUploadProps = {
  photos: File[];
  existingPhotos?: ExistingPhoto[];
  onChange: (photos: File[]) => void;
  onDeleteExistingPhoto?: (photoId: number) => Promise<void>;
};

export function PostPetPhotoUpload({
  photos,
  existingPhotos = [],
  onChange,
  onDeleteExistingPhoto,
}: PostPetPhotoUploadProps) {
  function handleFiles(files: FileList | null) {
    if (!files) return;

    const nextFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    onChange([...photos, ...nextFiles].slice(0, 6));
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label
        style={{
          border: "1px dashed #9ca3af",
          borderRadius: 14,
          padding: 16,
          textAlign: "center",
          cursor: "pointer",
          background: "#f9fafb",
        }}
      >
        <strong>Add photos</strong>
        <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
          Upload up to 6 images
        </p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          style={{ display: "none" }}
        />
      </label>
      {existingPhotos.length > 0 ? (
        <>
          <h4>Existing photos</h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            {existingPhotos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#e5e7eb",
                }}
              >
                <img
                  src={photo.imageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: 90,
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {onDeleteExistingPhoto ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmed = window.confirm("Delete this photo?");

                      if (!confirmed) return;

                      await onDeleteExistingPhoto(photo.id);
                    }}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      border: 0,
                      borderRadius: 999,
                      background: "#dc2626",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {photos.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {photos.map((photo, index) => (
            <div
              key={`${photo.name}-${index}`}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                background: "#e5e7eb",
              }}
            >
              <img
                src={URL.createObjectURL(photo)}
                alt={`Upload ${index + 1}`}
                style={{
                  width: "100%",
                  height: 90,
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  onChange(
                    photos.filter((_, photoIndex) => photoIndex !== index),
                  )
                }
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  border: 0,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.65)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
