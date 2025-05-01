// src/hooks/use-notifications.ts:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useSubscription } from "@trpc/tanstack-react-query";
// Import TRPCClientError
import { toast } from "sonner";
import {
  type GetAllNotificationType,
  GetAllNotificationsInput,
} from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import {
  NotifiableEntityType,
  NotificationEventType,
} from "~/types/notification";

// Add the 'export' keyword in front of the function declaration
export function useNotifications(onlyUnread = true) {
  const [allNotifications, setAllNotifications] = React.useState<
    GetAllNotificationType[] | null
  >(null);
  const [lastEventId, setLastEventId] = React.useState<false | null | string>(
    false,
  );
  const trpc = useTRPC();
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

  const query = useQuery({
    ...trpc.notifications.getAll.queryOptions({
      onlyUnread,
      // Fetching all initially might be better for lastEventId, but stick to onlyUnread for now
    } satisfies GetAllNotificationsInput),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 10 * 1000,
    enabled: status === "authenticated", // Only enable when authenticated
    retry: false, // Don't retry on error (like 401)
  });

  // Update state from query
  React.useEffect(() => {
    if (query.data) {
      setAllNotifications(query.data.items);
    }
  }, [query.data]);

  const getEntityTypeText = React.useCallback(
    (entityType: NotifiableEntityType) => {
      switch (entityType) {
        case NotifiableEntityType.GROW:
          return t("entity_grow");
        case NotifiableEntityType.PLANT:
          return t("entity_plant");
        case NotifiableEntityType.PHOTO:
          return t("entity_photo");
        case NotifiableEntityType.POST:
          return t("entity_post");
        case NotifiableEntityType.COMMENT:
          return t("entity_comment");
        default:
          return "";
      }
    },
    [t],
  );

  const getNotificationText = React.useCallback(
    (type: NotificationEventType, entityType: NotifiableEntityType) => {
      const entityText = getEntityTypeText(entityType);

      switch (type) {
        case NotificationEventType.NEW_FOLLOW:
          return t("new_follow");
        case NotificationEventType.NEW_LIKE: {
          return `${t("new_like")} ${entityText}`;
        }
        case NotificationEventType.NEW_COMMENT: {
          return `${t("new_comment")} ${entityText}`;
        }
        default:
          return t("new_notification");
      }
    },
    [t, getEntityTypeText],
  );

  // Define the error handler for the subscription
  const handleSubscriptionError = React.useCallback(
    (err: unknown) => {
      // Check if the error is due to intentional abortion or disposal issues
      let isAbortOrDisposalError = false;
      if (err instanceof TRPCClientError) {
        // Check if the cause is an AbortError
        if (err.cause instanceof Error && err.cause.name === "AbortError") {
          isAbortOrDisposalError = true;
        }
        // Check if the message indicates suppression during disposal
        if (err.message.includes("suppressed during disposal")) {
          isAbortOrDisposalError = true;
        }
      } else if (err instanceof Error && err.name === "AbortError") {
        // Direct AbortError
        isAbortOrDisposalError = true;
      }

      if (isAbortOrDisposalError) {
        // Log minimally for debugging, but don't treat as a reconnectable error
        console.debug(
          "Notification subscription aborted (likely page navigation/reload).",
          err,
        );
        return; // Ignore abort/disposal errors for reconnection logic
      }

      // --- Proceed with handling genuine errors ---
      console.error("Notification subscription error:", err);

      // Attempt to get the last known event ID before the error
      const lastId = allNotifications?.at(-1)?.id;
      if (lastId) {
        setLastEventId(lastId);
        console.log(
          `Notification subscription error. Attempting to reconnect with lastEventId: ${lastId}`,
        );
      } else {
        // If no notifications were ever received or state is empty,
        // maybe reset to null to trigger refetch without specific ID?
        // For now, just log that we couldn't find a last ID.
        // TanStack Query might handle reconnection automatically without lastEventId if it's null.
        console.log(
          "No previous notifications found in state, cannot set lastEventId for reconnect.",
        );
        // Consider setting lastEventId back to null if reconnection fails repeatedly without it.
        // setLastEventId(null);
      }

      // Optional: More specific error handling/logging based on error type
      if (err instanceof Error) {
        if (err.message.includes("Timeout")) {
          console.warn(
            "Notification subscription timed out. Will attempt to reconnect.",
          );
          // Potentially update UI state to show a specific timeout message
        } else if (err.message.includes("UNAUTHORIZED")) {
          console.error(
            "Notification subscription unauthorized. Check session/token.",
          );
          // Might need to trigger logout or session refresh
        } else {
          console.error(
            "Unhandled notification subscription error:",
            err.message,
          );
        }
      } else {
        console.error("Unknown notification subscription error type:", err);
      }
    },
    [allNotifications], // Depend on allNotifications to get the last ID
  );

  // Updated subscription with new TanStack Query syntax
  const subscription = useSubscription({
    ...trpc.notifications.onNotification.subscriptionOptions(
      status !== "authenticated" || lastEventId === false
        ? skipToken
        : { lastEventId },
    ),
    enabled: status === "authenticated" && lastEventId !== false,
  });

  // Handle success with the returned data using an effect
  React.useEffect(() => {
    if (subscription.data) {
      const notification = subscription.data; // now typed as GetAllNotificationType
      setLastEventId(notification.id);
      const notificationText = getNotificationText(
        notification.type,
        notification.entityType,
      );
      toast(t("new_notification"), {
        description: `${notification.actor.name} ${notificationText}`,
      });
      void query.refetch();
    }
  }, [getNotificationText, query, subscription.data, t]);

  // Updated mutation with new TanStack Query syntax
  const markAsReadMutation = useMutation({
    ...trpc.notifications.markAsRead.mutationOptions(),
    onSuccess: async (_, { id }) => {
      setAllNotifications((prev) => prev?.filter((n) => n.id !== id) ?? null);
      await query.refetch();
    },
  });

  // Updated mutation with new TanStack Query syntax
  const markAllAsReadMutation = useMutation({
    ...trpc.notifications.markAllAsRead.mutationOptions(),
    onSuccess: async () => {
      setAllNotifications([]);
      await query.refetch();
    },
  });

  const commentId = allNotifications?.find(
    (n) => n.entityType === NotifiableEntityType.COMMENT,
  )?.entityId;

  const commentEntityQuery = useQuery({
    ...trpc.comments.getParentEntity.queryOptions(
      commentId ? { commentId } : skipToken,
    ),
    enabled: Boolean(commentId),
  });

  /**
   * Get the href for a notification
   */
  const getNotificationHref = React.useMemo(() => {
    return (notification: GetAllNotificationType) => {
      switch (notification.entityType) {
        case NotifiableEntityType.USER:
          return `/public/profile/${notification.actor.id}`; // Profile of user who followed
        case NotifiableEntityType.POST:
          return `#${notification.entityId}`; // FIXME: Post that was liked or commented on
        case NotifiableEntityType.GROW:
          return `/public/grows/${notification.entityId}${
            notification.commentId ? `?commentId=${notification.commentId}` : ""
          }`; // Grow that was liked or commented on
        case NotifiableEntityType.PLANT:
          return `/public/plants/${notification.entityId}${
            notification.commentId ? `?commentId=${notification.commentId}` : ""
          }`; // Plant that was liked or commented on
        case NotifiableEntityType.PHOTO:
          return `/public/photos/${notification.entityId}${
            notification.commentId ? `?commentId=${notification.commentId}` : ""
          }`; // Photo that was liked or commented on
        case NotifiableEntityType.COMMENT:
          if (!commentEntityQuery.data || commentEntityQuery.isLoading) {
            return undefined;
          }
          return `/public/${commentEntityQuery.data.entityType}s/${commentEntityQuery.data.entityId}?commentId=${notification.entityId}`;

        default:
          return "#"; // Fallback
      }
    };
  }, [commentEntityQuery.data, commentEntityQuery.isLoading]);

  return {
    // Return empty/default values if not enabled? Or let Tanstack Query handle it?
    // Tanstack Query's isLoading/isPending should reflect the enabled state.
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
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    subscriptionStatus: subscription.status,
    subscriptionError: subscription.error,
    getNotificationText,
    getNotificationHref,
    markAllAsRead: markAllAsReadMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
  };
}
