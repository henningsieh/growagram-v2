//src/components/features/Comments/comment.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DotIcon, Reply, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import SpinningLoader from "~/components/Layouts/loader";
import AvatarCardHeader, {
  ActionItem,
} from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { CustomAvatar } from "~/components/atom/custom-avatar";
import { HighlightElement } from "~/components/atom/highlight-element";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
import { api } from "~/lib/trpc/react";
import { formatDate, formatTime } from "~/lib/utils";
import type {
  GetCommentType,
  GetCommentsInput,
  GetRepliesInput,
} from "~/server/api/root";
import { LikeableEntityType } from "~/types/like";
import { Locale } from "~/types/locale";
import { UserRoles } from "~/types/user";

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

  const locale = useLocale();
  const utils = api.useUtils();
  const t = useTranslations("Comments");
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  // Focus on the input field when replying
  React.useEffect(() => {
    if (isReplying && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isReplying]);

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
      toast(t("toasts.success.deleteComment.title"), {
        description: t("toasts.success.deleteComment.description"),
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

      toast.error(t("toasts.errors.deleteComment.title"), {
        description: `${t("toasts.errors.deleteComment.description")} ${error.message || `Failed to delete comment with ID: ${commentId}`}`,
      });
    },
  });

  // Handle comment deletion
  const handleDeleteComment = () => {
    deleteMutation.mutate({ commentId: comment.id });
  };

  // Handle cancelling reply
  const handleCancelReply = () => {
    setReplyComment("");
    onCancelReply?.();
  };

  // Check if the current user is the comment author or an admin
  const hasPermission =
    session?.user?.id === comment.author.id ||
    session?.user?.role === UserRoles.ADMIN;
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const commentActions: ActionItem[] = hasPermission
    ? [
        {
          icon: Trash2,
          label: t("buttons.deleteComment.label"),
          onClick: () => setShowDeleteDialog(true), // Open dialog instead of direct deletion
          variant: "destructive",
          disabled: deleteMutation.isPending,
        },
      ]
    : [];

  const dateElement = (
    <div className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap">
      {<DotIcon size={24} className="xs:block -mx-2 hidden" />}
      {formatDate(comment.createdAt, locale as Locale)}{" "}
      {formatTime(comment.createdAt, locale as Locale)}
    </div>
  );

  return (
    <>
      <HighlightElement
        id={comment.id}
        isHighlighted={isHighlighted}
        key={`highlight-${comment.id}-${isHighlighted}`}
      />
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={async () => {
          await handleDeleteComment();
          setShowDeleteDialog(false);
        }}
        isDeleting={deleteMutation.isPending}
        title={t("dialogs.deleteComment.title")}
        description={t("dialogs.deleteComment.alertCautionText")}
        alertCautionText={t("dialogs.deleteComment.description")}
      />
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative flex gap-2 p-1 pl-1">
          <div className="flex-1">
            <AvatarCardHeader
              user={comment.author}
              dateElement={dateElement}
              showActions={hasPermission}
              actions={commentActions}
            />
            <p className="ml-12 px-0.5 pt-1 pb-1 text-sm">
              {comment.commentText}
            </p>
          </div>
        </div>

        <SocialCardFooter
          className={`pr-2 pb-2 ${isSocial && "ml-12"}`}
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
              transition={{ duration: 0.15 }}
              exit={{
                opacity: 0,
                height: 0,
                transition: { duration: 0.15 },
              }}
            >
              <div className="m-0 flex items-center gap-2 rounded-sm pl-2.5">
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
                    disabled={isSubmitting}
                    className="bg-background h-8 w-full text-sm"
                  />
                  <Button
                    className="shrink-0"
                    size="icon"
                    disabled={!replyComment.trim() || isSubmitting}
                    onClick={handleReplySubmit}
                  >
                    {isSubmitting ? (
                      <SpinningLoader className="h-5 w-5 animate-spin text-white" />
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
    </>
  );
};
