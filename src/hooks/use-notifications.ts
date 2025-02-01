import { skipToken } from "@tanstack/react-query";
import * as React from "react";
import { api } from "~/lib/trpc/react";
import { type GetUnreadNotificationType } from "~/server/api/root";

import { useToast } from "./use-toast";

export function useNotifications() {
  const [allNotifications, setAllNotifications] = React.useState<
    GetUnreadNotificationType[] | null
  >(null);
  const [newNotifications, setNewNotifications] = React.useState<
    GetUnreadNotificationType[]
  >([]);
  const utils = api.useUtils();
  const { toast } = useToast();

  const query = api.notifications.getUnread.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5 * 1000,
  });

  const addNotifications = React.useCallback(
    (incoming?: GetUnreadNotificationType[]) => {
      console.debug("Adding notifications with filtering:", incoming);

      setAllNotifications((current) => {
        const map: Record<string, GetUnreadNotificationType> = {};
        // Only add unread notifications
        for (const notification of current ?? []) {
          if (!notification.read) {
            map[notification.id] = notification;
          }
        }
        for (const notification of incoming ?? []) {
          if (!notification.read) {
            map[notification.id] = notification;
          }
        }
        const sorted = Object.values(map).sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        console.debug("Filtered notifications:", sorted);
        return sorted;
      });
    },
    [],
  );

  React.useEffect(() => {
    console.debug("query.data", query.data);
    addNotifications(query.data);
  }, [query.data, addNotifications]);

  const [lastEventId, setLastEventId] = React.useState<false | null | string>(
    false,
  );
  if (allNotifications && lastEventId === false) {
    setLastEventId(allNotifications[0]?.id ?? null);
  }

  const subscription = api.notifications.onNotification.useSubscription(
    lastEventId === false ? skipToken : { lastEventId },
    {
      onData: (notification) => {
        setNewNotifications((prev) => [notification, ...prev]);
        addNotifications([notification]);
        toast({
          title: "New Notification",
          description: `${notification.actor.name} started following you`,
        });
      },
    },
  );

  // Group notifications by type (only from allNotifications)
  const groupedNotifications = React.useMemo(() => {
    const notifications = allNotifications?.filter((n) => !n.read) ?? [];
    return {
      follow: notifications.filter((n) => n.type === "follow"),
      like: notifications.filter((n) => n.type === "like"),
      comment: notifications.filter((n) => n.type === "comment"),
    };
  }, [allNotifications]);

  // Reset states when query returns empty
  React.useEffect(() => {
    if (query.data?.length === 0) {
      console.debug("Query returned empty - resetting states");
      setAllNotifications(null);
      setNewNotifications([]);
    }
  }, [query.data]);

  const { mutate: markAsRead } = api.notifications.markAsRead.useMutation({
    onSuccess: (_, { id }) => {
      // Remove from both states
      setNewNotifications((prev) => prev.filter((n) => n.id !== id));
      setAllNotifications((prev) => prev?.filter((n) => n.id !== id) ?? null);
      utils.notifications.getUnread.invalidate();
    },
  });

  return {
    // Notifications data
    all: (allNotifications ?? []).filter((n) => !n.read),
    new: newNotifications.filter((n) => !n.read),
    grouped: groupedNotifications,
    unreadCount: newNotifications.filter((n) => !n.read).length,
    lastEventId,
    markAsRead,

    // Query status
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Subscription status
    subscriptionStatus: subscription.status,
    subscriptionError: subscription.error,

    // Utils
    refetch: query.refetch,
    utils,
  };
}
