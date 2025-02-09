// src/types/notification.ts:

// Notification types that can be sent
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
