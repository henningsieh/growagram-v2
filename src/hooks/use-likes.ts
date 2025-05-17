// src/hooks/use-likes.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { trpc } from "~/lib/trpc/react";
import { LikeableEntityType } from "~/types/like";

export const useLikeStatus = (
  entityId: string,
  entityType: LikeableEntityType,
) => {
  const { data: session } = useSession();
  const user = session?.user;

  const [userHasLiked, setUserHasLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(0);

  const likeCountQuery = trpc.likes.getLikeCount.useQuery({
    entityId,
    entityType,
  });

  // Only run queries if user is authenticated
  const userLikesQuery = trpc.likes.getUserLikedEntities.useQuery(
    { entityType },
    { enabled: !!user },
  );

  //TODO: this different behavior for "getLikeCount" and "getUserLikedEntities" is not clean!!!

  React.useEffect(() => {
    // Reset state if no user
    if (!user) {
      setUserHasLiked(false);
      // setLikeCount(0);
    }

    if (likeCountQuery.data) {
      setLikeCount(likeCountQuery.data.count);

      const userLikedEntity =
        userLikesQuery.data &&
        userLikesQuery.data.find((like) => like.entityId === entityId);

      setUserHasLiked(!!userLikedEntity);
    }
  }, [likeCountQuery.data, userLikesQuery.data, user, entityId, entityType]);

  return {
    isLiked: userHasLiked,
    likeCount,
    isLoading: likeCountQuery.isLoading || userLikesQuery.isLoading,
  };
};
