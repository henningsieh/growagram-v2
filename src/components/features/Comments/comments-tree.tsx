// src/components/features/Comments/comments-tree.tsx:
import type React from "react";
import { useQuery } from "@tanstack/react-query";
import { Comment } from "~/components/features/Comments/comment";
import { useComments } from "~/hooks/use-comments";
import type { GetCommentType, GetRepliesInput } from "~/server/api/root";
import { useTRPC } from "~/trpc/client";

interface CommentsTreeProps {
  comment: GetCommentType;
  isSocial?: boolean;
}

const CommentsTree: React.FC<CommentsTreeProps> = ({
  comment,
  isSocial = true,
}) => {
  const trpc = useTRPC();
  const { data: replies, isLoading } = useQuery(
    trpc.comments.getReplies.queryOptions({
      commentId: comment.id,
    } satisfies GetRepliesInput),
  );

  const { handleReply, handleCancelReply, replyingToComment } = useComments(
    comment.entityId,
    comment.entityType,
  );

  return (
    <div className="relative">
      <Comment
        comment={comment}
        isSocial={isSocial}
        isReplying={replyingToComment === comment.id}
        onReply={handleReply}
        onCancelReply={handleCancelReply}
      />

      {!isLoading && replies && replies.length > 0 && (
        <>
          {/* Connection Line - Improved version */}
          <div
            className="absolute"
            style={{
              left: "24px", // Align precisely with the avatar
              width: "2px", // Slightly thinner for elegance
              background:
                "linear-gradient(180deg, var(--border) 0%, var(--accent) 10%, var(--accent) 90%, var(--border) 100%)",
              position: "absolute",
              top: "3.25rem",
              height: `calc(100% - 3.25rem)`, // Extend to the bottom of the container
              opacity: 0.6, // Semi-transparent
              zIndex: 1,
            }}
          />
          <ul className="space-y-4 pt-2 pl-5">
            {replies.map((reply) => (
              <li key={reply.id} className="relative">
                <CommentsTree comment={reply} isSocial={isSocial} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default CommentsTree;
