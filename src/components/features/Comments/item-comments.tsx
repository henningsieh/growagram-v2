import { AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { User } from "next-auth";
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
  handleReply?: (commentId: string) => void;
  handleCancelReply?: () => void;
  replyingToComment?: string | null;
  user?: User | null;
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
  user: propUser,
}) => {
  const t = useTranslations("Comments");

  // If props are not provided, fall back to useComments hook
  const {
    user: hookUser,
    comments: hookComments,
    commentsLoading: hookCommentsLoading,
    replyingToComment: hookReplyingToComment,
    handleReply: hookHandleReply,
    handleCancelReply: hookHandleCancelReply,
    newComment: hookNewComment,
    setNewComment: hookSetNewComment,
    handleSubmitComment: hookHandleSubmitComment,
  } = propUser ? {} : useComments(entityId, entityType);

  // Use prop values if provided, otherwise use hook values
  const user = propUser || hookUser;
  const comments = propComments || hookComments;
  const commentsLoadingState = commentsLoading || hookCommentsLoading;
  const newComment = propNewComment || hookNewComment;
  const setNewComment = propSetNewComment || hookSetNewComment;
  const handleSubmitComment =
    propHandleSubmitComment || hookHandleSubmitComment;
  const handleReply = propHandleReply || hookHandleReply;
  const handleCancelReply = propHandleCancelReply || hookHandleCancelReply;
  const replyingToComment = propReplyingToComment || hookReplyingToComment;

  if (!user) return null;

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
      {user && (
        <div className="flex items-center gap-3 p-3">
          <div className="flex justify-center">
            <Avatar className="m-1 h-8 w-8">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
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
        <AnimatePresence>
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
        </AnimatePresence>
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
