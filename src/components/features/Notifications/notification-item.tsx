"use client";

import { formatDistanceToNow } from "date-fns";
import CustomAvatar from "~/components/atom/custom-avatar";
import { useNotifications } from "~/hooks/use-notifications";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import { GetUnreadNotificationType } from "~/server/api/root";

export function NotificationItem({
  ...notification
}: GetUnreadNotificationType) {
  const { markAsRead } = useNotifications();

  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 overflow-hidden rounded-sm p-2 text-left transition-colors",
        {
          // "bg-accent/50 hover:bg-accent": notification.read,
          "bg-accent/20 hover:bg-accent/40": !notification.read,
        },
      )}
      onClick={() => markAsRead({ id: notification.id })}
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
        <span className="ml-auto flex h-2 w-2 rounded-full bg-primary" />
      )}
    </button>
  );
}
