// src/components/features/Comments/comment.tsx:
import { motion } from "framer-motion";
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
  const { data: session } = useSession();
  const t = useTranslations("Comments");

  const {
    isLiked,
    likeCount,
    isLoading: likesAreLoading,
  } = useLikeStatus(comment.id, LikeableEntityType.Comment);

  const { data: replies, isLoading: commentsAreLoading } =
    api.comments.getReplies.useQuery({ commentId: comment.id });

  const [replyComment, setReplyComment] = useState("");
  const postCommentMutation = api.comments.postComment.useMutation({
    onSuccess: () => {
      setReplyComment("");
      onCancelReply?.();
    },
  });

  const handleSubmitReply = () => {
    if (!replyComment.trim()) return;

    postCommentMutation.mutate({
      entityId: comment.entityId,
      entityType: comment.entityType,
      commentText: replyComment,
      parentCommentId: comment.id,
    });
  };

  return (
    !commentsAreLoading && (
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
              <span className="text-sm font-semibold">
                {comment.author.name}
              </span>
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
          isLikeStatusLoading={likesAreLoading}
          stats={{
            comments: replies ? replies.length : 0,
            views: 0,
            likes: likeCount,
          }}
          toggleComments={() => onReply?.(comment.id)}
        />

        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 border-t p-3">
              <div className="flex justify-center">
                <Avatar className="m-1 h-8 w-8">
                  <AvatarImage
                    src={(session?.user && session.user.image) || undefined}
                  />
                  <AvatarFallback>
                    {(session?.user && session.user.name?.[0]) || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex flex-1 gap-2">
                <Input
                  placeholder={t("reply-to-comment-placeholder")}
                  value={replyComment}
                  onChange={(e) => setReplyComment(e.target.value)}
                  className="h-8 w-full"
                />
                <Button
                  size="icon"
                  disabled={!replyComment.trim()}
                  onClick={handleSubmitReply}
                >
                  <Send size={18} />
                </Button>
                <Button variant="ghost" size="icon" onClick={onCancelReply}>
                  <X size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {replies &&
          replies.map((childComment) => (
            <div key={childComment.id} className="ml-6 border-l">
              <Comment
                comment={{
                  ...childComment,
                  author: comment.author,
                }}
                isSocial={isSocial}
              />
            </div>
          ))}
      </motion.div>
    )
  );
};
