// src/components/features/Comments/comment-tree.tsx:
import React from "react";
import SpinningLoader from "~/components/Layouts/loader";
import { useComments } from "~/hooks/use-comments";
import { api } from "~/lib/trpc/react";
import { GetCommentType, GetRepliesInput } from "~/server/api/root";

import { Comment } from "./comment";

interface CommentTreeProps {
  comment: GetCommentType;
  isSocial?: boolean;
}

const CommentTree: React.FC<CommentTreeProps> = ({
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
        onUpdateReplyingComment={handleReply}
      />

      {isLoading ? (
        <SpinningLoader className="my-4 h-6 w-6" />
      ) : (
        replies && (
          <div className="ml-6 mt-4 border-l border-muted">
            {replies.map((reply, index) => {
              return (
                <CommentTree
                  key={index}
                  comment={{
                    ...reply,
                    author: comment.author,
                  }}
                  isSocial={isSocial}
                />
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default CommentTree;
