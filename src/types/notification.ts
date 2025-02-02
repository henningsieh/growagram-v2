// Notification types that can be sent
export enum NotificationEventType {
  NEW_FOLLOW = "new_follow",
  NEW_LIKE = "new_like",
  NEW_COMMENT = "new_comment",
  NEW_POST = "new_post",
}

// Entity types that can be referenced in notifications
export enum NotifiableEntityType {
  USER = "user", // referenced USER type in case of "new_follow"
  COMMENT = "comment", // referenced COMMENT type in case of "new_comment" (comment then refers to a CommentableEntityType)
  POST = "post", // referenced POST type in case of "new_post" (post then refers to a PostableEntityType)
  GROW = "grow", // referenced GROW type in case of "new_like" or "new_comment" or "new_post" (grow then refers to a LikeableEntityType)
  PLANT = "plant", // referenced PLANT type in case of "new_like" or "new_comment" or "new_post" (plant then refers to a LikeableEntityType)
  PHOTO = "image", // referenced PHOTO type in case of "new_like" or "new_comment" or "new_post" (photo then refers to a LikeableEntityType)
}
