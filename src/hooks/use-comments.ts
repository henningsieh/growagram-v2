// src/hooks/use-comments.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { useTRPC } from "~/lib/trpc/react";
import type { GetCommentsInput, GetCommentsType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";

import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export const useComments = (
  entityId: string,
  entityType: CommentableEntityType,
) => {
  const trpc = useTRPC();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const t = useTranslations();

  const [newComment, setNewComment] = React.useState<string>("");
  const [commentCount, setCommentCount] = React.useState<number>(0);
  const [isCommentsOpen, setIsCommentsOpen] = React.useState<boolean>(false);
  const [replyingToComment, setReplyingToComment] = React.useState<
    string | null
  >(null);

  const commentCountQuery = useQuery(trpc.comments.getCommentCount.queryOptions({
    entityId,
    entityType,
  }));

  React.useEffect(() => {
    if (commentCountQuery.data) {
      setCommentCount(commentCountQuery.data.count);
    }
  }, [commentCountQuery.data]);

  const commentsSortOrder = SortOrder.DESC satisfies SortOrder;

  const commentsQuery = useQuery(trpc.comments.getComments.queryOptions(
    {
      entityId: entityId,
      entityType: entityType,
      sortOrder: commentsSortOrder,
    } satisfies GetCommentsInput,
    {
      enabled: !!session,
    },
  ));

  const toggleComments = () => {
    // Only allow opening comments if user is logged in
    if (session?.user) {
      setIsCommentsOpen(!isCommentsOpen);
    } else {
      toast("Login Required", {
        description: t("CardFooter.Sign in to view and add comments"),
      });
    }
  };

  const postCommentMutation = useMutation(trpc.comments.postComment.mutationOptions({
    onSuccess: async (_, newComment) => {
      // First use optimistic updates...
      queryClient.setQueryData(trpc.comments.getCommentCount.queryKey({
        entityId: entityId,
        entityType: entityType,
      }), (old) => ({
        count: (old?.count ?? 0) + 1,
      }));

      // ...then invalidate the queries
      await queryClient.invalidateQueries(trpc.comments.getComments.pathFilter());
      await queryClient.invalidateQueries(trpc.comments.getCommentCount.pathFilter());

      // Update comment count
      await commentCountQuery.refetch();

      // Refetch replies if it's a reply to a specific comment
      if (newComment.parentCommentId) {
        await queryClient.refetchQueries(trpc.comments.getReplies.queryFilter({
          commentId: newComment.parentCommentId,
        }));
      }

      // Reset state
      setNewComment("");
      setReplyingToComment(null);
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to post comment",
      });
    },
  }));

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
    setNewComment(""); // Clear the previous reply text when replying to a new comment
  };

  const handleCancelReply = () => {
    setReplyingToComment(null);
    setNewComment(""); // Clear the reply input
  };

  const searchParams = useSearchParams();
  const commentIdToScrollTo = searchParams.get("commentId");

  // Auto-expand comments if commentId is in URL
  React.useEffect(() => {
    if (commentIdToScrollTo) {
      setIsCommentsOpen(true);
    }
  }, [commentIdToScrollTo]);

  // Scroll to comment after comments are loaded
  React.useEffect(() => {
    if (!commentIdToScrollTo || !isCommentsOpen || commentsQuery.isLoading)
      return;

    // Add a small delay to ensure the DOM has updated
    const scrollTimer = setTimeout(() => {
      const element = document.getElementById(commentIdToScrollTo);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 150);

    return () => clearTimeout(scrollTimer);
  }, [commentIdToScrollTo, isCommentsOpen, commentsQuery.isLoading]);

  return {
    // Comment state and queries
    comments: commentsQuery.data satisfies GetCommentsType | undefined,
    commentsLoading: commentsQuery.isLoading,
    commentsSortOrder,

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
    isSubmitting: postCommentMutation.isPending,
  };
};
