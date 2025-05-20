"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { UserMinusIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/lib/trpc/client";

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  initialIsFollowing,
  className,
}: FollowButtonProps) {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = React.useState(initialIsFollowing);
  const queryClient = useQueryClient();
  const t = useTranslations("Profile");

  const { mutate: follow, isPending: isFollowLoading } = useMutation(
    trpc.users.followUser.mutationOptions({
      onSuccess: async () => {
        setIsFollowing(true);
        toast(t("FollowButton.follow-success-title"), {
          description: t("FollowButton.follow-success-description"),
        });
        await queryClient.invalidateQueries(
          trpc.users.getPublicUserProfile.pathFilter(),
        );
      },
    }),
  );

  const { mutate: unfollow, isPending: isUnfollowLoading } = useMutation(
    trpc.users.unfollowUser.mutationOptions({
      onSuccess: async () => {
        setIsFollowing(false);
        toast(t("FollowButton.unfollow-success-title"), {
          description: t("FollowButton.unfollow-success-description"),
        });
        await queryClient.invalidateQueries(
          trpc.users.getPublicUserProfile.pathFilter(),
        );
      },
    }),
  );

  if (!session || session.user.id === userId) return null;

  return (
    <Button
      variant={isFollowing ? "outline" : "primary"}
      size="sm"
      className={className}
      onClick={() => (isFollowing ? unfollow({ userId }) : follow({ userId }))}
      disabled={isFollowLoading || isUnfollowLoading}
    >
      {isFollowing ? (
        <div className="flex w-full items-center justify-center">
          <UserMinusIcon className="mr-2 h-5 w-5" />
          <span>{t("FollowButton.unfollow")}</span>
        </div>
      ) : (
        <div className="flex w-full items-center justify-center">
          <UserPlusIcon className="mr-2 h-5 w-5" />
          <span>{t("FollowButton.follow")}</span>
        </div>
      )}
    </Button>
  );
}
