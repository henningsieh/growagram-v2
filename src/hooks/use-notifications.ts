import * as React from "react";
import { api } from "~/lib/trpc/react";
import { type GetUnreadNotificationType } from "~/server/api/root";

import { useToast } from "./use-toast";

export function useNotifications() {
  const [allNotifications, setAllNotifications] = React.useState<
    GetUnreadNotificationType[] | null
  >(null);
  const utils = api.useUtils();
  const { toast } = useToast();

  const query = api.notifications.getUnread.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5 * 1000,
  });

  React.useEffect(() => {
    setAllNotifications(query.data ?? null);
  }, [query.data]);

  const subscription = api.notifications.onNotification.useSubscription(
    undefined, // No lastEventId needed
    {
      onData: (notification) => {
        toast({
          title: "New Notification",
          description: `${notification.actor.name} started following you`,
        });
        utils.notifications.getUnread.invalidate();
      },
    },
  );

  const { mutate: markAsRead } = api.notifications.markAsRead.useMutation({
    onSuccess: (_, { id }) => {
      setAllNotifications((prev) => prev?.filter((n) => n.id !== id) ?? null);
      utils.notifications.getUnread.invalidate();
    },
  });

  return {
    all: allNotifications ?? [],
    grouped: {
      follow: (allNotifications ?? []).filter((n) => n.type === "follow"),
      like: (allNotifications ?? []).filter((n) => n.type === "like"),
      comment: (allNotifications ?? []).filter((n) => n.type === "comment"),
    },
    unreadCount: allNotifications?.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    subscriptionStatus: subscription.status,
    subscriptionError: subscription.error,
    markAsRead,
  };
}
