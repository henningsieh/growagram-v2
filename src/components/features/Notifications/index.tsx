"use client";

import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useNotifications } from "~/hooks/use-notifications";

import { NotificationItem } from "./notification-item";

export function Notifications() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const { notifications } = useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          disabled={!session}
        >
          <Bell className="h-5 w-5" />
          {notifications?.length ? (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {notifications.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <ScrollArea className="h-80">
          <div className="flex flex-col gap-1 p-2">
            {notifications?.length ? (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} {...notification} />
              ))
            ) : (
              <p className="p-2 text-center text-sm text-muted-foreground">
                No new notifications
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
