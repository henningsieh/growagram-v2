import type React from "react";

import { Comment } from "~/components/features/Comments/comment";
import { useComments } from "~/hooks/use-comments";
import { api } from "~/lib/trpc/react";
import type { GetCommentType, GetRepliesInput } from "~/server/api/root";

interface CommentsTreeProps {
  comment: GetCommentType;
  isSocial?: boolean;
}

const CommentsTree: React.FC<CommentsTreeProps> = ({
  comment,
  isSocial = true,
}) => {
  const { data: replies, isLoading } = api.comments.getReplies.useQuery({
    commentId: comment.id,
  } satisfies GetRepliesInput);

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
          <div className="absolute bottom-1 left-[30px] top-[3rem] w-px bg-accent/60" />
          <ul className="space-y-4 pl-5 pt-2">
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
