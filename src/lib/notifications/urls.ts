import { NotifiableEntityType, URL_PATTERNS } from "~/types/notification";

/**
 * Generates standardized URLs for notification targets
 */
export class NotificationUrlGenerator {
  static generateUrl(
    entityType: NotifiableEntityType,
    entityId: string,
    commentId?: string,
  ): string {
    const urlPattern = URL_PATTERNS[entityType];
    if (!urlPattern) {
      console.warn(`No URL pattern defined for entity type: ${entityType}`);
      return "#";
    }

    return urlPattern(entityId, commentId);
  }

  /**
   * Special handling for comment notifications that need parent entity resolution
   */
  static async generateCommentUrl(
    commentId: string,
    getParentEntity: (
      commentId: string,
    ) => Promise<{ entityType: string; entityId: string } | null>,
  ): Promise<string> {
    const parentEntity = await getParentEntity(commentId);
    if (!parentEntity) {
      return "#";
    }

    // Map parent entity type to NotifiableEntityType
    const entityTypeMap: Record<string, NotifiableEntityType> = {
      post: NotifiableEntityType.POST,
      grow: NotifiableEntityType.GROW,
      plant: NotifiableEntityType.PLANT,
      photo: NotifiableEntityType.PHOTO,
    };

    const entityType = entityTypeMap[parentEntity.entityType];
    if (!entityType) {
      console.warn(`Unknown parent entity type: ${parentEntity.entityType}`);
      return "#";
    }

    return this.generateUrl(entityType, parentEntity.entityId, commentId);
  }
}
