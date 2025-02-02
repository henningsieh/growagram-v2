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
  const utils = api.useUtils();
  const { toast } = useToast();
  const t = useTranslations("Notifications");

  const query = api.notifications.getUnread.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5 * 1000,
  });

  React.useEffect(() => {
    setAllNotifications(query.data ?? null);
  }, [query.data]);

  const getEntityTypeText = React.useCallback(
    (entityType?: NotifiableEntityType) => {
      if (!entityType) throw new Error("Entity type is required");

      switch (entityType) {
        case NotifiableEntityType.GROW:
          return t("entity_grow");
        case NotifiableEntityType.PLANT:
          return t("entity_plant");
        case NotifiableEntityType.PHOTO:
          return t("entity_photo");
        case NotifiableEntityType.POST:
          return t("entity_post");
        default:
          return "";
      }
    },
    [t],
  );

  const getNotificationText = React.useCallback(
    (type: NotificationEventType, entityType?: NotifiableEntityType) => {
      console.debug("Getting notification text for:", { type, entityType });

      switch (type) {
        case NotificationEventType.NEW_FOLLOW:
          return t("new_follow");
        case NotificationEventType.NEW_LIKE: {
          const entityText = getEntityTypeText(entityType);
          console.debug("Like notification:", { entityText });
          return `${t("new_like")} ${entityText}`;
        }
        case NotificationEventType.NEW_COMMENT: {
          const entityText = getEntityTypeText(entityType);
          console.debug("Comment notification:", { entityText });
          return `${t("new_comment")} ${entityText}`;
        }
        default:
          return t("new_notification");
      }
    },
    [t, getEntityTypeText],
  );

  const subscription = api.notifications.onNotification.useSubscription(
    undefined, // No lastEventId needed
    {
      onData: (notification) => {
        const notificationText = getNotificationText(
          notification.type,
          notification.entityType,
        );
        console.debug("Subscription notification:", {
          type: notification.type,
          entityType: notification.entityType,
          text: notificationText,
        });

        toast({
          title: t("new_notification"),
          description: `${notification.actor.name} ${notificationText}`,
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
    markAsRead,
  };
}
