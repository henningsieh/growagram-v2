import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import CustomAvatar from "~/components/atom/custom-avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { Link } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { Locale } from "~/types/locale";
import { NotificationEventType } from "~/types/notification";

interface DashboardActivityFeedProps {
  limit?: number;
}

export function DashboardActivityFeed({
  //   userId,
  limit = 5,
}: DashboardActivityFeedProps) {
  const t = useTranslations("Platform");
  const locale = useLocale() as Locale;

  // This is a placeholder since there's no explicit activity feed in the TRPC routers
  // In a real implementation, this could use notifications or a dedicated activity feed endpoint
  const { data: notifications, isLoading } =
    api.notifications.getUnread.useQuery(undefined, {
      refetchInterval: 30000, // Refetch every 30 seconds
    });

  if (isLoading) {
    return (
      <>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="mb-4 flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
      </>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        <p>{t("no-recent-activity")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {notifications.slice(0, limit).map((notification) => {
        const formattedTime = formatDistanceToNow(
          new Date(notification.createdAt),
          {
            addSuffix: true,
            locale: locale === "de" ? de : undefined,
          },
        );

        // Build action text based on notification type
        let actionText = "";
        let actionUrl = "";

        switch (notification.type) {
          case NotificationEventType.NEW_LIKE:
            actionText = t("liked-your-content");
            actionUrl = `/notifications`;
            break;
          case NotificationEventType.NEW_COMMENT:
            actionText = t("commented-on-your-content");
            actionUrl = `/notifications`;
            break;
          case NotificationEventType.NEW_FOLLOW:
            actionText = t("started-following-you");
            actionUrl = `/public/users/${notification.actor?.id}`;
            break;
          case NotificationEventType.NEW_POST:
            actionText = t("posted-on-your-wall");
            actionUrl = `/notifications`;
            break;
          default:
            actionText = t("interacted-with-your-content");
            actionUrl = `/notifications`;
        }

        return (
          <div className="flex items-start" key={notification.id}>
            <CustomAvatar
              size={96}
              src={notification.actor.image || undefined}
              alt={notification.actor.name || "User avatar"}
              fallback={notification.actor.name?.[0] || "?"}
              className="border-2 border-primary/10"
            />
            <div className="space-y-1">
              <p className="text-sm">
                <Link href={actionUrl} className="font-medium hover:underline">
                  {notification.actor?.name}
                </Link>{" "}
                {actionText}
              </p>
              <p className="text-xs text-muted-foreground">{formattedTime}</p>
            </div>
          </div>
        );
      })}

      {notifications.length > limit && (
        <div className="text-center">
          <Link
            href="/notifications"
            className="text-sm text-primary hover:underline"
          >
            {t("view-all-activities")}
          </Link>
        </div>
      )}
    </div>
  );
}
