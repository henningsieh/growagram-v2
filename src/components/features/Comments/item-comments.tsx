// src/components/features/Comments/item-comments.tsx:
import { Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useComments } from "~/hooks/use-comments";
import { GetCommentType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";

import { Comment } from "./comment";

interface ItemCommentsProps {
  entityId: string;
  entityType: CommentableEntityType;
  isSocial: boolean;
  onClose?: () => void;
  // New optional props from useComments hook
  comments?: GetCommentType[];
  commentsLoading?: boolean;
  newComment?: string;
  setNewComment?: (comment: string) => void;
  handleSubmitComment?: (parentCommentId?: string) => void;
  handleReply?: (commentId: string | null) => void;
  handleCancelReply?: () => void;
  replyingToComment?: string | null;
}

export const ItemComments: React.FC<ItemCommentsProps> = ({
  entityId,
  entityType,
  isSocial,
  onClose,
  // New props with fallback to useComments hook
  comments: propComments,
  commentsLoading,
  newComment: propNewComment,
  setNewComment: propSetNewComment,
  handleSubmitComment: propHandleSubmitComment,
  handleReply: propHandleReply,
  handleCancelReply: propHandleCancelReply,
  replyingToComment: propReplyingToComment,
}) => {
  const t = useTranslations("Comments");

  // Always call useComments, but only use its values if props are not provided
  const commentHook = useComments(entityId, entityType);

  // Use prop values if provided, otherwise use hook values
  const comments = propComments || commentHook.comments;
  const commentsLoadingState = commentsLoading || commentHook.commentsLoading;
  const newComment = propNewComment || commentHook.newComment;
  const setNewComment = propSetNewComment || commentHook.setNewComment;
  const handleSubmitComment =
    propHandleSubmitComment || commentHook.handleSubmitComment;
  const handleReply = propHandleReply || commentHook.handleReply;
  const handleCancelReply =
    propHandleCancelReply || commentHook.handleCancelReply;
  const replyingToComment =
    propReplyingToComment || commentHook.replyingToComment;

  const { data: session, status } = useSession();
  if (status === "loading") {
    // Show a loading state while authentication status is being resolved
    return <>Loading...</>;
  }

  return (
    <div className="relative mt-2 border-t">
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10"
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      )}
      {session && (
        <div className="flex items-center gap-3 p-3">
          <div className="flex justify-center">
            <Avatar className="m-1 h-8 w-8">
              <AvatarImage src={session.user?.image || undefined} />
              <AvatarFallback>{session.user?.name?.[0] || "?"}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <Input
              placeholder={t("add-comment-placeholder")}
              value={newComment}
              onChange={(e) => setNewComment?.(e.target.value)}
              className="h-8 w-full"
            />
          </div>
          <Button
            size="icon"
            disabled={!newComment?.trim()}
            onClick={() => handleSubmitComment?.()}
          >
            <Send size={18} />
          </Button>
        </div>
      )}
      <div className="max-h-fit overflow-y-auto">
        {comments?.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            isSocial={isSocial}
            isReplying={replyingToComment === comment.id}
            onReply={handleReply}
            onCancelReply={handleCancelReply}
            replyingToCommentId={replyingToComment}
            onUpdateReplyingComment={handleReply}
          />
        ))}
      </div>
      {comments?.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          {t("no-comments-yet")}
        </div>
      )}
      {commentsLoadingState && (
        <div className="p-4 text-center text-muted-foreground">
          {t("loading-comments")}
        </div>
      )}
    </div>
  );
};
