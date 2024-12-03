import { useEffect, useState } from "react";
import { api } from "~/lib/trpc/react";

export const useLikeStatus = (
  entityId: string,
  entityType: "plant" | "image",
) => {
  const [isLiked, setIsLiked] = useState(false);
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

      setIsLiked(!!userLikedEntity);
    }
  }, [likeCountQuery.data, userLikesQuery.data, entityId, entityType]);

  console.debug(isLiked, likeCount);

  return {
    isLiked,
    likeCount,
    isLoading: likeCountQuery.isLoading || userLikesQuery.isLoading,
  };
};
