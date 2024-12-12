// src/components/features/Comments/comment.tsx:
import { AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/trpc/react";
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
  const [newComment, setNewComment] = useState("");
  const [replyingToComment, setReplyingToComment] = useState<string | null>(
    null,
  );
  const { data: session } = useSession();
  const t = useTranslations("Comments");

  const { data: comments, refetch } = api.comments.getComments.useQuery(
    {
      entityId: entityId,
      entityType: entityType,
    },
    {
      enabled: !!session,
    },
  );

  const postCommentMutation = api.comments.postComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      void refetch();
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    postCommentMutation.mutate({
      entityId: entityId,
      entityType: entityType,
      commentText: newComment,
    });
  };

  if (!session) return null;

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

      {session?.user && (
        <div className="flex items-center gap-3 p-3">
          <div className="flex justify-center">
            <Avatar className="m-1 h-8 w-8">
              <AvatarImage src={session.user.image || undefined} />
              <AvatarFallback>{session.user.name?.[0] || "?"}</AvatarFallback>
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
            onClick={handleSubmitComment}
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
              onReply={(commentId) => {
                setReplyingToComment(commentId);
              }}
              onCancelReply={() => {
                setReplyingToComment(null);
              }}
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
