import * as React from "react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ItemsPagination from "~/components/atom/item-pagination";
import { MarkAllAsReadButton } from "~/components/features/Notifications/mark-all-as-read-button";
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

export function DashboardNotificationsFeed() {
  const t = useTranslations("Notifications");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Use the useNotifications hook with onlyUnread=false to show all notifications
  const { all: notifications, isLoading, error } = useNotifications(false);

  // Handle error with toast notification
  useEffect(() => {
    if (error) {
      toast.error(t("panel.error"), {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    }
  }, [error, t]);

  // Handle pagination locally instead of via the API
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedNotifications = (notifications ?? []).slice(
    startIndex,
    endIndex,
  );
  const totalPages = Math.ceil(notifications.length / PAGE_SIZE);

  // Handle page changes from ItemsPagination
  const handlePageChange = React.useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages],
  );

  // Determine content to display based on loading state and data
  const renderContent = () => {
    // Case 1: Still loading
    if (isLoading) {
      return (
        <div className="flex flex-col gap-2">
          {Array(PAGE_SIZE)
            .fill(0)
            .map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
        </div>
      );
    }

    // Case 2: Error state
    if (error) {
      return (
        <div className="text-destructive py-4 text-center">
          <p>{t("ActivityFeed.error-no-notifications")}</p>
        </div>
      );
    }

    // Case 3: No notifications
    if (!notifications || notifications.length === 0) {
      return (
        <div className="text-muted-foreground py-4 text-center">
          <p>{t("ActivityFeed.no-notifications")}</p>
        </div>
      );
    }

    // Case 4: Has notifications
    return (
      <div className="flex flex-col gap-2">
        {paginatedNotifications.map((notification) => (
          <NotificationItem key={notification.id} {...notification} />
        ))}
      </div>
    );
  };

  return (
    <Card className="rounded-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("ActivityFeed.label-all")}</CardTitle>
          <MarkAllAsReadButton />
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
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
