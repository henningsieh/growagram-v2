import {
  NOTIFICATION_TEXT_KEYS,
  NotifiableEntityType,
  NotificationEventType,
} from "~/types/notification";

/**
 * Generates notification text based on event type and entity type
 */
export class NotificationTemplateGenerator {
  /**
   * Get the translation key for a notification
   */
  static getTextKey(
    eventType: NotificationEventType,
    entityType: NotifiableEntityType,
  ): string {
    const eventKeys = NOTIFICATION_TEXT_KEYS[eventType];
    if (!eventKeys) {
      console.warn(`No text keys defined for event type: ${eventType}`);
      return "new_notification";
    }

    const textKey = eventKeys[entityType as keyof typeof eventKeys];
    if (!textKey) {
      console.warn(
        `No text key defined for event type: ${eventType}, entity type: ${entityType}`,
      );
      return "new_notification";
    }

    return textKey;
  }

  /**
   * Get entity type translation key
   */
  static getEntityTypeTextKey(entityType: NotifiableEntityType): string {
    const entityTypeKeys = {
      [NotifiableEntityType.USER]: "entity_user",
      [NotifiableEntityType.POST]: "entity_post",
      [NotifiableEntityType.GROW]: "entity_grow",
      [NotifiableEntityType.PLANT]: "entity_plant",
      [NotifiableEntityType.PHOTO]: "entity_photo",
      [NotifiableEntityType.COMMENT]: "entity_comment",
    } as const;

    return entityTypeKeys[entityType] || "entity_unknown";
  }
}
