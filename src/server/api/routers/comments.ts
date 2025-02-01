// src/server/api/routers/comments.ts:
import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { comments, grows, images, plants, posts } from "~/lib/db/schema";
import { protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { CommentableEntityType } from "~/types/comment";

export const commentRouter = {
  // Post a new comment (create a new comment)
  postComment: protectedProcedure
    .input(
      z.object({
        entityId: z.string(),
        entityType: z.nativeEnum(CommentableEntityType),
        commentText: z.string().min(1),
        parentCommentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { entityId, entityType, commentText, parentCommentId } = input;
      const userId = ctx.session.user.id;

      // Validate entity exists
      let entityExists = false;
      if (entityType === CommentableEntityType.Plant) {
        const plant = await ctx.db.query.plants.findFirst({
          where: eq(plants.id, entityId),
        });
        entityExists = !!plant;
      } else if (entityType === CommentableEntityType.Photo) {
        const photo = await ctx.db.query.images.findFirst({
          where: eq(images.id, entityId),
        });
        entityExists = !!photo;
      } else if (entityType === CommentableEntityType.Grow) {
        const grow = await ctx.db.query.grows.findFirst({
          where: eq(grows.id, entityId),
        });
        entityExists = !!grow;
      } else if (entityType === CommentableEntityType.Post) {
        const post = await ctx.db.query.posts.findFirst({
          where: eq(posts.id, entityId),
        });
        entityExists = !!post;
      }

      if (!entityExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${entityType} not found`,
        });
      }

      // Insert new comment
      const newComment = await ctx.db.insert(comments).values({
        userId,
        entityId,
        entityType,
        commentText,
        parentCommentId,
      });

      return { comment: newComment };
    }),

  // Edit an existing comment
  editComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        commentText: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId, commentText } = input;
      const userId = ctx.session.user.id;

      // Find the comment
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, commentId),
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (comment.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own comments",
        });
      }

      // Update the comment
      const updatedComment = await ctx.db
        .update(comments)
        .set({ commentText })
        .where(eq(comments.id, commentId));

      return { updatedComment };
    }),

  // Delete a comment
  deleteById: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;

      // Find the comment
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, commentId),
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (comment.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }

      // Delete the comment
      await ctx.db.delete(comments).where(eq(comments.id, commentId));

      return { deleted: true };
    }),

  // Get the comment count for a specific entity
  getCommentCount: publicProcedure
    .input(
      z.object({
        entityId: z.string(),
        entityType: z.nativeEnum(CommentableEntityType),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { entityId, entityType } = input;

      const commentCount = await ctx.db
        .select({ count: count() })
        .from(comments)
        .where(
          and(
            eq(comments.entityId, entityId),
            eq(comments.entityType, entityType),
          ),
        );

      return { count: Number(commentCount[0]?.count ?? 0) };
    }),

  // Get all comments for a specific entity (WITHOUT nested replies)
  getComments: protectedProcedure
    .input(
      z.object({
        entityId: z.string(),
        entityType: z.nativeEnum(CommentableEntityType),
        sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { entityId, entityType, sortOrder } = input;

      // Fetch comments without answers for the given entity
      const allComments = await ctx.db.query.comments.findMany({
        where: and(
          eq(comments.entityId, entityId),
          eq(comments.entityType, entityType),
          isNull(comments.parentCommentId), // without answers on top level
        ),
        orderBy:
          sortOrder === SortOrder.ASC
            ? asc(comments.createdAt)
            : desc(comments.createdAt),
        with: { author: true },
      });

      return allComments;
    }),

  // Get nested replies for a specific comment
  getReplies: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { commentId } = input;

      // Fetch replies for the given comment
      const commentReplies = await ctx.db.query.comments.findMany({
        where: eq(comments.parentCommentId, commentId),
        orderBy: asc(comments.createdAt),
        with: { author: true },
      });

      return commentReplies;
    }),
};
