import { skipToken } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { api } from "~/lib/trpc/react";
import { type GetUnreadNotificationType } from "~/server/api/root";
import {
  NotifiableEntityType,
  NotificationEventType,
} from "~/types/notification";

import { useToast } from "./use-toast";

export function useNotifications() {
  const [allNotifications, setAllNotifications] = React.useState<
    GetUnreadNotificationType[] | null
  >(null);
  const [lastEventId, setLastEventId] = React.useState<false | null | string>(
    false,
  );
  const utils = api.useUtils();
  const { toast } = useToast();
  const { data: session } = useSession();
  const t = useTranslations("Notifications");

  // Set initial lastEventId from notifications
  React.useEffect(() => {
    if (allNotifications && lastEventId === false) {
      setLastEventId(allNotifications.at(-1)?.id ?? null);
    }
  }, [allNotifications, lastEventId]);

  const query = api.notifications.getUnread.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 10 * 1000,
    enabled: !!session,
  });

  // Update state from query
  React.useEffect(() => {
    setAllNotifications(query.data ?? null);
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
      switch (type) {
        case NotificationEventType.NEW_FOLLOW:
          return t("new_follow");
        case NotificationEventType.NEW_LIKE: {
          const entityText = getEntityTypeText(entityType);
          return `${t("new_like")} ${entityText}`;
        }
        case NotificationEventType.NEW_COMMENT: {
          const entityText = getEntityTypeText(entityType);
          return `${t("new_comment")} ${entityText}`;
        }
        default:
          return t("new_notification");
      }
    },
    [t, getEntityTypeText],
  );

  // Enhanced subscription with lastEventId and error handling
  const subscription = api.notifications.onNotification.useSubscription(
    !session || lastEventId === false ? skipToken : { lastEventId },
    {
      // enabled: !!session,
      onData: (notification) => {
        setLastEventId(notification.id);
        const notificationText = getNotificationText(
          notification.type,
          notification.entityType,
        );
        toast({
          title: t("new_notification"),
          description: `${notification.actor.name} ${notificationText}`,
        });
        utils.notifications.getUnread.invalidate();
      },
      onError: (err) => {
        console.error("Subscription error:", err);
        // Try to resubscribe from last known notification
        const lastNotificationId = allNotifications?.at(-1)?.id;
        if (lastNotificationId) {
          setLastEventId(lastNotificationId);
        }
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

  const { mutate: markAllAsRead } = api.notifications.markAllAsRead.useMutation(
    {
      onSuccess: () => {
        setAllNotifications([]);
        utils.notifications.getUnread.invalidate();
      },
    },
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
    unreadCount: allNotifications?.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    subscriptionStatus: subscription.status,
    subscriptionError: subscription.error,
    getNotificationText,
    markAllAsRead,
    markAsRead,
  };
}
