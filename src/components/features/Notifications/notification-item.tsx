"use client";

import { formatDistanceToNow } from "date-fns";
import { SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import CustomAvatar from "~/components/atom/custom-avatar";
import { Badge } from "~/components/ui/badge";
import { useNotifications } from "~/hooks/use-notifications";
import { cn } from "~/lib/utils";
import { GetUnreadNotificationType } from "~/server/api/root";

export function NotificationItem({
  ...notification
}: GetUnreadNotificationType) {
  const { markAsRead } = useNotifications();
  const t = useTranslations("Notifications");

  return (
    <button
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
          <span className="font-medium">{notification.actor.name}</span> started
          following you
        </p>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(notification.createdAt)} ago
        </span>
      </div>
      {!notification.read && (
        <Badge
          onClick={() => markAsRead({ id: notification.id })}
          className="mb-auto ml-auto cursor-default text-xs"
        >
          <SparklesIcon className="mr-1 h-4 w-4 fill-yellow-600 text-orange-500" />{" "}
          {t("new")}
        </Badge>
      )}
    </button>
  );
}
