//src/components/features/Comments/comment.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { DotIcon, Reply, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ActionItem } from "~/components/atom/actions-menu";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { DeleteConfirmationDialog } from "~/components/atom/confirm-delete";
import { CustomAvatar } from "~/components/atom/custom-avatar";
import { HighlightElement } from "~/components/atom/highlight-element";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import SpinningLoader from "~/components/atom/spinning-loader";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useComments } from "~/hooks/use-comments";
import { useLikeStatus } from "~/hooks/use-likes";
// adjust import if needed
import { formatDate, formatTime } from "~/lib/utils";
import type {
  GetCommentType,
  GetCommentsInput,
  GetRepliesInput,
} from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
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
  const t = useTranslations("Comments");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // NEW: tRPC + TanStack Query hooks
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const {
    isLiked,
    likeCount,
    isLoading: likesAreLoading,
  } = useLikeStatus(comment.id, LikeableEntityType.Comment);

  const { data: replies, isLoading: commentCountLoading } = useQuery(
    trpc.comments.getReplies.queryOptions({
      commentId: comment.id,
    } satisfies GetRepliesInput),
  );

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

  // --- Mutation for deleting a comment ---
  const deleteMutation = useMutation(
    trpc.comments.deleteById.mutationOptions({
      // 1. onMutate
      onMutate: async ({ commentId: deletedCommentId }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.comments.getReplies.queryKey({
            commentId: comment.id,
          }),
        });

        const previousCommentsOnThisLevel = comment.parentCommentId
          ? queryClient.getQueryData(
              trpc.comments.getReplies.queryKey({
                commentId: comment.parentCommentId,
              }),
            )
          : queryClient.getQueryData(
              trpc.comments.getComments.queryKey({
                entityId: comment.entityId,
                entityType: comment.entityType,
                sortOrder: commentsSortOrder,
              } satisfies GetCommentsInput),
            );

        if (comment.parentCommentId) {
          queryClient.setQueryData(
            trpc.comments.getReplies.queryKey({
              commentId: comment.parentCommentId,
            }),
            (parentsReplies: GetCommentType[] | undefined) =>
              parentsReplies?.filter((r) => r.id !== deletedCommentId) || [],
          );
        } else {
          queryClient.setQueryData(
            trpc.comments.getComments.queryKey({
              entityId: comment.entityId,
              entityType: comment.entityType,
              sortOrder: commentsSortOrder,
            }),
            (entitysComments: GetCommentType[] | undefined) =>
              entitysComments?.filter((r) => r.id !== deletedCommentId) || [],
          );
        }

        return { previousCommentsOnThisLevel };
      },

      // 2. onSuccess
      onSuccess: async () => {
        toast(t("toasts.success.deleteComment.title"), {
          description: t("toasts.success.deleteComment.description"),
        });

        await queryClient.invalidateQueries({
          queryKey: trpc.comments.getReplies.queryKey({
            commentId: comment.id,
          }),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.comments.getComments.queryKey({
            entityId: comment.entityId,
            entityType: comment.entityType,
            sortOrder: commentsSortOrder,
          }),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.comments.getCommentCount.queryKey({
            entityId: comment.entityId,
            entityType: comment.entityType,
          }),
        });
      },

      // 3. onError
      onError: (error, { commentId }, context) => {
        if (context?.previousCommentsOnThisLevel) {
          if (comment.parentCommentId) {
            queryClient.setQueryData(
              trpc.comments.getReplies.queryKey({
                commentId: comment.parentCommentId,
              }),
              context.previousCommentsOnThisLevel,
            );
          } else {
            queryClient.setQueryData(
              trpc.comments.getComments.queryKey({
                entityId: comment.entityId,
                entityType: comment.entityType,
                sortOrder: commentsSortOrder,
              }),
              context.previousCommentsOnThisLevel,
            );
          }
        }

        toast.error(t("toasts.errors.deleteComment.title"), {
          description: `${t("toasts.errors.deleteComment.description")} ${error.message || `Failed to delete comment with ID: ${commentId}`}`,
        });
      },
    }),
  );

  // Create a separate confirmDelete function
  const confirmDelete = async () => {
    await deleteMutation.mutateAsync({ commentId: comment.id });
    setShowDeleteDialog(false);
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
        onConfirmDelete={confirmDelete}
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
          className={`${isSocial && "ml-12"}`}
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
