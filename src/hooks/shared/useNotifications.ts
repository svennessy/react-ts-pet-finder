import { useCallback, useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../api/notifications";
import type { AppNotification } from "../../types/notifications";
import { useAuthSession } from "../auth/useAuthSession";

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const auth = useAuthSession();

  const reload = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);

    try {
      const result = await fetchNotifications(signal);
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    void reload(controller.signal);

    return () => controller.abort();
  }, [reload, auth.isAuthenticated]);

  async function markRead(notificationId: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification,
      ),
    );

    setUnreadCount((current) => Math.max(current - 1, 0));

    await markNotificationRead(notificationId);
  }

  return {
    notifications,
    unreadCount,
    loading,
    reload,
    markRead,
  };
}
