import { useState } from "react";
import { api } from "~/lib/trpc/react";
import { GetUnreadNotificationType } from "~/server/api/root";

import { useToast } from "./use-toast";

export function useNotifications() {
  const [notifications, setNotifications] = useState<
    GetUnreadNotificationType[] | null
  >(null);
  const utils = api.useUtils();
  const { toast } = useToast();

  // Query for unread notifications
  const { data: unreadNotifications } = api.notifications.getUnread.useQuery(
    undefined,
    {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 5 * 1000, // Override default staleTime
      // refetchInterval: 5 * 1000, // Refetch every 30 seconds
    },
  );

  // Subscribe to new notifications
  api.notifications.onNotification.useSubscription(
    {},
    {
      onData: (notification) => {
        console.debug("New notification received:", notification);
        setNotifications((current) => {
          const existing = current ?? [];
          return [notification, ...existing].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          );
        });

        toast({
          title: "New Notification",
          description: `${notification.actor.name} started following you`,
        });

        // Invalidate queries to ensure consistency
        void utils.notifications.getUnread.invalidate();
      },
      onError: (err) => {
        console.error("Notification subscription error:", err);
      },
    },
  );

  return {
    notifications: notifications ?? unreadNotifications ?? [],
  };
}
