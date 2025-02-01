"use client";

import { formatDistanceToNow } from "date-fns";
import CustomAvatar from "~/components/atom/custom-avatar";
import { api } from "~/lib/trpc/react";
import { GetUnreadNotificationType } from "~/server/api/root";

export function NotificationItem(notification: GetUnreadNotificationType) {
  const utils = api.useUtils();

  const { mutate: markAsRead } = api.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getUnread.invalidate();
    },
  });

  return (
    <button
      className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-accent"
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
    </button>
  );
}
