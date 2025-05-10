// src/types/post.ts:

export enum PostableEntityType {
  GROW = "grow",
  PLANT = "plant",
  PHOTO = "image",
}

// New interface for attaching multiple photos to posts
export interface PostPhotosInput {
  photoIds: string[];
}
