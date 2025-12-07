// src/components/features/Comments/comments.tsx:
import * as React from "react";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Send } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import { CustomAvatar } from "~/components/atom/custom-avatar";
import SpinningLoader from "~/components/atom/spinning-loader";
import CommentsTree from "~/components/features/Comments/comments-tree";

import { CommentableEntityType } from "~/types/comment";

import { useComments } from "~/hooks/use-comments";

interface CommentsProps {
  entityId: string;
  entityType: CommentableEntityType;
  isSocial: boolean;
}

export const Comments: React.FC<CommentsProps> = ({
  entityId,
  entityType,
  isSocial = true,
}) => {
  const t = useTranslations("Comments");

  const {
    comments,
    commentsLoading,
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
    <div className="mt-2">
      {session && (
        <div className="bg-accent/30 mx-1 my-2 flex items-center gap-2 rounded-sm py-1 pr-1 pl-1">
          <div className="flex justify-center">
            <CustomAvatar
              size={38}
              src={session.user?.image || undefined}
              alt={session.user?.name || "User avatar"}
              fallback={session.user?.name?.[0] || "?"}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder={t("add-comment-placeholder")}
              value={newComment}
              onChange={(e) => setNewComment?.(e.target.value)}
              className="isolate h-8 w-full"
            />
          </div>
          <Button
            size="icon"
            disabled={!newComment?.trim()}
            onClick={() => handleSubmitComment?.()}
          >
            <Send size={20} />
          </Button>
        </div>
      )}
      <div className="max-h-fit overflow-y-auto">
        {comments?.map((comment) => (
          <CommentsTree
            key={comment.id}
            comment={comment}
            isSocial={isSocial}
          />
        ))}
      </div>
      {comments?.length === 0 && (
        <div className="text-muted-foreground p-4 text-center">
          {t("no-comments-yet")}
        </div>
      )}
      {commentsLoading && (
        <div className="text-muted-foreground p-4 text-center">
          {t("loading-comments")}
        </div>
      )}
    </div>
  );
};
