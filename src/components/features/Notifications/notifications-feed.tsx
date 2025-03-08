import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import ItemsPagination from "~/components/atom/item-pagination";
import {
  NotificationItem,
  NotificationSkeleton,
} from "~/components/features/Notifications/notification-item";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useNotifications } from "~/hooks/use-notifications";

const PAGE_SIZE = 3;

export function NotificationsFeed() {
  const t = useTranslations("Notifications");
  const [currentPage, setCurrentPage] = useState(1);

  // Use the useNotifications hook with its default behavior (onlyUnread = true)
  const { all: notifications, isLoading, error } = useNotifications(false);

  // Handle pagination locally instead of via the API
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedNotifications = notifications.slice(startIndex, endIndex);
  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);

  // Handle page changes from ItemsPagination
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ActivityFeed.label-all")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array(PAGE_SIZE)
              .fill(0)
              .map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
          </div>
        ) : !notifications.length ? (
          <div className="py-4 text-center text-muted-foreground">
            <p>{t("ActivityFeed.no-notifications")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {paginatedNotifications.map((notification) => (
              <NotificationItem key={notification.id} {...notification} />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <ItemsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          isFetching={isLoading}
          handlePageChange={handlePageChange}
        />
      </CardFooter>
    </Card>
  );
}

// This is specifically for the dashboard
export function DashboardNotificationsFeed() {
  return <NotificationsFeed />;
}
