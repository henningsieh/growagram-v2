import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { images, likes, plants } from "~/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  getLikeCountInput,
  getUserLikedEntitiesInut,
  toggleLikeInput,
} from "~/types/zodSchema";

export const likeRouter = createTRPCRouter({
  toggleLike: protectedProcedure
    .input(toggleLikeInput)
    .mutation(async ({ ctx, input }) => {
      const { entityId, entityType } = input;
      const userId = ctx.session.user.id;

      // Validate entity exists and user has permission
      let entityExists = false;
      if (entityType === "plant") {
        const plant = await ctx.db.query.plants.findFirst({
          where: eq(plants.id, entityId),
        });
        entityExists = !!plant;
      } else if (entityType === "image") {
        const image = await ctx.db.query.images.findFirst({
          where: eq(images.id, entityId),
        });
        entityExists = !!image;
      }

      if (!entityExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${entityType} not found`,
        });
      }

      // Check if like already exists
      const existingLike = await ctx.db.query.likes.findFirst({
        where: and(
          eq(likes.userId, userId),
          eq(likes.entityId, entityId),
          eq(likes.entityType, entityType),
        ),
      });

      if (existingLike) {
        // Unlike: remove the existing like
        await ctx.db
          .delete(likes)
          .where(
            and(
              eq(likes.userId, userId),
              eq(likes.entityId, entityId),
              eq(likes.entityType, entityType),
            ),
          );
        return { liked: false };
      } else {
        // Like: insert new like
        await ctx.db.insert(likes).values({
          userId,
          entityId,
          entityType,
        });
        return { liked: true };
      }
    }),

  getLikeCount: protectedProcedure
    .input(getLikeCountInput)
    .query(async ({ ctx, input }) => {
      const { entityId, entityType } = input;

      const likeCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(likes)
        .where(
          and(eq(likes.entityId, entityId), eq(likes.entityType, entityType)),
        );

      return { count: Number(likeCount[0]?.count ?? 0) };
    }),

  getUserLikedEntities: protectedProcedure
    .input(getUserLikedEntitiesInut)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { entityType } = input;

      const userLikes = await ctx.db.query.likes.findMany({
        where: entityType
          ? and(eq(likes.userId, userId), eq(likes.entityType, entityType))
          : eq(likes.userId, userId),
      });

      return userLikes.map((like) => ({
        entityId: like.entityId,
        entityType: like.entityType,
      }));
    }),
});
