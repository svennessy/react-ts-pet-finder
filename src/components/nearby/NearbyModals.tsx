import type { PostPetDraft } from "../../types/forms";
import type { UserLocation } from "../../types/map";
import type { PetDetail } from "../../types/pets";
import { PostPetModal } from "../post-pet/PostPetModal";
import { PetDetailDrawer } from "./PetDetailDrawer";
import { ReportSightingModal } from "./ReportSightingModal";

type NearbyModalsProps = {
  selectedPetId: string | null;
  selectedPet: PetDetail | null;
  drawerPet: PetDetail | null;
  postPetOpen: boolean;
  postPetDraft: PostPetDraft;
  editingPetId: string | null;
  sightingOpen: boolean;
  userLocation: UserLocation | null;
  canDelete: boolean;
  deletingPet: boolean;
  resolvingPet: boolean;
  savingPost: boolean;
  updatingPost: boolean;
  savingSighting: boolean;
  isFavorite?: boolean;
  favoriteLoading?: boolean;
  onToggleFavorite?: (petId: string) => void | Promise<void>;
  onCloseDrawer: () => void;
  onDeletePet: (petId: string) => void;
  onEditPet: () => void;
  onResolvePet: (petId: string) => void;
  onReportSighting: () => void;
  onChangePostPetDraft: (draft: PostPetDraft) => void;
  onClosePostPetModal: () => void;
  onSubmitPetReport: () => void;
  onDeleteExistingPhoto: (photoId: number) => Promise<void>;
  onCloseSightingModal: () => void;
  onSubmitSighting: (values: {
    latitude: number;
    longitude: number;
    notes: string;
  }) => Promise<void>;
};

export function NearbyModals({
  selectedPetId,
  selectedPet,
  drawerPet,
  postPetOpen,
  postPetDraft,
  editingPetId,
  sightingOpen,
  userLocation,
  canDelete,
  deletingPet,
  resolvingPet,
  savingPost,
  updatingPost,
  savingSighting,
  isFavorite = false,
  favoriteLoading = false,
  onToggleFavorite,
  onCloseDrawer,
  onDeletePet,
  onEditPet,
  onResolvePet,
  onReportSighting,
  onChangePostPetDraft,
  onClosePostPetModal,
  onSubmitPetReport,
  onDeleteExistingPhoto,
  onCloseSightingModal,
  onSubmitSighting,
}: NearbyModalsProps) {
  return (
    <>
      <PetDetailDrawer
        key={selectedPetId ?? "no-pet"}
        pet={drawerPet}
        loading={Boolean(selectedPetId) && !drawerPet}
        onClose={onCloseDrawer}
        canDelete={canDelete}
        deleting={deletingPet}
        onDelete={onDeletePet}
        onEdit={onEditPet}
        onResolve={onResolvePet}
        resolving={resolvingPet}
        onReportSighting={onReportSighting}
        isFavorite={isFavorite}
        favoriteLoading={favoriteLoading}
        onToggleFavorite={onToggleFavorite}
      />

      <PostPetModal
        open={postPetOpen}
        value={postPetDraft}
        onChange={onChangePostPetDraft}
        onClose={onClosePostPetModal}
        userLocation={userLocation}
        onSubmit={onSubmitPetReport}
        saving={savingPost || updatingPost}
        mode={editingPetId ? "edit" : "create"}
        onDeleteExistingPhoto={onDeleteExistingPhoto}
      />

      {selectedPet ? (
        <ReportSightingModal
          open={sightingOpen}
          onClose={onCloseSightingModal}
          onSubmit={onSubmitSighting}
          defaultLocation={{
            latitude: selectedPet.latitude,
            longitude: selectedPet.longitude,
          }}
          saving={savingSighting}
        />
      ) : null}
    </>
  );
}