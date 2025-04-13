"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { UserMinusIcon, UserPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/lib/trpc/react";

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
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = React.useState(initialIsFollowing);
  const utils = api.useUtils();
  const t = useTranslations("Profile");

  const { mutate: follow, isPending: isFollowLoading } =
    api.users.followUser.useMutation({
      onSuccess: async () => {
        setIsFollowing(true);
        toast(t("FollowButton.follow-success-title"), {
          description: t("FollowButton.follow-success-description"),
        });
        await utils.users.getPublicUserProfile.invalidate();
      },
    });

  const { mutate: unfollow, isPending: isUnfollowLoading } =
    api.users.unfollowUser.useMutation({
      onSuccess: async () => {
        setIsFollowing(false);
        toast(t("FollowButton.unfollow-success-title"), {
          description: t("FollowButton.unfollow-success-description"),
        });
        await utils.users.getPublicUserProfile.invalidate();
      },
    });

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
