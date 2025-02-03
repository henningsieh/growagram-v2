import { AnimatePresence, motion } from "framer-motion";
import { Reply, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import SpinningLoader from "~/components/Layouts/loader";
import CustomAvatar from "~/components/atom/custom-avatar";
import { HighlightElement } from "~/components/atom/highlight-element";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/lib/trpc/react";
import type {
  GetCommentType,
  GetCommentsInput,
  GetRepliesInput,
} from "~/server/api/root";
import { LikeableEntityType } from "~/types/like";

interface CommentProps {
  comment: GetCommentType;
  onReply?: (commentId: string) => void;
  isSocial: boolean;
  isReplying?: boolean;
  onCancelReply?: () => void;
}

export const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  isSocial,
  isReplying = false,
  onCancelReply,
}) => {
  const searchParams = useSearchParams();
  const isHighlighted = searchParams.get("commentId") === comment.id;

  const { data: session } = useSession();
  const { toast } = useToast();
  const utils = api.useUtils();
  const t = useTranslations("Comments");
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isLiked,
    likeCount,
    isLoading: likesAreLoading,
  } = useLikeStatus(comment.id, LikeableEntityType.Comment);

  const { data: replies, isLoading: commentCountLoading } =
    api.comments.getReplies.useQuery({ commentId: comment.id });

  const {
    newComment: replyComment,
    setNewComment: setReplyComment,
    handleSubmitComment,
    isSubmitting,
    commentsSortOrder,
  } = useComments(comment.entityId, comment.entityType);
  const handleReplySubmit = () => {
    handleSubmitComment(comment.id);
  };

  // Initialize delete mutation with optimistic updates
  const deleteMutation = api.comments.deleteById.useMutation({
    // Optimistic update: immediately remove the comment from the UI
    onMutate: async ({ commentId: deletedCommentId }) => {
      // Cancel any outgoing refetches
      await utils.comments.getReplies.cancel({ commentId: comment.id });

      // Snapshot the previous comments on this nested Level
      const previousCommentsOnThisLevel = comment.parentCommentId
        ? utils.comments.getReplies.getData({
            commentId: comment.parentCommentId,
          } satisfies GetRepliesInput)
        : utils.comments.getComments.getData({
            entityId: comment.entityId,
            entityType: comment.entityType,
            sortOrder: commentsSortOrder,
          } satisfies GetCommentsInput);

      if (comment.parentCommentId) {
        // Optimistically remove the deleted comment from the other parent's replies
        utils.comments.getReplies.setData(
          {
            commentId: comment.parentCommentId,
          },
          (parentsReplies) =>
            parentsReplies?.filter((r) => r.id !== deletedCommentId) || [],
        );
      } else {
        // Optimistically remove the deleted comment from entity's comments
        utils.comments.getComments.setData(
          {
            entityId: comment.entityId,
            entityType: comment.entityType,
            sortOrder: commentsSortOrder,
          },
          (entitysComments) =>
            entitysComments?.filter((r) => r.id !== deletedCommentId) || [],
        );
      }

      // Return a context object with the snapshotted value
      return { previousCommentsOnThisLevel };
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });

      // Invalidate queries to ensure fresh data
      await utils.comments.getReplies.invalidate({ commentId: comment.id });
      await utils.comments.getComments.invalidate();
      await utils.comments.getCommentCount.invalidate();
    },
    onError: (error, { commentId }, context) => {
      // Rollback the optimistic update if deletion fails
      if (context?.previousCommentsOnThisLevel) {
        utils.comments.getReplies.setData(
          { commentId: comment.id },
          context.previousCommentsOnThisLevel,
        );
      }

      toast({
        title: "Error",
        description:
          error.message || `Failed to delete comment with ID: ${commentId}`,
        variant: "destructive",
      });
    },
  });

  // Check if the current user is the comment author
  const isAuthor = session?.user?.id === comment.author.id;

  // Handle comment deletion
  const handleDeleteComment = () => {
    deleteMutation.mutate({ commentId: comment.id });
  };

  // Handle cancelling reply
  const handleCancelReply = () => {
    setReplyComment("");
    onCancelReply?.();
  };

  // Focus on the input field when replying
  useEffect(() => {
    if (isReplying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isReplying]);

  return (
    <HighlightElement id={comment.id} isHighlighted={isHighlighted}>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative flex gap-2 p-2">
          <div className="flex justify-center">
            <CustomAvatar
              size={32}
              src={comment.author.image || undefined}
              alt={comment.author.name || "User avatar"}
              fallback={comment.author.name?.[0] || "?"}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {comment.author.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
              {isAuthor && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="m-1 ml-auto h-8 w-8 bg-destructive/5 text-muted-foreground hover:text-foreground"
                  onClick={handleDeleteComment}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={20} />
                </Button>
              )}
            </div>
            <p className="text-sm">{comment.commentText}</p>
          </div>
        </div>

        <SocialCardFooter
          className={`pb-2 pr-2 ${isSocial && "ml-14"}`}
          entityId={comment.id}
          entityType={LikeableEntityType.Comment}
          initialLiked={isLiked}
          isLikeStatusLoading={likesAreLoading}
          commentCountLoading={commentCountLoading}
          stats={{ comments: replies?.length, likes: likeCount, views: 0 }}
          toggleComments={
            !isReplying ? () => onReply?.(comment.id) : handleCancelReply
          }
        />

        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              exit={{
                opacity: 0,
                height: 0,
                transition: { duration: 0.2 },
              }}
            >
              <div className="m-2 flex items-center gap-3 rounded-sm bg-muted p-1">
                <CustomAvatar
                  size={32}
                  src={session?.user?.image || undefined}
                  alt={session?.user?.username || "User avatar"}
                  fallback={session?.user?.name?.[0] || "?"}
                />
                <div className="flex flex-1 gap-2">
                  <Input
                    ref={inputRef}
                    placeholder={t("reply-to-comment-placeholder")}
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    className="h-8 w-full"
                    disabled={isSubmitting}
                  />
                  <Button
                    className="shrink-0"
                    size="icon"
                    disabled={!replyComment.trim() || isSubmitting}
                    onClick={handleReplySubmit}
                  >
                    {isSubmitting ? (
                      <SpinningLoader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Reply size={20} />
                    )}
                  </Button>
                  <Button
                    className="shrink-0"
                    variant="outline"
                    size="icon"
                    onClick={handleCancelReply}
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </HighlightElement>
  );
};
