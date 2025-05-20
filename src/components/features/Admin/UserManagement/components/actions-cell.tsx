"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { BAN_DURATIONS, modulePaths } from "~/assets/constants";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTRPC } from "~/lib/trpc/client";
import type { AdminUserListItem } from "~/server/api/root";

interface ActionsCellProps {
  user: AdminUserListItem;
}

export function ActionsCell({ user }: ActionsCellProps) {
  const trpc = useTRPC();
  const t = useTranslations("AdminArea.user-management");
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if user is currently banned
  const isUserBanned = React.useMemo(() => {
    if (!user.bannedUntil) return false;
    const bannedUntil = new Date(user.bannedUntil);
    return bannedUntil > new Date() || user.bannedUntil === null; // null means permanent ban
  }, [user.bannedUntil]);

  // Ban user mutation
  const banUserMutation = useMutation(
    trpc.admin.banUser.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.admin.getAllUsers.pathFilter(),
        );
        toast.success("User banned successfully", {
          description:
            "The user has been banned and cannot log in until the ban expires.",
        });
      },
      onError: (error) => {
        toast.error("Failed to ban user", {
          description: error.message || "An unexpected error occurred",
        });
      },
    }),
  );

  // Unban user mutation
  const unbanUserMutation = useMutation(
    trpc.admin.unbanUser.mutationOptions({
      onSuccess: async () => {
        toast.success("User unbanned successfully", {
          description:
            "The user's ban has been lifted and they can now log in.",
        });
        await queryClient.invalidateQueries(
          trpc.admin.getAllUsers.pathFilter(),
        );
      },
      onError: (error) => {
        toast.error("Failed to unban user", {
          description: error.message || "An unexpected error occurred",
        });
      },
    }),
  );

  const handleCopyUserId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      toast.success(t("toasts.copy-success"));
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.copy-error"));
    }
  };

  const handleViewProfile = () => {
    router.push(`${modulePaths.PUBLICPROFILE.path}/${user.id}`);
  };

  const handleEditDetails = () => {
    router.push(`${modulePaths.USERADMINISTRATION.path}/${user.id}/edit`);
  };

  const handleBanUser = async (duration: string) => {
    await banUserMutation.mutateAsync({
      userId: user.id,
      banDuration: duration,
      banReason: `Admin action: User banned for ${BAN_DURATIONS.find((d) => d.value === duration)?.label.toLowerCase() || duration}`,
    });
  };

  const handleUnbanUser = async () => {
    await unbanUserMutation.mutateAsync({ userId: user.id });
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
        {isUserBanned ? (
          <DropdownMenuItem
            className="text-destructive"
            onClick={handleUnbanUser}
          >
            {t("buttons.unban-user")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-destructive">
              {t("buttons.ban-user")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {BAN_DURATIONS.map((duration) => (
                <DropdownMenuItem
                  key={duration.value}
                  onClick={() => handleBanUser(duration.value)}
                >
                  {duration.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          {t("buttons.delete-user")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
