"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Reply, Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { SocialCardFooter } from "~/components/atom/social-card-footer";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useLikeStatus } from "~/hooks/use-likes";
import { api } from "~/lib/trpc/react";
import { GetCommentType } from "~/server/api/root";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";

interface ItemCommentsProps {
  entityId: string;
  entityType: CommentableEntityType;
  isSocial: boolean;
  onClose?: () => void;
}

interface CommentDisplayProps {
  comment: GetCommentType;
  onReply?: (commentId: string) => void;
  isSocial: boolean;
}

const CommentDisplay: React.FC<CommentDisplayProps> = ({
  comment,
  onReply,
  isSocial,
}) => {
  const { data: session } = useSession();

  const { isLiked, likeCount, isLoading } = useLikeStatus(
    comment.id,
    LikeableEntityType.Comment,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex gap-3 p-3">
        <div className="flex justify-center">
          <Avatar className="m-1 h-8 w-8">
            <AvatarImage src={comment.author.image || undefined} />
            <AvatarFallback>{comment.author.name?.[0] || "?"}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm">{comment.commentText}</p>
          {session && onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-6"
              onClick={() => onReply(comment.id)}
            >
              <Reply size={14} className="mr-1" /> Reply
            </Button>
          )}
        </div>
      </div>
      <SocialCardFooter
        className={`pb-2 pr-2 ${isSocial && "ml-16"} border-b`}
        entityId={comment.id}
        entityType={LikeableEntityType.Comment}
        initialLiked={isLiked}
        isLikeStatusLoading={isLoading}
        stats={{
          comments: comment.childComments.length,
          views: 0,
          likes: likeCount,
        }}
        toggleComments={function (): void {
          // throw new Error("Function not implemented.");
        }}
      />
    </motion.div>
  );
};

export const ItemComments: React.FC<ItemCommentsProps> = ({
  entityId,
  entityType,
  isSocial,
  onClose,
}) => {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
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
      setReplyingTo(null);
      void refetch();
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    postCommentMutation.mutate({
      entityId: entityId,
      entityType: entityType,
      commentText: newComment,
      ...(replyingTo && { parentCommentId: replyingTo }),
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
              placeholder={
                replyingTo
                  ? t("reply-to-comment-placeholder")
                  : t("add-comment-placeholder")
              }
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
            <CommentDisplay
              key={comment.id}
              comment={comment}
              isSocial={isSocial}
              onReply={(commentId) => {
                setReplyingTo(commentId);
                // Optional: scroll to input
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
