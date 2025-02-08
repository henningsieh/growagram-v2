import { SparklesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type * as React from "react";
import CustomAvatar from "~/components/atom/custom-avatar";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { useNotifications } from "~/hooks/use-notifications";
import { Link } from "~/lib/i18n/routing";
import { cn, formatDate, formatTime } from "~/lib/utils";
import type { GetUnreadNotificationType } from "~/server/api/root";
import type { Locale } from "~/types/locale";

interface NotificationItemProps extends GetUnreadNotificationType {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NotificationItem({
  setOpen,
  ...notification
}: NotificationItemProps) {
  const { markAsRead, getNotificationText, getNotificationHref } =
    useNotifications();
  const t = useTranslations("Notifications");
  const locale = useLocale();

  console.debug(notification);

  const href = getNotificationHref(notification);

  if (!href) {
    return <NotificationSkeleton />;
  }

  return (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={cn(
        "flex w-full items-center gap-2 overflow-hidden rounded-sm p-2 text-left transition-colors",
        {
          "bg-accent/20 hover:bg-accent/50": !notification.read,
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
          {formatDate(notification.createdAt, locale as Locale)}{" "}
          {formatTime(notification.createdAt, locale as Locale)}
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

export const NotificationSkeleton = () => {
  return (
    <div className="flex h-16 w-full items-center gap-2 overflow-hidden rounded-sm bg-muted p-2 text-left">
      <Skeleton className="h-9 w-9 rounded-full" /> {/* Avatar skeleton */}
      <div className="flex flex-grow flex-col gap-3">
        <Skeleton className="mb-1 h-4 w-3/4" />{" "}
        {/* Name and action text skeleton */}
        <Skeleton className="h-3 w-1/2" /> {/* Date and time skeleton */}
      </div>
      <Skeleton className="ml-auto h-5 w-12 rounded-full" />{" "}
      {/* Badge skeleton */}
    </div>
  );
};
