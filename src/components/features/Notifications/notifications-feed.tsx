import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
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
import { api } from "~/lib/trpc/react";

const PAGE_SIZE = 36;

export function DashboardNotificationsFeed() {
  const t = useTranslations("Notifications");
  const [currentPage, setCurrentPage] = useState(1);

  // Get notifications for the current page
  const { data: notifications, isLoading } = api.notifications.getAll.useQuery({
    onlyUnread: false,
    limit: PAGE_SIZE,
    page: currentPage, // Use page number directly instead of cursor
  });

  // Calculate total pages
  const totalPages = notifications?.totalPages ?? 1;

  // Handle page changes from ItemsPagination - simple page number change
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
        ) : !notifications?.items.length ? (
          <div className="py-4 text-center text-muted-foreground">
            <p>{t("ActivityFeed.no-notifications")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.items.map((notification) => (
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
