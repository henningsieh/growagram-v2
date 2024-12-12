// src/hooks/use-comments.tsx:
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { api } from "~/lib/trpc/react";
import { CommentableEntityType } from "~/types/comment";

export const useCommentStatus = (
  entityId: string,
  entityType: CommentableEntityType,
) => {
  const { data: session } = useSession();
  const user = session?.user;

  const [commentCount, setCommentCount] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const commentCountQuery = api.comments.getCommentCount.useQuery({
    entityId,
    entityType,
  });

  useEffect(() => {
    if (commentCountQuery.data) {
      setCommentCount(commentCountQuery.data.count);
    }
  }, [commentCountQuery.data]);

  const toggleComments = () => {
    // Only allow opening comments if user is logged in
    if (user) {
      setIsCommentsOpen(!isCommentsOpen);
    }
  };

  return {
    commentCount,
    isCommentsOpen,
    toggleComments,
    isLoading: commentCountQuery.isLoading,
  };
};
