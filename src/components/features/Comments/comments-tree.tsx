// src/components/features/Comments/comment-tree.tsx:
import SpinningLoader from "~/components/Layouts/loader";
import { useComments } from "~/hooks/use-comments";
import { api } from "~/lib/trpc/react";
import { GetCommentType, GetRepliesInput } from "~/server/api/root";

import { Comment } from "./comment";

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
    <div className={`relative border-l border-muted`}>
      <Comment
        comment={comment}
        isSocial={isSocial}
        isReplying={replyingToComment === comment.id}
        onReply={handleReply}
        onCancelReply={handleCancelReply}
      />

      {!isLoading && replies && (
        <div className="ml-6 mt-4 border-l border-muted">
          {replies.map((reply) => (
            <CommentsTree key={reply.id} comment={reply} isSocial={isSocial} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsTree;
