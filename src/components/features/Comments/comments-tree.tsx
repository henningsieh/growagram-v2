// src/components/features/Comments/comments-tree.tsx:
import type React from "react";
import { Comment } from "~/components/features/Comments/comment";
import { useComments } from "~/hooks/use-comments";
import { useTRPC } from "~/lib/trpc/react";
import type { GetCommentType, GetRepliesInput } from "~/server/api/root";

import { useQuery } from "@tanstack/react-query";

interface CommentsTreeProps {
  comment: GetCommentType;
  isSocial?: boolean;
}

const CommentsTree: React.FC<CommentsTreeProps> = ({
  comment,
  isSocial = true,
}) => {
  const trpc = useTRPC();
  const { data: replies, isLoading } = useQuery(trpc.comments.getReplies.queryOptions({
    commentId: comment.id,
  } satisfies GetRepliesInput));

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
          <div className="bg-accent/60 absolute top-[3rem] bottom-1 left-[25px] w-px" />
          <ul className="space-y-4 pt-2 pl-5">
            {replies.map((reply) => (
              <li key={reply.id}>
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
