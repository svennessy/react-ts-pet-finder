import { apiGet, apiPatch } from "./client";
import type { AppNotification } from "../types/notifications";

export type NotificationsResponse = {
  notifications: AppNotification[];
  unreadCount: number;
};

export async function fetchNotifications(signal?: AbortSignal) {
  return apiGet<NotificationsResponse>("/api/notifications", signal);
}

export async function markNotificationRead(notificationId: string) {
  return apiPatch<{ updated: number }, Record<string, never>>(
    `/api/notifications/${notificationId}/read`,
    {},
  );
}