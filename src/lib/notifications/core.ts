/**
 * Export all notification system components
 */

// Core types and interfaces - now centralized in ~/types/notification
export type {
  NotificationTemplate,
  NotificationRecipientRule,
  NotificationFactory,
  NotificationFactoryData,
  NotificationCreationResult,
} from "~/types/notification";

export { URL_PATTERNS, NOTIFICATION_TEXT_KEYS } from "~/types/notification";

// URL generation utilities
export { NotificationUrlGenerator } from "./urls";

// Template and text utilities
export { NotificationTemplateGenerator } from "./templates";

// Recipient resolution
export { NotificationRecipientResolver } from "./recipients";

// Notification factories
export {
  FollowNotificationFactory,
  LikeNotificationFactory,
  CommentNotificationFactory,
  NotificationFactoryRegistry,
} from "./factories";
