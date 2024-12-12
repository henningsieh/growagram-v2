// src/hooks/use-comments.tsx:
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { GetCommentsType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";

import { useToast } from "./use-toast";

export const useComments = (
  entityId: string,
  entityType: CommentableEntityType,
) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const utils = api.useUtils();

  const [newComment, setNewComment] = useState<string>("");
  const [commentCount, setCommentCount] = useState<number>(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [replyingToComment, setReplyingToComment] = useState<string | null>(
    null,
  );

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

  const pathname = usePathname();

  const toggleComments = () => {
    // Only allow opening comments if user is logged in
    if (session?.user) {
      setIsCommentsOpen(!isCommentsOpen);
    } else {
      toast({
        title: "Login Required",
        description: `Please log in to like content. URL:${pathname}`,
        variant: "secondary",
      });
    }
  };

  const postCommentMutation = api.comments.postComment.useMutation({
    onSuccess: async (_, newComment) => {
      // Refetch top-level comments for entity
      await commentsQuery.refetch();

      // Update comment count
      if (commentCountQuery.data) {
        setCommentCount(commentCountQuery.data.count + 1);
      }

      // Refetch replies if it's a reply to a specific comment
      if (newComment.parentCommentId) {
        await utils.comments.getReplies.refetch({
          commentId: newComment.parentCommentId,
        });
      }

      // Reset state
      setNewComment("");
      setReplyingToComment(null);
    },
    onError: (error) => {
      console.error("Failed to post comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
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

  const handleReply = (commentId: string | null) => {
    setReplyingToComment(commentId);
  };

  const handleCancelReply = () => {
    setReplyingToComment(null);
  };

  return {
    // Comment state and queries
    comments: commentsQuery.data as GetCommentsType | undefined,
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
  };
};
