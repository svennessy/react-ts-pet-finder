export type NotificationType = "pet_sighting" | "pet_resolved";

export type AppNotification = {
  id: string;
  type: NotificationType;
  message: string;
  readAt: string | null;
  createdAt: string;
  pet: {
    id: string;
    name: string;
    reportStatus: string;
    latitude: number;
    longitude: number;
  } | null;
};