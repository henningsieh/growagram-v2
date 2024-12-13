// src/components/features/Comments/item-comments.tsx:
import { Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import SpinningLoader from "~/components/Layouts/loader";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useComments } from "~/hooks/use-comments";
import { CommentableEntityType } from "~/types/comment";

import CommentTree from "./comment-tree";

interface ItemCommentsProps {
  entityId: string;
  entityType: CommentableEntityType;
  onClose?: () => void;
  isSocial: boolean;
}

export const ItemComments: React.FC<ItemCommentsProps> = ({
  entityId,
  entityType,
  onClose,
  isSocial,
}) => {
  const t = useTranslations("Comments");

  const {
    comments,
    commentCountLoading,
    newComment,
    setNewComment,
    handleSubmitComment,
  } = useComments(entityId, entityType);

  const { data: session, status } = useSession();
  if (status === "loading") {
    // Show a loading state while authentication status is being resolved
    return <SpinningLoader />;
  }

  return (
    <div className="relative mt-2">
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10"
          onClick={onClose}
        >
          <X size={20} />
          qwüvubqwrpviiub
        </Button>
      )}
      {session && (
        <div className="m-2 flex items-center gap-3 rounded-sm bg-muted p-1">
          <div className="flex justify-center">
            <Avatar className="m-0 h-8 w-8">
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
          <CommentTree key={comment.id} comment={comment} isSocial={isSocial} />
        ))}
      </div>
      {comments?.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          {t("no-comments-yet")}
        </div>
      )}
      {commentCountLoading && (
        <div className="p-4 text-center text-muted-foreground">
          {t("loading-comments")}
        </div>
      )}
    </div>
  );
};
