"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { AdminUserListItem } from "~/server/api/root";

interface ActionsCellProps {
  user: AdminUserListItem;
}

export function ActionsCell({ user }: ActionsCellProps) {
  const t = useTranslations("AdminArea.user-management");
  const router = useRouter();

  const handleCopyUserId = () => {
    try {
      navigator.clipboard.writeText(user.id);
      toast.success(t("toasts.copy-success"));
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.copy-error"));
    }
  };

  const handleViewProfile = () => {
    router.push(`/public/profile/${user.id}`);
  };

  const handleEditDetails = () => {
    router.push(`/admin/users/${user.id}/edit`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{"Open menu"}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-primary font-bold">
          {t("columns.actions")}
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCopyUserId}>
          {t("buttons.copy-id")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewProfile}>
          {t("buttons.view-profile")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditDetails}>
          {t("buttons.edit-details")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          {t("buttons.delete-user")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
