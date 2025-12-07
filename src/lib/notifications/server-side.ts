import { getTranslations } from "next-intl/server";

import { eq } from "drizzle-orm";

import {
  NotifiableEntityType,
  NotificationEventType,
  URL_PATTERNS,
} from "~/types/notification";

import { db } from "~/lib/db";
import { comments } from "~/lib/db/schema";

/**
 * Server-side notification service that generates translated text and URLs
 * This eliminates client-side roundtrips for notification rendering
 */
export class ServerSideNotificationService {
  /**
   * Generate the translated notification text for a given event and entity type
   */
  static async generateNotificationText(
    eventType: NotificationEventType,
    entityType: NotifiableEntityType,
    locale: string = "en",
  ): Promise<string> {
    const t = await getTranslations({ locale, namespace: "Notifications" });

    switch (eventType) {
      case NotificationEventType.NEW_FOLLOW:
        return t("new_follow");

      case NotificationEventType.NEW_LIKE:
        switch (entityType) {
          case NotifiableEntityType.POST:
            return t("new_like_post");
          case NotifiableEntityType.GROW:
            return t("new_like_grow");
          case NotifiableEntityType.PLANT:
            return t("new_like_plant");
          case NotifiableEntityType.PHOTO:
            return t("new_like_photo");
          case NotifiableEntityType.COMMENT:
            return t("new_like_comment");
          default:
            return t("new_like");
        }

      case NotificationEventType.NEW_COMMENT:
        switch (entityType) {
          case NotifiableEntityType.POST:
            return t("new_comment_post");
          case NotifiableEntityType.GROW:
            return t("new_comment_grow");
          case NotifiableEntityType.PLANT:
            return t("new_comment_plant");
          case NotifiableEntityType.PHOTO:
            return t("new_comment_photo");
          case NotifiableEntityType.COMMENT:
            return t("new_comment_comment");
          default:
            return t("new_comment");
        }

      case NotificationEventType.NEW_POST:
        return t("new_post");

      default:
        return t("new_notification");
    }
  }

  /**
   * Generate the notification URL for a given entity type and ID
   * Handles special case of comment notifications that need parent entity resolution
   */
  static async generateNotificationHref(
    entityType: NotifiableEntityType,
    entityId: string,
    commentId?: string,
  ): Promise<string> {
    // Special handling for comment notifications
    if (entityType === NotifiableEntityType.COMMENT) {
      return await this.resolveCommentNotificationHref(entityId);
    }

    // Standard entity URL generation
    const urlPattern = URL_PATTERNS[entityType];
    if (!urlPattern) {
      console.warn(`No URL pattern defined for entity type: ${entityType}`);
      return "#";
    }

    return urlPattern(entityId, commentId);
  }

  /**
   * Resolve the href for comment notifications by finding the parent entity
   * This eliminates the client-side roundtrip that was causing issues
   */
  private static async resolveCommentNotificationHref(
    commentId: string,
  ): Promise<string> {
    try {
      // Get the comment and its parent entity information
      const comment = await db.query.comments.findFirst({
        where: eq(comments.id, commentId),
        columns: {
          entityId: true,
          entityType: true,
        },
      });

      if (!comment) {
        console.warn(`Comment not found for notification: ${commentId}`);
        return "#";
      }

      // Map CommentableEntityType to NotifiableEntityType
      const entityTypeMap = {
        post: NotifiableEntityType.POST,
        grow: NotifiableEntityType.GROW,
        plant: NotifiableEntityType.PLANT,
        photo: NotifiableEntityType.PHOTO,
      } as const;

      const notifiableEntityType =
        entityTypeMap[comment.entityType as keyof typeof entityTypeMap];

      if (!notifiableEntityType) {
        console.warn(
          `Unknown comment entity type: ${comment.entityType} for comment: ${commentId}`,
        );
        return "#";
      }

      // Generate URL to the parent entity with comment anchor
      const urlPattern = URL_PATTERNS[notifiableEntityType];
      if (!urlPattern) {
        console.warn(`No URL pattern for entity type: ${notifiableEntityType}`);
        return "#";
      }

      return urlPattern(comment.entityId, commentId);
    } catch (error) {
      console.error(
        `Error resolving comment notification href for ${commentId}:`,
        error,
      );
      return "#";
    }
  }

  /**
   * Generate both text and href for a notification
   * This is a convenience method that combines both operations
   */
  static async generateNotificationData(
    eventType: NotificationEventType,
    entityType: NotifiableEntityType,
    entityId: string,
    commentId?: string,
    locale: string = "en",
  ): Promise<{ text: string; href: string }> {
    const [text, href] = await Promise.all([
      this.generateNotificationText(eventType, entityType, locale),
      this.generateNotificationHref(entityType, entityId, commentId),
    ]);

    return { text, href };
  }
}
