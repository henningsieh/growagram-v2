// src/server/api/routers/likes.ts:
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { comments, grows, images, likes, plants, posts } from "~/lib/db/schema";
import { NotificationFactoryRegistry } from "~/lib/notifications/core";
import { protectedProcedure, publicProcedure } from "~/lib/trpc/init";
import { LikeableEntityType } from "~/types/like";
import {
  NotifiableEntityType,
  NotificationEventType,
} from "~/types/notification";

export const likeRouter = {
  toggleLike: protectedProcedure
    .input(
      z.object({
        entityId: z.string(),
        entityType: z.nativeEnum(LikeableEntityType),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { entityId, entityType } = input;
      const userId = ctx.session.user.id;

      // Validate entity exists and user has permission
      let entityExists = false;
      if (entityType === LikeableEntityType.Plant) {
        const plant = await ctx.db.query.plants.findFirst({
          where: eq(plants.id, entityId),
        });
        entityExists = !!plant;
      } else if (entityType === LikeableEntityType.Photo) {
        const photo = await ctx.db.query.images.findFirst({
          where: eq(images.id, entityId),
        });
        entityExists = !!photo;
      } else if (entityType === LikeableEntityType.Grow) {
        const grow = await ctx.db.query.grows.findFirst({
          where: eq(grows.id, entityId),
        });
        entityExists = !!grow;
      } else if (entityType === LikeableEntityType.Comment) {
        const comment = await ctx.db.query.comments.findFirst({
          where: eq(comments.id, entityId),
        });
        entityExists = !!comment;
      } else if (entityType === LikeableEntityType.Post) {
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
        await ctx.db
          .insert(likes)
          .values({
            userId,
            entityId,
            entityType,
          })
          .returning();

        const notifiableEntityType = () => {
          switch (entityType) {
            case LikeableEntityType.Grow:
              return NotifiableEntityType.GROW;
            case LikeableEntityType.Plant:
              return NotifiableEntityType.PLANT;
            case LikeableEntityType.Photo:
              return NotifiableEntityType.PHOTO;
            case LikeableEntityType.Comment:
              return NotifiableEntityType.COMMENT;
            case LikeableEntityType.Post:
              return NotifiableEntityType.POST;

            default: {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Invalid likeable entity type",
              });
            }
          }
        };

        await NotificationFactoryRegistry.createNotification(
          NotificationEventType.NEW_LIKE,
          {
            entityType: notifiableEntityType(),
            entityId: entityId,
            actorId: ctx.session.user.id,
            actorName: ctx.session.user.name,
            actorUsername: ctx.session.user.username ?? null,
            actorImage: ctx.session.user.image ?? null,
          },
        );

        return { liked: true };
      }
    }),

  getLikeCount: publicProcedure
    .input(
      z.object({
        entityId: z.string(),
        entityType: z.nativeEnum(LikeableEntityType),
      }),
    )
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
    .input(
      z.object({
        entityType: z.nativeEnum(LikeableEntityType).optional(),
      }),
    )
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
};
