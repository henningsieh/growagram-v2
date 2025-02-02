"use client";

import { formatDistanceToNow } from "date-fns";
import { SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import CustomAvatar from "~/components/atom/custom-avatar";
import { Badge } from "~/components/ui/badge";
import { useNotifications } from "~/hooks/use-notifications";
import { Link } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";
import { GetUnreadNotificationType } from "~/server/api/root";
import { NotifiableEntityType } from "~/types/notification";

interface NotificationItemProps extends GetUnreadNotificationType {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NotificationItem({
  setOpen,
  ...notification
}: NotificationItemProps) {
  const { markAsRead, getNotificationText } = useNotifications();
  const t = useTranslations("Notifications");

  const href = React.useMemo(() => {
    switch (notification.entityType) {
      case NotifiableEntityType.USER:
        return `/public/profile/${notification.actor.id}`; // Profile of user who followed
      case NotifiableEntityType.POST:
        return `#${notification.entityId}`; // FIXME: Post that was liked or commented on
      case NotifiableEntityType.GROW:
        return `/public/grows/${notification.entityId}`; // Grow that was liked or commented on
      case NotifiableEntityType.PLANT:
        return `/public/plants/${notification.entityId}`; // Plant that was liked or commented on
      case NotifiableEntityType.PHOTO:
        return `#${notification.entityId}`; // FIXME: Photo that was liked or commented on
      default:
        return "#"; // Fallback
    }
  }, [notification]);

  return (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={cn(
        "flex w-full items-center gap-2 overflow-hidden rounded-sm p-2 text-left transition-colors",
        {
          "bg-accent/20 hover:bg-accent/40": !notification.read,
        },
      )}
    >
      <CustomAvatar
        src={notification.actor.image || undefined}
        alt={notification.actor.name || "User avatar"}
        fallback={notification.actor.name?.[0] || "?"}
        size={32}
      />
      <div className="flex flex-col">
        <p className="text-sm">
          <span className="font-medium">
            {notification.actor.name}{" "}
            {getNotificationText(notification.type, notification.entityType)}
          </span>
        </p>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(notification.createdAt)} ago
        </span>
      </div>
      {!notification.read && (
        <Badge
          onClick={(e) => {
            e.preventDefault(); // Prevent link navigation
            e.stopPropagation(); // Prevent Link onClick
            markAsRead({ id: notification.id });
          }}
          className="mb-auto ml-auto cursor-default text-xs"
        >
          <SparklesIcon className="mr-1 h-4 w-4 fill-yellow-600 text-orange-500" />{" "}
          {t("new")}
        </Badge>
      )}
    </Link>
  );
}
