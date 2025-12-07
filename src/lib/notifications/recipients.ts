import { eq } from "drizzle-orm";

import {
  NotifiableEntityType,
  NotificationEventType,
} from "~/types/notification";

import { db } from "~/lib/db";
import { getAllParentCommentAuthors } from "~/lib/db/utils";

/**
 * Determines who should receive notifications for different events
 */
export class NotificationRecipientResolver {
  /**
   * Get recipients for a follow notification
   */
  static getFollowRecipients(entityId: string): string[] {
    // For follows, the recipient is the user being followed
    return [entityId];
  }

  /**
   * Get recipients for a like notification
   */
  static async getLikeRecipients(
    entityType: NotifiableEntityType,
    entityId: string,
  ): Promise<string[]> {
    const recipients = new Set<string>();

    switch (entityType) {
      case NotifiableEntityType.POST: {
        const likedPost = await db.query.posts.findFirst({
          where: (posts) => eq(posts.id, entityId),
          with: { owner: true },
        });
        if (likedPost) recipients.add(likedPost.owner.id);
        break;
      }
      case NotifiableEntityType.GROW: {
        const likedGrow = await db.query.grows.findFirst({
          where: (grows) => eq(grows.id, entityId),
          with: { owner: true },
        });
        if (likedGrow) recipients.add(likedGrow.owner.id);
        break;
      }
      case NotifiableEntityType.PLANT: {
        const likedPlant = await db.query.plants.findFirst({
          where: (plants) => eq(plants.id, entityId),
          with: { owner: true },
        });
        if (likedPlant) recipients.add(likedPlant.owner.id);
        break;
      }
      case NotifiableEntityType.PHOTO: {
        const likedPhoto = await db.query.images.findFirst({
          where: (images) => eq(images.id, entityId),
          with: { owner: true },
        });
        if (likedPhoto) recipients.add(likedPhoto.owner.id);
        break;
      }
      case NotifiableEntityType.COMMENT: {
        const likedComment = await db.query.comments.findFirst({
          where: (comments) => eq(comments.id, entityId),
          with: { author: true },
        });
        if (likedComment) recipients.add(likedComment.author.id);
        break;
      }
    }

    return Array.from(recipients);
  }

  /**
   * Get recipients for a comment notification
   */
  static async getCommentRecipients(
    entityType: NotifiableEntityType,
    entityId: string,
    commentId: string,
  ): Promise<string[]> {
    const recipients = new Set<string>();

    // Add the owner of the commented entity
    switch (entityType) {
      case NotifiableEntityType.POST: {
        const commentedPost = await db.query.posts.findFirst({
          where: (posts) => eq(posts.id, entityId),
          with: { owner: true },
        });
        if (commentedPost) recipients.add(commentedPost.owner.id);
        break;
      }
      case NotifiableEntityType.GROW: {
        const commentedGrow = await db.query.grows.findFirst({
          where: (grows) => eq(grows.id, entityId),
          with: { owner: true },
        });
        if (commentedGrow) recipients.add(commentedGrow.owner.id);
        break;
      }
      case NotifiableEntityType.PLANT: {
        const commentedPlant = await db.query.plants.findFirst({
          where: (plants) => eq(plants.id, entityId),
          with: { owner: true },
        });
        if (commentedPlant) recipients.add(commentedPlant.owner.id);
        break;
      }
      case NotifiableEntityType.PHOTO: {
        const commentedPhoto = await db.query.images.findFirst({
          where: (images) => eq(images.id, entityId),
          with: { owner: true },
        });
        if (commentedPhoto) recipients.add(commentedPhoto.owner.id);
        break;
      }
      case NotifiableEntityType.COMMENT: {
        // For comment replies, notify all parent comment authors
        const parentAuthors = await getAllParentCommentAuthors(db, commentId);
        parentAuthors.forEach((authorId) => recipients.add(authorId));
        break;
      }
    }

    return Array.from(recipients);
  }

  /**
   * Get recipients for any notification type
   */
  static async getRecipients(
    eventType: NotificationEventType,
    entityType: NotifiableEntityType,
    entityId: string,
    commentId?: string,
  ): Promise<string[]> {
    switch (eventType) {
      case NotificationEventType.NEW_FOLLOW:
        return Promise.resolve(this.getFollowRecipients(entityId));
      case NotificationEventType.NEW_LIKE:
        return this.getLikeRecipients(entityType, entityId);
      case NotificationEventType.NEW_COMMENT:
        if (!commentId) {
          throw new Error("Comment ID is required for comment notifications");
        }
        return this.getCommentRecipients(entityType, entityId, commentId);
      case NotificationEventType.NEW_POST:
        // TODO: Implement post notification recipients (followers, etc.)
        return [];
      default:
        return [];
    }
  }
}
