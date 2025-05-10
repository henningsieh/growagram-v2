"use client";

import { useTranslations } from "next-intl";
import { ListChecksIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useNotifications } from "~/hooks/use-notifications";
import { cn } from "~/lib/utils";

interface MarkAllAsReadButtonProps {
  label?: string;
  className?: string;
}

export function MarkAllAsReadButton({
  className,
  label,
}: MarkAllAsReadButtonProps) {
  const t = useTranslations("Notifications");

  const { markAllAsRead, unreadCount } = useNotifications();

  return (
    <Button
      className={cn("p-1", className)}
      variant="secondary"
      aria-label={t("panel.mark-all-as-read")}
      title={t("panel.mark-all-as-read")}
      size="sm"
      onClick={() => markAllAsRead()}
      disabled={unreadCount === 0}
    >
      <ListChecksIcon className="h-4 w-4" />

      <div className="xs:block hidden">
        {label ? label : t("panel.mark-all-as-read")}
      </div>
    </Button>
  );
}
