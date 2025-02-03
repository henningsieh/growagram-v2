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

export async function createNotification(
  input: z.infer<typeof createNotificationSchema>,
) {
  const usersToNotify = new Set<string>();

  if (
    // Handle NEW_FOLLOW notifications
    input.notificationType === NotificationEventType.NEW_FOLLOW &&
    input.entityData.type === NotifiableEntityType.USER
  ) {
    usersToNotify.add(input.entityData.id);
  } else if (
    // Handle NEW_LIKE notifications
    input.notificationType === NotificationEventType.NEW_LIKE
  ) {
    // Get owner of liked entity
    if (input.entityData.type === NotifiableEntityType.POST) {
      const likedPost = await db.query.posts.findFirst({
        where: (posts) => eq(posts.id, input.entityData.id),
        with: {
          owner: true,
        },
      });
      // Add owner of liked post to users to notify
      if (likedPost) usersToNotify.add(likedPost.owner.id);
    } else if (input.entityData.type === NotifiableEntityType.COMMENT) {
      const likedComment = await db.query.comments.findFirst({
        where: (comments) => eq(comments.id, input.entityData.id),
        with: {
          author: true,
        },
      });
      // Add author of liked comment to users to notify
      if (likedComment) usersToNotify.add(likedComment.author.id);
    } else if (input.entityData.type === NotifiableEntityType.GROW) {
      const likedGrow = await db.query.grows.findFirst({
        where: (grows) => eq(grows.id, input.entityData.id),
        with: {
          owner: true,
        },
      });
      // Add owner of liked grow to users to notify
      if (likedGrow) usersToNotify.add(likedGrow.owner.id);
    } else if (input.entityData.type === NotifiableEntityType.PLANT) {
      const likedPlant = await db.query.plants.findFirst({
        where: (plants) => eq(plants.id, input.entityData.id),
        with: {
          owner: true,
        },
      });
      // Add owner of liked plant to users to notify
      if (likedPlant) usersToNotify.add(likedPlant.owner.id);
    } else if (input.entityData.type === NotifiableEntityType.PHOTO) {
      const likedPhoto = await db.query.images.findFirst({
        where: (images) => eq(images.id, input.entityData.id),
        with: {
          owner: true,
        },
      });
      // Add owener of likd photo to users to notify
      if (likedPhoto) usersToNotify.add(likedPhoto.owner.id);
    }
    // Handle NEW_COMMENT notifications
  } else {
    // Get owner of commented entity
    if (input.entityData.type === NotifiableEntityType.POST) {
      const commentedPost = await db.query.posts.findFirst({
        where: (posts) => eq(posts.id, input.entityData.id),
        with: {
          owner: true,
        },
      });
      // Add owner of commented post to users to notify
      if (commentedPost) usersToNotify.add(commentedPost.owner.id);
    } else if (input.entityData.type === NotifiableEntityType.COMMENT) {
      // FIXME: This does not work, because NotifiableEntityType.COMMENT
      // is never thrown in `commentRouter`
      const commentedComment = await db.query.comments.findFirst({
        where: (comments) => eq(comments.id, input.entityData.id),
        with: {
          author: true,
          parentComment: {
            with: {
              author: true,
            },
          },
        },
      });
      // Add author of commented comment to users to notify
      if (commentedComment) usersToNotify.add(commentedComment.author.id);
      // Add author of parent comment to users to notify
      if (commentedComment?.parentComment) {
        usersToNotify.add(commentedComment.parentComment.author.id);
      }
    } else if (input.entityData.type === NotifiableEntityType.GROW) {
      const commentedGrow = await db.query.grows.findFirst({
        where: (grows) => eq(grows.id, input.entityData.id),
        with: {
          owner: true,
        },
      });
      // Add owner of commented grow to users to notify
      if (commentedGrow) usersToNotify.add(commentedGrow.owner.id);
    } else if (input.entityData.type === NotifiableEntityType.PLANT) {
      const commentedPlant = await db.query.plants.findFirst({
        where: (plants) => eq(plants.id, input.entityData.id),
        with: {
          owner: true,
        },
      });
      // Add owner of commented plant to users to notify
      if (commentedPlant) usersToNotify.add(commentedPlant.owner.id);
    } else if (input.entityData.type === NotifiableEntityType.PHOTO) {
      const commentedPhoto = await db.query.images.findFirst({
        where: (images) => eq(images.id, input.entityData.id),
        with: {
          owner: true,
        },
      });
      // Add owner of commented photo to users to notify
      if (commentedPhoto) usersToNotify.add(commentedPhoto.owner.id);
    }
  }

  // Remove actor from notifications
  //usersToNotify.delete(input.actorData.id);

  // Create notifications for all users
  const createdNotifications = await Promise.all(
    Array.from(usersToNotify).map((userId) =>
      db
        .insert(notifications)
        .values({
          userId, // recipient
          actorId: input.actorData.id, // sender
          type: input.notificationType,
          entityType: input.entityData.type,
          entityId: input.entityData.id,
        })
        .returning(),
    ),
  );

  // Emit events for created notifications
  createdNotifications.flat().forEach((notification) => {
    ee.emit("notification", {
      ...notification,
      actor: input.actorData,
    });
  });

  return createdNotifications.flat();
}
