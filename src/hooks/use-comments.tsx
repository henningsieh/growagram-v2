// src/hooks/use-comments.tsx:
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { api } from "~/lib/trpc/react";
import { GetCommentType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";

export const useComments = (
  entityId: string,
  entityType: CommentableEntityType,
) => {
  const { data: session } = useSession();
  const user = session?.user;

  const [commentCount, setCommentCount] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState<string | null>(
    null,
  );
  const [newComment, setNewComment] = useState("");

  const commentCountQuery = api.comments.getCommentCount.useQuery({
    entityId,
    entityType,
  });

  const commentsQuery = api.comments.getComments.useQuery(
    {
      entityId: entityId,
      entityType: entityType,
    },
    {
      enabled: !!session,
    },
  );

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

  const postCommentMutation = api.comments.postComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      setReplyingToComment(null);
      void commentsQuery.refetch();
      // Update comment count
      if (commentCountQuery.data) {
        setCommentCount(commentCountQuery.data.count + 1);
      }
    },
  });

  const handleSubmitComment = (parentCommentId?: string) => {
    if (!newComment.trim()) return;

    postCommentMutation.mutate({
      entityId: entityId,
      entityType: entityType,
      commentText: newComment,
      ...(parentCommentId && { parentCommentId }),
    });
  };

  const handleReply = (commentId: string) => {
    setReplyingToComment(commentId);
  };

  const handleCancelReply = () => {
    setReplyingToComment(null);
  };

  return {
    // Comment state and queries
    comments: commentsQuery.data as GetCommentType[] | undefined,
    commentsLoading: commentsQuery.isLoading,

    // Comment count state
    commentCount,
    commentCountLoading: commentCountQuery.isLoading,

    // UI state
    isCommentsOpen,
    toggleComments,

    // Reply state
    replyingToComment,
    handleReply,
    handleCancelReply,

    // Comment input state
    newComment,
    setNewComment,
    handleSubmitComment,

    // User session
    user,
  };
};
