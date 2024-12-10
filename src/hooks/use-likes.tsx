// src/hooks/use-likes.tsx:
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { api } from "~/lib/trpc/react";
import { LikeableEntityType } from "~/types/like";

export const useLikeStatus = (
  entityId: string,
  entityType: LikeableEntityType,
) => {
  const { data: session, status } = useSession();
  // const session: Session | null
  // const status: "authenticated" | "loading" | "unauthenticated"

  const user = session?.user;

  const [userHasLiked, setUserHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const likeCountQuery = api.likes.getLikeCount.useQuery({
    entityId,
    entityType,
  });

  const userLikesQuery = api.likes.getUserLikedEntities.useQuery({
    entityType,
  });

  useEffect(() => {
    if (likeCountQuery.data && userLikesQuery.data) {
      setLikeCount(likeCountQuery.data.count);

      const userLikedEntity = userLikesQuery.data.find(
        (like) => like.entityId === entityId,
      );

      setUserHasLiked(!!userLikedEntity);
    }
  }, [likeCountQuery.data, userLikesQuery.data, entityId, entityType]);

  return {
    isLiked: userHasLiked,
    likeCount,
    isLoading: likeCountQuery.isLoading || userLikesQuery.isLoading,
  };
};
