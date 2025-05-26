/**
 * Centralized notification types and constants
 * This file contains all notification-related types, enums, and constants
 */

// Notification event types that can be sent
export enum NotificationEventType {
  NEW_FOLLOW = "new_follow",
  NEW_LIKE = "new_like",
  NEW_COMMENT = "new_comment",
  NEW_POST = "new_post",
}

// Entity types that can be referenced in notifications
export enum NotifiableEntityType {
  USER = "user",
  COMMENT = "comment",
  POST = "post",
  GROW = "grow",
  PLANT = "plant",
  PHOTO = "image",
}

// Legacy notification event type (for existing database records)
export type NotificationEvent = {
  id: string;
  createdAt: Date;
  userId: string;
  type: NotificationEventType;
  entityType: NotifiableEntityType;
  entityId: string;
  actor: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

// ============================================================================
// FACTORY SYSTEM TYPES
// ============================================================================

// Core notification domain models
export interface NotificationTemplate {
  eventType: NotificationEventType;
  entityType: NotifiableEntityType;
  getTextKey: () => string;
  getUrl: (entityId: string, commentId?: string) => string;
}

export interface NotificationRecipientRule {
  eventType: NotificationEventType;
  entityType: NotifiableEntityType;
  getRecipients: (entityId: string, commentId?: string) => Promise<string[]>;
}

export interface NotificationFactory {
  eventType: NotificationEventType;
  create: (
    data: NotificationFactoryData,
  ) => Promise<NotificationCreationResult>;
}

export interface NotificationFactoryData {
  entityType: NotifiableEntityType;
  entityId: string;
  actorId: string;
  actorName: string | null;
  actorUsername: string | null;
  actorImage: string | null;
  commentId?: string;
}

export interface NotificationCreationResult {
  notifications: Array<{
    id: string;
    userId: string;
    actorId: string;
    type: NotificationEventType;
    entityType: NotifiableEntityType;
    entityId: string;
    commentId?: string | null;
    createdAt: Date;
    read: boolean;
  }>;
  recipientCount: number;
}

// ============================================================================
// URL PATTERNS AND TEXT KEYS
// ============================================================================

// URL patterns for different entity types
export const URL_PATTERNS = {
  [NotifiableEntityType.USER]: (entityId: string) =>
    `/public/profile/${entityId}`,
  [NotifiableEntityType.POST]: (entityId: string, commentId?: string) =>
    commentId
      ? `/public/posts/${entityId}?commentId=${commentId}`
      : `/public/posts/${entityId}`,
  [NotifiableEntityType.GROW]: (entityId: string, commentId?: string) =>
    commentId
      ? `/public/grows/${entityId}?commentId=${commentId}`
      : `/public/grows/${entityId}`,
  [NotifiableEntityType.PLANT]: (entityId: string, commentId?: string) =>
    commentId
      ? `/public/plants/${entityId}?commentId=${commentId}`
      : `/public/plants/${entityId}`,
  [NotifiableEntityType.PHOTO]: (entityId: string, commentId?: string) =>
    commentId
      ? `/public/photos/${entityId}?commentId=${commentId}`
      : `/public/photos/${entityId}`,
  [NotifiableEntityType.COMMENT]: (entityId: string) => `#comment-${entityId}`, // Will be resolved by parent entity
} as const;

// Translation keys for notification content
export const NOTIFICATION_TEXT_KEYS = {
  [NotificationEventType.NEW_FOLLOW]: {
    [NotifiableEntityType.USER]: "new_follow",
  },
  [NotificationEventType.NEW_LIKE]: {
    [NotifiableEntityType.POST]: "new_like_post",
    [NotifiableEntityType.GROW]: "new_like_grow",
    [NotifiableEntityType.PLANT]: "new_like_plant",
    [NotifiableEntityType.PHOTO]: "new_like_photo",
    [NotifiableEntityType.COMMENT]: "new_like_comment",
  },
  [NotificationEventType.NEW_COMMENT]: {
    [NotifiableEntityType.POST]: "new_comment_post",
    [NotifiableEntityType.GROW]: "new_comment_grow",
    [NotifiableEntityType.PLANT]: "new_comment_plant",
    [NotifiableEntityType.PHOTO]: "new_comment_photo",
    [NotifiableEntityType.COMMENT]: "new_comment_comment",
  },
  [NotificationEventType.NEW_POST]: {
    [NotifiableEntityType.POST]: "new_post",
  },
} as const;
