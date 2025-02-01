"use client";

import { formatDistanceToNow } from "date-fns";
import CustomAvatar from "~/components/atom/custom-avatar";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import { GetUnreadNotificationType } from "~/server/api/root";

interface NotificationItemProps extends GetUnreadNotificationType {
  isNew?: boolean;
  onMarkAsRead: (args: { id: string }) => void;
}

export function NotificationItem({
  isNew,
  onMarkAsRead,
  ...notification
}: NotificationItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors",
        {
          "bg-accent/50 hover:bg-accent": isNew,
          "hover:bg-accent": !isNew,
        },
      )}
      onClick={() => onMarkAsRead({ id: notification.id })}
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
      {isNew && (
        <span className="ml-auto flex h-2 w-2 rounded-full bg-blue-500" />
      )}
    </button>
  );
}
