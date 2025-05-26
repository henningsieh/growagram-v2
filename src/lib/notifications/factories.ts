import { db } from "~/lib/db";
import { notifications } from "~/lib/db/schema";
import { ee } from "~/server/api/routers/notifications";
import {
  type NotificationCreationResult,
  NotificationEventType,
  type NotificationFactoryData,
} from "~/types/notification";
import { NotificationRecipientResolver } from "./recipients";

/**
 * Factory for creating follow notifications
 */
export class FollowNotificationFactory {
  static readonly eventType = NotificationEventType.NEW_FOLLOW;

  static async create(
    data: NotificationFactoryData,
  ): Promise<NotificationCreationResult> {
    const recipients = await NotificationRecipientResolver.getRecipients(
      this.eventType,
      data.entityType,
      data.entityId,
    );

    // Remove actor from recipients
    const filteredRecipients = recipients.filter((id) => id !== data.actorId);

    // Create notifications in database
    const createdNotifications = await Promise.all(
      filteredRecipients.map((userId) =>
        db
          .insert(notifications)
          .values({
            userId,
            actorId: data.actorId,
            type: this.eventType,
            entityType: data.entityType,
            entityId: data.entityId,
            commentId: data.commentId,
          })
          .returning(),
      ),
    );

    const flatNotifications = createdNotifications.flat();

    // Emit real-time events
    flatNotifications.forEach((notification) => {
      ee.emit("notification", {
        ...notification,
        actor: {
          id: data.actorId,
          name: data.actorName,
          username: data.actorUsername,
          image: data.actorImage,
        },
      });
    });

    return {
      notifications: flatNotifications,
      recipientCount: filteredRecipients.length,
    };
  }
}

/**
 * Factory for creating like notifications
 */
export class LikeNotificationFactory {
  static readonly eventType = NotificationEventType.NEW_LIKE;

  static async create(
    data: NotificationFactoryData,
  ): Promise<NotificationCreationResult> {
    const recipients = await NotificationRecipientResolver.getRecipients(
      this.eventType,
      data.entityType,
      data.entityId,
    );

    // Remove actor from recipients
    const filteredRecipients = recipients.filter((id) => id !== data.actorId);

    // Create notifications in database
    const createdNotifications = await Promise.all(
      filteredRecipients.map((userId) =>
        db
          .insert(notifications)
          .values({
            userId,
            actorId: data.actorId,
            type: this.eventType,
            entityType: data.entityType,
            entityId: data.entityId,
            commentId: data.commentId,
          })
          .returning(),
      ),
    );

    const flatNotifications = createdNotifications.flat();

    // Emit real-time events
    flatNotifications.forEach((notification) => {
      ee.emit("notification", {
        ...notification,
        actor: {
          id: data.actorId,
          name: data.actorName,
          username: data.actorUsername,
          image: data.actorImage,
        },
      });
    });

    return {
      notifications: flatNotifications,
      recipientCount: filteredRecipients.length,
    };
  }
}

/**
 * Factory for creating comment notifications
 */
export class CommentNotificationFactory {
  static readonly eventType = NotificationEventType.NEW_COMMENT;

  static async create(
    data: NotificationFactoryData,
  ): Promise<NotificationCreationResult> {
    if (!data.commentId) {
      throw new Error("Comment ID is required for comment notifications");
    }

    const recipients = await NotificationRecipientResolver.getRecipients(
      this.eventType,
      data.entityType,
      data.entityId,
      data.commentId,
    );

    // Remove actor from recipients
    const filteredRecipients = recipients.filter((id) => id !== data.actorId);

    // Create notifications in database
    const createdNotifications = await Promise.all(
      filteredRecipients.map((userId) =>
        db
          .insert(notifications)
          .values({
            userId,
            actorId: data.actorId,
            type: this.eventType,
            entityType: data.entityType,
            entityId: data.entityId,
            commentId: data.commentId,
          })
          .returning(),
      ),
    );

    const flatNotifications = createdNotifications.flat();

    // Emit real-time events
    flatNotifications.forEach((notification) => {
      ee.emit("notification", {
        ...notification,
        actor: {
          id: data.actorId,
          name: data.actorName,
          username: data.actorUsername,
          image: data.actorImage,
        },
      });
    });

    return {
      notifications: flatNotifications,
      recipientCount: filteredRecipients.length,
    };
  }
}

/**
 * Main notification factory that routes to specific factories
 */
export class NotificationFactoryRegistry {
  private static factories = {
    [NotificationEventType.NEW_FOLLOW]: FollowNotificationFactory,
    [NotificationEventType.NEW_LIKE]: LikeNotificationFactory,
    [NotificationEventType.NEW_COMMENT]: CommentNotificationFactory,
  } as const;

  static async createNotification(
    eventType: NotificationEventType,
    data: NotificationFactoryData,
  ): Promise<NotificationCreationResult> {
    const factory = this.factories[eventType as keyof typeof this.factories];
    if (!factory) {
      throw new Error(`No factory found for event type: ${eventType}`);
    }

    return factory.create(data);
  }
}
