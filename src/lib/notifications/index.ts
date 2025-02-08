import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import { notifications } from "~/lib/db/schema";
import { ee } from "~/server/api/routers/notifications";
import {
  NotifiableEntityType,
  NotificationEventType,
} from "~/types/notification";
import type { createNotificationSchema } from "~/types/zodSchema";

import { db } from "../db";
import { getAllParentCommentAuthors } from "../db/utils";

export async function createNotification(
  input: z.infer<typeof createNotificationSchema>,
) {
  const usersToNotify = new Set<string>();

  if (
    // Handle NEW_FOLLOW notifications
    input.notificationEventType === NotificationEventType.NEW_FOLLOW &&
    input.notifiableEntity.type === NotifiableEntityType.USER
  ) {
    usersToNotify.add(input.notifiableEntity.id);
  } else if (
    // Handle NEW_LIKE notifications
    input.notificationEventType === NotificationEventType.NEW_LIKE
  ) {
    // Get owner of liked entity
    if (input.notifiableEntity.type === NotifiableEntityType.POST) {
      const likedPost = await db.query.posts.findFirst({
        where: (posts) => eq(posts.id, input.notifiableEntity.id),
        with: {
          owner: true,
        },
      });
      // Add owner of liked post to users to notify
      if (likedPost) usersToNotify.add(likedPost.owner.id);
    } else if (input.notifiableEntity.type === NotifiableEntityType.COMMENT) {
      const likedComment = await db.query.comments.findFirst({
        where: (comments) => eq(comments.id, input.notifiableEntity.id),
        with: {
          author: true,
        },
      });
      // Add author of liked comment to users to notify
      if (likedComment) usersToNotify.add(likedComment.author.id);
    } else if (input.notifiableEntity.type === NotifiableEntityType.GROW) {
      const likedGrow = await db.query.grows.findFirst({
        where: (grows) => eq(grows.id, input.notifiableEntity.id),
        with: {
          owner: true,
        },
      });
      // Add owner of liked grow to users to notify
      if (likedGrow) usersToNotify.add(likedGrow.owner.id);
    } else if (input.notifiableEntity.type === NotifiableEntityType.PLANT) {
      const likedPlant = await db.query.plants.findFirst({
        where: (plants) => eq(plants.id, input.notifiableEntity.id),
        with: {
          owner: true,
        },
      });
      // Add owner of liked plant to users to notify
      if (likedPlant) usersToNotify.add(likedPlant.owner.id);
    } else if (input.notifiableEntity.type === NotifiableEntityType.PHOTO) {
      const likedPhoto = await db.query.images.findFirst({
        where: (images) => eq(images.id, input.notifiableEntity.id),
        with: {
          owner: true,
        },
      });
      // Add owener of likd photo to users to notify
      if (likedPhoto) usersToNotify.add(likedPhoto.owner.id);
    }
  } else if (
    // Handle NEW_COMMENT notifications
    input.notificationEventType === NotificationEventType.NEW_COMMENT
  ) {
    if (!input.commentId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Comment ID is required for NEW_COMMENT notifications`,
      });
    }
    const commentId = input.commentId;
    const comment = await db.query.comments.findFirst({
      where: (comments) => eq(comments.id, commentId),
      with: {
        author: true,
      },
    });
    if (!comment)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Comment not found`,
      });
    if (input.notifiableEntity.type === NotifiableEntityType.POST) {
      // Get owner of commented entity
      const commentedPost = await db.query.posts.findFirst({
        where: (posts) => eq(posts.id, input.notifiableEntity.id),
        with: {
          owner: true,
        },
      });
      // Add owner of commented post to users to notify
      if (commentedPost) usersToNotify.add(commentedPost.owner.id);
    } else if (input.notifiableEntity.type === NotifiableEntityType.GROW) {
      const commentedGrow = await db.query.grows.findFirst({
        where: (grows) => eq(grows.id, input.notifiableEntity.id),
        with: {
          owner: true,
        },
      });
      // Add owner of commented grow to users to notify
      if (commentedGrow) usersToNotify.add(commentedGrow.owner.id);
    } else if (input.notifiableEntity.type === NotifiableEntityType.PLANT) {
      // let entityId = null;
      // // get entity id depending on entity type
      // if (comment.entityType === CommentableEntityType.Plant) {
      //   entityId = await db.query.plants.findFirst({
      //     where: (plants) => eq(plants.id, comment.entityId),
      //   });
      // } else if (comment.entityType === CommentableEntityType.Photo) {
      //   entityId = await db.query.images.findFirst({
      //     where: (images) => eq(images.id, comment.entityId),
      //   });
      // } else if (comment.entityType === CommentableEntityType.Grow) {
      //   entityId = await db.query.grows.findFirst({
      //     where: (grows) => eq(grows.id, comment.entityId),
      //   });
      // } else if (comment.entityType === CommentableEntityType.Post) {
      //   entityId = await db.query.posts.findFirst({
      //     where: (posts) => eq(posts.id, comment.entityId),
      //   });
      // }

      const commentedPlant = await db.query.plants.findFirst({
        where: (plants) => eq(plants.id, input.notifiableEntity.id),
        with: {
          owner: true,
        },
      });
      // Add owner of commented plant to users to notify
      if (commentedPlant) usersToNotify.add(commentedPlant.owner.id);
    } else if (input.notifiableEntity.type === NotifiableEntityType.PHOTO) {
      const commentedPhoto = await db.query.images.findFirst({
        where: (images) => eq(images.id, input.notifiableEntity.id),
        with: {
          owner: true,
        },
      });
      // Add owner of commented photo to users to notify
      if (commentedPhoto) usersToNotify.add(commentedPhoto.owner.id);
    } else if (input.notifiableEntity.type === NotifiableEntityType.COMMENT) {
      // 1. Collect all notification recipients for parent comments

      const parentAuthors = await getAllParentCommentAuthors(
        db,
        input.commentId,
      );
      // 2. Add all parent comment authors to users to notify
      parentAuthors.forEach((authorId) => usersToNotify.add(authorId));
    }
  }

  // Remove actor from notifications
  usersToNotify.delete(input.actorData.id);

  // Create notifications for all users in db
  const createdNotifications = await Promise.all(
    Array.from(usersToNotify).map((userId) =>
      db
        .insert(notifications)
        .values({
          userId, // recipient
          actorId: input.actorData.id, // sender
          type: input.notificationEventType,
          commentId: input.commentId,
          entityType: input.notifiableEntity.type,
          entityId: input.notifiableEntity.id,
        })
        .returning(),
    ),
  );

  // Emit tRPC Server-Sent Events for created notifications
  createdNotifications.flat().forEach((notification) => {
    ee.emit("notification", {
      ...notification,
      actor: input.actorData,
    });
  });

  return createdNotifications.flat();
}
