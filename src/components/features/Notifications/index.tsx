"use client";

import { Bell, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useNotifications } from "~/hooks/use-notifications";
import { cn } from "~/lib/utils";

import { NotificationItem, NotificationSkeleton } from "./notification-item";

export function Notifications() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          disabled={!session}
          title={t("navigation.trigger-button-title")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
          <span className={statusIndicatorClass} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-svw p-0 sm:w-[28rem]"
        sideOffset={8}
      >
        <Tabs defaultValue="all" className="w-full">
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-4 gap-1">
              <TabsTrigger
                value="all"
                className="text-sm hover:bg-accent/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                All ({all.length})
              </TabsTrigger>
              <TabsTrigger
                value="follow"
                className="text-sm hover:bg-accent/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                Follows ({grouped.follow.length})
              </TabsTrigger>
              <TabsTrigger
                value="like"
                className="text-sm hover:bg-accent/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                Likes ({grouped.like.length})
              </TabsTrigger>
              <TabsTrigger
                value="comment"
                className="text-sm hover:bg-accent/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                Kommentare ({grouped.comment.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex justify-between border-b p-2">
            <Button
              variant="outline"
              size="sm"
              // onClick={handleGoToAllNotifications}
            >
              Go to All Notifications
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault(); // Prevent link navigation
                e.stopPropagation(); // Prevent Link onClick
                markAllAsRead();
              }}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </Button>
          </div>

          <ScrollArea className="h-[min(60vh,400px)]">
            {isLoading ? (
              <div className="flex flex-col gap-1 p-1">
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
              </div>
            ) : subscriptionError || queryError ? (
              <div className="p-4 text-center text-sm text-red-500">
                Failed to load notifications
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-1">
                <TabsContent value="all" className="m-0">
                  <div className="flex flex-col items-center justify-between gap-1">
                    {all.length > 0 ? (
                      all.map((notification, key) => (
                        <NotificationItem
                          key={key}
                          setOpen={setOpen}
                          {...notification}
                        />
                      ))
                    ) : (
                      <p className="p-2 text-center text-sm text-muted-foreground">
                        No notifications
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="follow" className="m-0">
                  <div className="flex flex-col items-center justify-between gap-1">
                    {grouped.follow.length > 0 ? (
                      grouped.follow.map((notification) => (
                        <NotificationItem
                          setOpen={setOpen}
                          key={notification.id}
                          {...notification}
                        />
                      ))
                    ) : (
                      <p className="p-2 text-center text-sm text-muted-foreground">
                        No follow notifications
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
                          setOpen={setOpen}
                          {...notification}
                        />
                      ))
                    ) : (
                      <p className="p-2 text-center text-sm text-muted-foreground">
                        No like notifications
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="comment" className="m-0">
                  {grouped.comment.length > 0 ? (
                    grouped.comment.map((notification, key) => (
                      <NotificationItem
                        key={key}
                        setOpen={setOpen}
                        {...notification}
                      />
                    ))
                  ) : (
                    <p className="p-2 text-center text-sm text-muted-foreground">
                      No comment notifications
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
