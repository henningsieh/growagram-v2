import { eq } from "drizzle-orm";
import type { DB } from "~/lib/db";
import { comments } from "~/lib/db/schema";

export interface CommentWithAuthor {
  id: string;
  author: {
    id: string;
  };
  parentComment: CommentWithAuthor | null;
}

/**
 * Recursively get all parent comment authors for a given comment
 * @param db Database instance
 * @param commentId ID of the comment to get parents for
 * @returns Set of author IDs including the original comment's author
 */
export async function getAllParentCommentAuthors(
  db: DB,
  commentId: string,
): Promise<Set<string>> {
  const authorIds = new Set<string>();

  // add the author of the original comment
  const originalComment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    with: {
      author: {
        columns: {
          id: true,
        },
      },
    },
  });

  if (originalComment) {
    authorIds.add(originalComment.author.id);
  }

  async function getParentAuthors(currentCommentId: string): Promise<void> {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, currentCommentId),
      columns: {
        id: true,
      },
      with: {
        author: {
          columns: {
            id: true,
          },
        },
        parentComment: {
          columns: {
            id: true,
          },
          with: {
            author: {
              columns: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!comment) return;

    // Add current comment's author
    authorIds.add(comment.author.id);

    // Recursively get parent comment authors
    if (comment.parentComment) {
      await getParentAuthors(comment.parentComment.id);
    }
  }

  await getParentAuthors(commentId);
  return authorIds;
}
