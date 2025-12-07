import * as React from "react";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSubscription } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

import {
  type GetAllNotificationType,
  type GetAllNotificationsInput,
} from "~/server/api/root";

import { NotificationEventType } from "~/types/notification";

import { useTRPC } from "~/lib/trpc/client";

interface UseNotificationsReturn {
  all: GetAllNotificationType[];
  grouped: {
    follow: GetAllNotificationType[];
    like: GetAllNotificationType[];
    comment: GetAllNotificationType[];
  };
  unreadCount: number;
  isFetched: boolean;
  isError: boolean;
  error: unknown;
  subscriptionStatus: string;
  subscriptionError: unknown;
  markAllAsRead: () => void;
  markAsRead: (params: { id: string }) => void;
}

export function useNotifications(onlyUnread = true): UseNotificationsReturn {
  const trpc = useTRPC();
  const [allNotifications, setAllNotifications] = React.useState<
    GetAllNotificationType[] | null
  >(null);
  const [lastEventId, setLastEventId] = React.useState<false | null | string>(
    false,
  );
  const queryClient = useQueryClient();
  const { status } = useSession();
  const t = useTranslations("Notifications");

  // Clear notifications when session ends
  React.useEffect(() => {
    if (status === "unauthenticated") {
      setAllNotifications(null);
      setLastEventId(false);
    }
  }, [status]);

  // Set initial lastEventId from notifications
  React.useEffect(() => {
    if (allNotifications && lastEventId === false) {
      setLastEventId(allNotifications.at(-1)?.id ?? null);
    }
  }, [allNotifications, lastEventId]);

  const query = useQuery(
    trpc.notifications.getAll.queryOptions(
      { onlyUnread } satisfies GetAllNotificationsInput, // Pass onlyUnread parameter
      {
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 10 * 1000,
        enabled: status === "authenticated", // Only enable when authenticated
        retry: false, // Don't retry on error (like 401)
      },
    ),
  );

  // Update state from query
  React.useEffect(() => {
    if (query.data) {
      setAllNotifications(query.data.items);
    }
  }, [query.data]);

  // Always call useSubscription unconditionally
  const isSubscriptionEnabled = status === "authenticated";
  // Determine the value for lastEventId to be sent to the API
  // If lastEventId is the initial 'false', send null to the API (or undefined by not setting the key, but null is fine for nullable schema),
  // otherwise send the actual string or null value.
  const apiLastEventIdInput = lastEventId === false ? null : lastEventId;

  const subscription = useSubscription(
    trpc.notifications.onNotification.subscriptionOptions(
      { lastEventId: apiLastEventIdInput }, // Always pass an object that matches the Zod schema
      {
        enabled: isSubscriptionEnabled, // Control the subscription lifecycle
        onData: (notification) => {
          setLastEventId(notification.id);
          // Use a generic notification message for real-time notifications
          // The detailed text will be computed server-side when fetched
          toast(t("new_notification"), {
            description: `${notification.actor.name} interacted with your content`,
          });
          void queryClient.invalidateQueries(
            trpc.notifications.getAll.pathFilter(),
          );
        },
        onError: (err) => {
          console.error("Subscription error in useNotifications:", err);
          // Optionally, provide user feedback about the connection issue, e.g., via a toast
          // toast.error(t("subscriptionError")); // Example, if you have such a translation
        },
      },
    ),
  );

  const { mutate: markAsRead } = useMutation(
    trpc.notifications.markAsRead.mutationOptions({
      onSuccess: async (_, { id }) => {
        setAllNotifications((prev) => prev?.filter((n) => n.id !== id) ?? null);
        await queryClient.invalidateQueries(
          trpc.notifications.getAll.pathFilter(),
        );
      },
    }),
  );

  const { mutate: markAllAsRead } = useMutation(
    trpc.notifications.markAllAsRead.mutationOptions({
      onSuccess: async () => {
        setAllNotifications([]);
        await queryClient.invalidateQueries(
          trpc.notifications.getAll.pathFilter(),
        );
      },
    }),
  );

  return {
    all: allNotifications ?? [],
    grouped: {
      follow: (allNotifications ?? []).filter(
        (n) => n.type === NotificationEventType.NEW_FOLLOW,
      ),
      like: (allNotifications ?? []).filter(
        (n) => n.type === NotificationEventType.NEW_LIKE,
      ),
      comment: (allNotifications ?? []).filter(
        (n) => n.type === NotificationEventType.NEW_COMMENT,
      ),
    },
    unreadCount: onlyUnread
      ? (allNotifications?.length ?? 0)
      : (allNotifications?.filter((n) => !n.read).length ?? 0),
    isFetched: query.isFetched,
    isError: query.isError,
    error: query.error,
    subscriptionStatus: subscription.status,
    subscriptionError: subscription.error,
    markAllAsRead,
    markAsRead,
  };
}
