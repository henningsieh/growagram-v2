"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
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
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { toast } = useToast();
  const utils = api.useUtils();

  const { mutate: follow, isPending: isFollowLoading } =
    api.users.followUser.useMutation({
      onSuccess: () => {
        setIsFollowing(true);
        toast({ title: "Successfully followed user" });
        utils.users.getPublicUserProfile.invalidate();
      },
    });

  const { mutate: unfollow, isPending: isUnfollowLoading } =
    api.users.unfollowUser.useMutation({
      onSuccess: () => {
        setIsFollowing(false);
        toast({ title: "Successfully unfollowed user" });
        utils.users.getPublicUserProfile.invalidate();
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
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
