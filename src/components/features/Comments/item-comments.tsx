// src/components/features/Comments/item-comments.tsx:
import { AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useComments } from "~/hooks/use-comments";
import { CommentableEntityType } from "~/types/comment";

import { Comment } from "./comment";

interface ItemCommentsProps {
  entityId: string;
  entityType: CommentableEntityType;
  isSocial: boolean;
  onClose?: () => void;
}

export const ItemComments: React.FC<ItemCommentsProps> = ({
  entityId,
  entityType,
  isSocial,
  onClose,
}) => {
  const t = useTranslations("Comments");
  const {
    user,
    comments,
    commentsLoading,
    replyingToComment,
    handleReply,
    handleCancelReply,
    newComment,
    setNewComment,
    handleSubmitComment,
  } = useComments(entityId, entityType);

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
              onChange={(e) => setNewComment(e.target.value)}
              className="h-8 w-full"
            />
          </div>
          <Button
            size="icon"
            disabled={!newComment.trim()}
            onClick={() => handleSubmitComment()}
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
    </div>
  );
};
