import { SparklesIcon, SquareCheckBigIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type * as React from "react";
import CustomAvatar from "~/components/atom/custom-avatar";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useNotifications } from "~/hooks/use-notifications";
import { Link } from "~/lib/i18n/routing";
import { cn, formatDate, formatTime } from "~/lib/utils";
import type { GetAllNotificationType } from "~/server/api/root";
import type { Locale } from "~/types/locale";

interface NotificationItemProps extends GetAllNotificationType {
  close?: () => void; // Changed from setOpen to an optional close function
}

export function NotificationItem({
  close,
  ...notification
}: NotificationItemProps) {
  const { markAsRead, getNotificationText, getNotificationHref } =
    useNotifications();
  const t = useTranslations("Notifications");
  const locale = useLocale();

  const href = getNotificationHref(notification);

  if (!href) {
    return <NotificationSkeleton />;
  }

  return (
    <Link
      href={href}
      scroll={true}
      onClick={() => close && close()} // Only call close if it exists
      className={cn(
        "flex w-full items-center gap-2 overflow-hidden rounded-sm p-2 text-left transition-colors",
        {
          "bg-accent/40 hover:bg-accent/80": !notification.read,
          "bg-muted hover:bg-accent/80": notification.read,
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
        <div className="my-auto ml-auto flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              markAsRead({ id: notification.id });
            }}
            title={t("buttonLabel.markAsRead")}
            aria-label={t("buttonLabel.markAsRead")}
            className="size-7 rounded-sm"
          >
            <SquareCheckBigIcon className="h-4 w-4" />
          </Button>
          <div title={t("new")}>
            <SparklesIcon
              className="mr-1 size-5 fill-yellow-600 text-orange-500"
              aria-label={t("new")}
            />
          </div>
        </div>
      )}
    </Link>
  );
}

export const NotificationSkeleton: React.FC<
  React.HTMLAttributes<HTMLDivElement>
> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "flex h-14 w-full items-center gap-2 overflow-hidden rounded-sm bg-muted p-2 text-left",
        className,
      )}
      {...props}
    >
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
