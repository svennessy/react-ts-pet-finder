import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { MyPet } from "../api/myPets";
import { deletePetPhoto } from "../api/photos";
import {
  deleteSighting,
  updateSightingVerification,
} from "../api/sightings";
import { RequireAuth } from "../components/auth/RequireAuth";
import { PostPetModal } from "../components/post-pet/PostPetModal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { EmptyState } from "../components/ui/EmptyState";
import { Section } from "../components/ui/Section";
import { useAuthSession } from "../hooks/auth/useAuthSession";
import { useProfile } from "../hooks/auth/useProfile";
import { usePetReportActions } from "../hooks/nearby/usePetReportActions";
import { usePostPetDraft } from "../hooks/nearby/usePostPetDraft";
import { useUserLocation } from "../hooks/nearby/useUserLocation";
import { useMyPets } from "../hooks/pets/useMyPets";
import type { SightingVerificationStatus } from "../types/sightings";
import { formatRelativeTime } from "../utils/nearby/formatRelativeTime";

function getPhotoUrl(pet: MyPet) {
  const photo = pet.photos?.[0];
  if (!photo) return null;
  return photo.resolvedUrl ?? photo.imageUrl ?? photo.imagePath;
}

export function MyPetsPage() {
  const auth = useAuthSession();
  const { profile } = useProfile();
  const userLocation = useUserLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pets, loading, error, reload } = useMyPets(auth.isAuthenticated);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [postPetOpen, setPostPetOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const { postPetDraft, setPostPetDraft, resetPostPetDraft, fillDraftFromPet } =
    usePostPetDraft();

  const {
    deletingPet,
    updatingPost,
    resolvingPet,
    handleDeletePetReport,
    handleUpdatePetReport,
    handleResolvePetReport,
  } = usePetReportActions({
    reload,
    reloadSidebar: reload,
    setSelectedPetId,
    setPostPetOpen,
    resetDraft: resetPostPetDraft,
    clearSelectionOnSuccess: false,
  });

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? null,
    [pets, selectedPetId],
  );

  useEffect(() => {
    const petParam = searchParams.get("pet");
    if (!petParam) return;

    setSelectedPetId(petParam);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("pet");
        return next;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (loading) return;
    if (pets.length === 0) {
      setSelectedPetId(null);
      return;
    }
    if (selectedPetId && pets.some((pet) => pet.id === selectedPetId)) return;
    setSelectedPetId(pets[0].id);
  }, [loading, pets, selectedPetId]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [selectedPet?.id]);

  function handleEditPet(pet: MyPet) {
    setEditingPetId(pet.id);
    fillDraftFromPet(pet);
    setPostPetOpen(true);
  }

  function handleClosePostPetModal() {
    setPostPetOpen(false);
    setEditingPetId(null);
    resetPostPetDraft();
  }

  async function handleDeleteExistingPhoto(photoId: number) {
    await deletePetPhoto(photoId);
    await reload();
  }

  const [sightingActionId, setSightingActionId] = useState<string | null>(null);

  async function handleSetSightingVerification(
    sightingId: string,
    verificationStatus: SightingVerificationStatus,
  ) {
    if (!profile?.isVerified) {
      alert("Verification required before managing sightings.");
      return;
    }

    setSightingActionId(sightingId);

    try {
      await updateSightingVerification(sightingId, { verificationStatus });
      await reload();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update sighting verification.",
      );
    } finally {
      setSightingActionId(null);
    }
  }

  async function handleRemoveSighting(sightingId: string) {
    if (!profile?.isVerified) {
      alert("Verification required before managing sightings.");
      return;
    }

    if (
      !window.confirm(
        "Remove this sighting? This cannot be undone.",
      )
    ) {
      return;
    }

    setSightingActionId(sightingId);

    try {
      await deleteSighting(sightingId);
      await reload();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to remove sighting.",
      );
    } finally {
      setSightingActionId(null);
    }
  }

  return (
    <main>
      <RequireAuth
        title="Sign in to view your pets"
        description="Reports you post are saved to your Spot account."
      >
        <Section>
          <Container>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "end",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1 style={{ marginBottom: 6 }}>My Pets</h1>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  Manage your reports, review sightings, and update details.
                </p>
              </div>

              <Link to="/nearby?nearMe=1">
                <Button>Post or browse nearby</Button>
              </Link>
            </div>

            {loading ? (
              <p style={{ marginTop: 24 }}>Loading your pets...</p>
            ) : error ? (
              <Card style={{ padding: 24, marginTop: 24 }}>
                <p>{error}</p>
                <button type="button" onClick={() => void reload()}>
                  Try again
                </button>
              </Card>
            ) : pets.length === 0 ? (
              <div style={{ marginTop: 24 }}>
                <EmptyState
                  title="No pets posted yet"
                  description="When you submit a lost or found report, it will appear here."
                  action={
                    <Link to="/nearby?nearMe=1">
                      <Button>Go to Nearby</Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)",
                  gap: 20,
                  marginTop: 24,
                  alignItems: "start",
                }}
              >
                <div style={{ display: "grid", gap: 12 }}>
                  {pets.map((pet) => {
                    const photoUrl = getPhotoUrl(pet);
                    const selected = pet.id === selectedPetId;

                    return (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => setSelectedPetId(pet.id)}
                        style={{
                          textAlign: "left",
                          border: selected
                            ? "2px solid #2563eb"
                            : "1px solid #e5e7eb",
                          borderRadius: 16,
                          padding: 12,
                          background: selected ? "#eff6ff" : "white",
                          cursor: "pointer",
                          display: "grid",
                          gridTemplateColumns: "72px minmax(0, 1fr)",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "#f3f4f6",
                          }}
                        >
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={pet.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : null}
                        </div>

                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <strong>{pet.name}</strong>
                            <Badge variant={pet.reportStatus}>
                              {pet.reportStatus}
                            </Badge>
                          </div>
                          <p
                            style={{
                              margin: "6px 0 0",
                              color: "#6b7280",
                              fontSize: 13,
                            }}
                          >
                            {pet.breedLabel}
                          </p>
                          <p
                            style={{
                              margin: "4px 0 0",
                              color: "#6b7280",
                              fontSize: 13,
                            }}
                          >
                            {pet.sightingsCount} sighting
                            {pet.sightingsCount === 1 ? "" : "s"} ·{" "}
                            {formatRelativeTime(pet.createdAt)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedPet ? (
                  <Card style={{ padding: 20 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <h2 style={{ margin: 0 }}>{selectedPet.name}</h2>
                          <Badge variant={selectedPet.reportStatus}>
                            {selectedPet.reportStatus}
                          </Badge>
                        </div>
                        <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
                          {selectedPet.breedLabel} · {selectedPet.species}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link
                          to={`/nearby?pet=${selectedPet.id}&lat=${selectedPet.latitude}&lng=${selectedPet.longitude}&zoom=14`}
                        >
                          <Button variant="secondary">View on map</Button>
                        </Link>
                        <Button
                          onClick={() => handleEditPet(selectedPet)}
                          disabled={!profile?.isVerified}
                        >
                          Edit
                        </Button>
                        {selectedPet.reportStatus !== "resolved" ? (
                          <Button
                            onClick={() =>
                              void handleResolvePetReport(selectedPet.id)
                            }
                            disabled={resolvingPet || !profile?.isVerified}
                          >
                            {resolvingPet ? "Resolving..." : "Mark resolved"}
                          </Button>
                        ) : null}
                        <Button
                          variant="danger"
                          disabled={deletingPet || !profile?.isVerified}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete report for ${selectedPet.name}?`,
                              )
                            ) {
                              void handleDeletePetReport(selectedPet.id);
                            }
                          }}
                        >
                          {deletingPet ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>

                    {selectedPet.photos?.length ? (
                      <div style={{ marginTop: 16 }}>
                        <div
                          style={{
                            position: "relative",
                            borderRadius: 14,
                            overflow: "hidden",
                            background: "#f3f4f6",
                            aspectRatio: "16 / 10",
                          }}
                        >
                          <img
                            src={
                              selectedPet.photos[photoIndex]?.resolvedUrl ??
                              selectedPet.photos[photoIndex]?.imageUrl ??
                              selectedPet.photos[photoIndex]?.imagePath
                            }
                            alt={`${selectedPet.name} photo ${photoIndex + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          {selectedPet.photos.length > 1 ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setPhotoIndex((current) =>
                                    current === 0
                                      ? selectedPet.photos.length - 1
                                      : current - 1,
                                  )
                                }
                                style={{
                                  position: "absolute",
                                  left: 10,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  border: 0,
                                  borderRadius: 999,
                                  width: 34,
                                  height: 34,
                                  background: "rgba(255,255,255,0.92)",
                                  cursor: "pointer",
                                  fontWeight: 800,
                                }}
                              >
                                ‹
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPhotoIndex((current) =>
                                    current === selectedPet.photos.length - 1
                                      ? 0
                                      : current + 1,
                                  )
                                }
                                style={{
                                  position: "absolute",
                                  right: 10,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  border: 0,
                                  borderRadius: 999,
                                  width: 34,
                                  height: 34,
                                  background: "rgba(255,255,255,0.92)",
                                  cursor: "pointer",
                                  fontWeight: 800,
                                }}
                              >
                                ›
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    <div
                      style={{
                        display: "grid",
                        gap: 10,
                        marginTop: 16,
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        <strong>Location:</strong>{" "}
                        {selectedPet.locationLabel ??
                          ([selectedPet.cityName, selectedPet.stateCode]
                            .filter(Boolean)
                            .join(", ") ||
                            `${selectedPet.latitude.toFixed(4)}, ${selectedPet.longitude.toFixed(4)}`)}
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Posted:</strong>{" "}
                        {formatRelativeTime(selectedPet.createdAt)}
                      </p>
                      {selectedPet.description ? (
                        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                          {selectedPet.description}
                        </p>
                      ) : (
                        <p style={{ margin: 0, color: "#6b7280" }}>
                          No description provided.
                        </p>
                      )}
                    </div>

                    <div style={{ marginTop: 24 }}>
                      <h3 style={{ marginTop: 0 }}>
                        Sightings ({selectedPet.sightingsCount})
                      </h3>

                      {selectedPet.sightings.length === 0 ? (
                        <p style={{ color: "#6b7280" }}>
                          No sightings reported yet for this pet.
                        </p>
                      ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                          {selectedPet.sightings.map((sighting) => {
                            const isVerified =
                              sighting.verificationStatus === "verified";
                            const busy = sightingActionId === sighting.id;

                            return (
                              <div
                                key={sighting.id}
                                style={{
                                  padding: 12,
                                  borderRadius: 12,
                                  border: isVerified
                                    ? "1px solid #bbf7d0"
                                    : "1px solid #fde68a",
                                  background: isVerified ? "#f0fdf4" : "#fffbeb",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 8,
                                      alignItems: "center",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <strong>
                                      {sighting.locationLabel ??
                                        `${sighting.latitude.toFixed(4)}, ${sighting.longitude.toFixed(4)}`}
                                    </strong>
                                    <Badge
                                      variant={
                                        isVerified ? "verified" : "unverified"
                                      }
                                    >
                                      {isVerified
                                        ? "Verified"
                                        : "Unverified"}
                                    </Badge>
                                    {!sighting.photoUrl ? (
                                      <span
                                        style={{
                                          color: "#6b7280",
                                          fontSize: 12,
                                        }}
                                      >
                                        No photo
                                      </span>
                                    ) : null}
                                  </div>
                                  <span
                                    style={{ color: "#92400e", fontSize: 13 }}
                                  >
                                    {formatRelativeTime(sighting.createdAt)}
                                  </span>
                                </div>

                                {sighting.notes ? (
                                  <p style={{ margin: "8px 0 0" }}>
                                    {sighting.notes}
                                  </p>
                                ) : null}

                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                    marginTop: 10,
                                  }}
                                >
                                  <Link
                                    to={`/nearby?pet=${selectedPet.id}&sighting=${sighting.id}&lat=${sighting.latitude}&lng=${sighting.longitude}&zoom=14`}
                                  >
                                    <Button variant="secondary">
                                      View on map
                                    </Button>
                                  </Link>

                                  {isVerified ? (
                                    <Button
                                      variant="secondary"
                                      disabled={busy || !profile?.isVerified}
                                      onClick={() =>
                                        void handleSetSightingVerification(
                                          sighting.id,
                                          "unverified",
                                        )
                                      }
                                    >
                                      {busy ? "Saving..." : "Mark unverified"}
                                    </Button>
                                  ) : (
                                    <Button
                                      disabled={busy || !profile?.isVerified}
                                      onClick={() =>
                                        void handleSetSightingVerification(
                                          sighting.id,
                                          "verified",
                                        )
                                      }
                                    >
                                      {busy ? "Saving..." : "Mark verified"}
                                    </Button>
                                  )}

                                  <Button
                                    variant="danger"
                                    disabled={busy || !profile?.isVerified}
                                    onClick={() =>
                                      void handleRemoveSighting(sighting.id)
                                    }
                                  >
                                    {busy ? "Removing..." : "Remove"}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {!profile?.isVerified ? (
                      <p style={{ marginTop: 16, color: "#b45309" }}>
                        Verify your account to edit or resolve reports.
                      </p>
                    ) : null}
                  </Card>
                ) : (
                  <Card style={{ padding: 24 }}>
                    <p style={{ margin: 0, color: "#6b7280" }}>
                      Select a pet to view details and sightings.
                    </p>
                  </Card>
                )}
              </div>
            )}
          </Container>
        </Section>

        <PostPetModal
          open={postPetOpen}
          value={postPetDraft}
          onChange={setPostPetDraft}
          onClose={handleClosePostPetModal}
          userLocation={userLocation.location}
          onSubmit={() => {
            if (!editingPetId) return;
            void handleUpdatePetReport(editingPetId, postPetDraft);
          }}
          saving={updatingPost}
          mode="edit"
          onDeleteExistingPhoto={handleDeleteExistingPhoto}
        />
      </RequireAuth>
    </main>
  );
}
