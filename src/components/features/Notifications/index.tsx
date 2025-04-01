"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ArrowRightIcon, BellIcon, ListChecksIcon } from "lucide-react";
import {
  NotificationItem,
  NotificationSkeleton,
} from "~/components/features/Notifications/notification-item";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useNotifications } from "~/hooks/use-notifications";
import { Link } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";

export function Notifications() {
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("Notifications");

  const {
    all,
    grouped,
    unreadCount,
    isLoading,
    markAllAsRead,
    subscriptionStatus,
    subscriptionError,
    error: queryError,
  } = useNotifications();

  const statusIndicatorClass = cn(
    "absolute -right-1 -top-1 h-2 w-2 rounded-full",
    {
      "bg-yellow-500 animate-pulse": subscriptionStatus === "connecting",
      "bg-green-500": subscriptionStatus === "pending",
      "bg-red-500": subscriptionStatus === "error",
    },
  );

  // Function to close the popover
  const closePopover = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          disabled={!session}
          title={t("Navigation.trigger-button-title")}
        >
          <BellIcon strokeWidth={1.8} className="size-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
          {process.env.NODE_ENV === "development" && (
            <span className={statusIndicatorClass} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-svw p-0 sm:w-[28rem]"
        sideOffset={8}
      >
        <Tabs defaultValue="all" className="w-full gap-0">
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-4 gap-1">
              <TabsTrigger
                value="all"
                className="hover:bg-accent/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm"
              >
                <span className="flex items-center gap-1">
                  <span className="xs:max-w-none max-w-[42px] truncate">
                    {t("panel.tabs.label_All")}
                  </span>
                  <span>
                    {`(`}
                    {all.length}
                    {`)`}
                  </span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="follow"
                className="hover:bg-accent/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm"
              >
                <span className="flex items-center gap-1">
                  <span className="xs:max-w-none max-w-[42px] truncate">
                    {t("panel.tabs.label_Follows")}
                  </span>
                  <span>
                    {`(`}
                    {grouped.follow.length}
                    {`)`}
                  </span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="like"
                className="hover:bg-accent/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm"
              >
                <span className="flex items-center gap-1">
                  <span className="xs:max-w-none max-w-[42px] truncate">
                    {t("panel.tabs.label_Likes")}
                  </span>
                  <span>
                    {`(`}
                    {grouped.like.length}
                    {`)`}
                  </span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="comment"
                className="hover:bg-accent/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm"
              >
                <span className="flex items-center gap-1">
                  <span className="xs:max-w-none max-w-[42px] truncate">
                    {t("panel.tabs.label_Comments")}
                  </span>
                  <span>
                    {`(`}
                    {grouped.comment.length}
                    {`)`}
                  </span>
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex justify-between border-b p-2">
            <Button variant="link" asChild size="sm" className="px-0">
              <Link
                className="px-0"
                href="/dashboard#activity"
                onClick={closePopover}
              >
                {t("ActivityFeed.label-all")}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              className="p-1"
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.preventDefault(); // Prevent link navigation
                e.stopPropagation(); // Prevent Link onClick
                markAllAsRead();
              }}
              disabled={unreadCount === 0}
            >
              <ListChecksIcon className="h-4 w-4" />
              {t("panel.mark-all-as-read")}
            </Button>
          </div>

          <ScrollArea className="h-[min(60vh,400px)] pr-1">
            {isLoading ? (
              <div className="flex flex-col gap-1 p-1">
                <NotificationSkeleton className="h-[52px]" />
                <NotificationSkeleton className="h-[52px]" />
                <NotificationSkeleton className="h-[52px]" />
                <NotificationSkeleton className="h-[52px]" />
                <NotificationSkeleton className="h-[52px]" />
              </div>
            ) : subscriptionError || queryError ? (
              <div className="p-4 text-center text-sm text-red-500">
                {t("panel.error")}
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-1">
                <TabsContent value="all" className="m-0">
                  <div className="flex flex-col items-center justify-between gap-1">
                    {all.length > 0 ? (
                      all.map((notification, key) => (
                        <NotificationItem
                          key={key}
                          close={closePopover}
                          {...notification}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground p-2 text-center text-sm">
                        {t("panel.no-notifications")}
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="follow" className="m-0">
                  <div className="flex flex-col items-center justify-between gap-1">
                    {grouped.follow.length > 0 ? (
                      grouped.follow.map((notification) => (
                        <NotificationItem
                          close={closePopover}
                          key={notification.id}
                          {...notification}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground p-2 text-center text-sm">
                        {t("panel.no-follow-notifications")}
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="like" className="m-0">
                  <div className="flex flex-col items-center justify-between gap-1">
                    {grouped.like.length > 0 ? (
                      grouped.like.map((notification, key) => (
                        <NotificationItem
                          key={key}
                          close={closePopover}
                          {...notification}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground p-2 text-center text-sm">
                        {t("panel.no-like-notifications")}
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="comment" className="m-0">
                  {grouped.comment.length > 0 ? (
                    grouped.comment.map((notification, key) => (
                      <NotificationItem
                        key={key}
                        close={closePopover}
                        {...notification}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground p-2 text-center text-sm">
                      {t("panel.no-comment-notifications")}
                    </p>
                  )}
                </TabsContent>
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
