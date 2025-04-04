import type { AdapterAccountType } from "next-auth/adapters";
import type { InferSelectModel } from "drizzle-orm";
import { relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  foreignKey,
  index,
  integer,
  pgTable, // pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import {
  NotifiableEntityType,
  NotificationEventType,
} from "~/types/notification";
import { PostableEntityType } from "~/types/post";
import { UserRoles } from "~/types/user";

export const Message = pgTable("message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  channelId: text("channel_id")
    .notNull()
    .references(() => Channel.id),

  name: text("name").notNull(),
  text: text("text").notNull(),

  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
export type PostType = InferSelectModel<typeof Message>;

export const Channel = pgTable("channel", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),

  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
export type ChannelType = InferSelectModel<typeof Channel>;

export const chatMessages = pgTable("chat_message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Define the users table
export const users = pgTable(
  "user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    username: text("username").unique(),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    passwordHash: text("passwordHash"), // Add this line
    role: text("role", {
      // Assert UserRoles as drizzle enum tuple
      enum: Object.values(UserRoles) as [string, ...string[]],
    })
      .default(UserRoles.USER) // Use the TS enum for the default value
      .notNull(),
    steadyAccessToken: text(),
    steadyTokenExpiresAt: timestamp("steady_token_expires_at"),
    steadyRefreshToken: text(),
    steadyRefreshTokenExpiresAt: timestamp("steady_refresh_token_expires_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date())
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    // Unique indexes for fast lookups on unique fields
    uniqueEmailIdx: uniqueIndex("unique_email_idx").on(table.email),
    uniqueUsernameIdx: uniqueIndex("unique_username_idx").on(table.username),

    // Additional indexes for common query patterns
    nameIdx: index("name_idx").on(table.name),
    roleIdx: index("role_idx").on(table.role),
    emailVerifiedIdx: index("email_verified_idx").on(table.emailVerified),
    // Add index for password lookups
    passwordHashIdx: index("password_hash_idx").on(table.passwordHash),
  }),
);

// Define the accounts table
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

// Define the sessions table
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Define the verificationTokens table
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

// Define the authenticators table
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

// Define the Breeders table
export const breeders = pgTable(
  "breeder",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date())
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    // Add a unique index with case insensitivity
    nameUniqueIdx: uniqueIndex("breeder_name_unique_idx").on(
      sql`lower(${table.name})`,
    ),
  }),
);

// Define the CannabisStrains table
export const cannabisStrains = pgTable("cannabis_strain", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  thcContent: integer("thc_content"),
  cbdContent: integer("cbd_content"),
  breederId: text("breeder_id")
    .notNull()
    .references(() => breeders.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Define the Grows table
export const grows = pgTable("grow", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Define the images table
export const images = pgTable("image", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  cloudinaryAssetId: text("asset_id"),
  cloudinaryPublicId: text("public_id"),
  s3Key: text("s3_key"),
  s3ETag: text("s3_etag"),
  captureDate: timestamp("captureDate", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  originalFilename: text("originalFilename").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Define the plants table
export const plants = pgTable("plant", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .references(() => users.id, {
      onDelete: "restrict",
    })
    .notNull(),
  headerImageId: text("header_image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  growId: text("grow_id").references(() => grows.id, {
    onDelete: "set null",
  }),
  strainId: text("strain_id").references(() => cannabisStrains.id, {
    onDelete: "restrict",
  }),
  startDate: timestamp("start_date", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  seedlingPhaseStart: timestamp("seedling_phase_start", { withTimezone: true }),
  vegetationPhaseStart: timestamp("vegetation_phase_start", {
    withTimezone: true,
  }),
  floweringPhaseStart: timestamp("flowering_phase_start", {
    withTimezone: true,
  }),
  harvestDate: timestamp("harvest_date", { withTimezone: true }),
  curingPhaseStart: timestamp("curing_phase_start", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// Many-to-many relationship between plants and images (for all images)
export const plantImages = pgTable(
  "plant_images",
  {
    plantId: text("plant_id")
      .notNull()
      .references(() => plants.id, { onDelete: "cascade" }),
    imageId: text("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.plantId, t.imageId] }),
  }),
);

export const likes = pgTable(
  "like",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityId: text("entity_id").notNull(),
    entityType: text("entity_type").$type<LikeableEntityType>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    // Prevent duplicate likes from the same user on the same entity
    uniqueLike: uniqueIndex("unique_like").on(
      table.userId,
      table.entityId,
      table.entityType,
    ),
  }),
);

// Define the comments table
export const comments = pgTable(
  "comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityId: text("entity_id").notNull(),
    entityType: text("entity_type").$type<CommentableEntityType>().notNull(),
    commentText: text("comment_text").notNull(),
    parentCommentId: text("parent_comment_id").references(
      (): AnyPgColumn => comments.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date())
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (comment) => {
    return {
      // Define the foreign key for the parent comment reference
      parentCommentReference: foreignKey({
        columns: [comment.parentCommentId],
        foreignColumns: [comment.id],
        name: "comments_parent_comment_id_fkey",
      }),
      // Add an index for faster querying of comments by entity
      entityIndex: index("comment_entity_index").on(
        comment.entityId,
        comment.entityType,
      ),
    };
  },
);

// Define the posts table
export const posts = pgTable("public_post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  entityId: text("entity_id").notNull(),
  entityType: text("entity_type").$type<PostableEntityType>().notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$onUpdate(() => new Date())
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const userFollows = pgTable(
  "user_follow",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    followerIdx: index("follower_idx").on(table.followerId),
    followingIdx: index("following_idx").on(table.followingId),
    uniqFollow: uniqueIndex("uniq_follow_idx").on(
      table.followerId,
      table.followingId,
    ),
  }),
);

export const notifications = pgTable(
  "notification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Who receives the notification
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Who triggered the notification
    actorId: text("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Type of notification
    type: text("type").$type<NotificationEventType>().notNull(),
    commentId: text("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    // What entity was acted upon
    entityType: text("entity_type").$type<NotifiableEntityType>().notNull(),
    entityId: text("entity_id").notNull(),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    // Index for querying user's notifications
    userIdx: index("notification_user_idx").on(table.userId),
    // Index for querying by entity
    entityIdx: index("notification_entity_idx").on(
      table.entityType,
      table.entityId,
    ),
    // Index for finding unread notifications
    unreadIdx: index("notification_unread_idx").on(table.userId, table.read),
  }),
);

// Drizzle ORM Relations

export const MessageRelations = relations(Message, ({ one }) => ({
  channel: one(Channel, {
    fields: [Message.channelId],
    references: [Channel.id],
  }),
}));

export const ChannelRelations = relations(Channel, ({ many }) => ({
  posts: many(Message),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    relationName: "userNotifications",
    fields: [notifications.userId],
    references: [users.id],
  }),
  actor: one(users, {
    relationName: "actorNotifications",
    fields: [notifications.actorId],
    references: [users.id],
  }),
  // Dynamic relations based on entityType
  entity_follow: one(users, {
    fields: [notifications.entityId],
    references: [users.id],
  }),
  entity_grow: one(grows, {
    fields: [notifications.entityId],
    references: [grows.id],
  }),
  entity_plant: one(plants, {
    fields: [notifications.entityId],
    references: [plants.id],
  }),
  entity_photo: one(images, {
    fields: [notifications.entityId],
    references: [images.id],
  }),
  entity_comment: one(comments, {
    fields: [notifications.entityId],
    references: [comments.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  grows: many(grows),
  plants: many(plants),
  images: many(images),
  followers: many(userFollows, {
    relationName: "userFollowers",
  }),
  following: many(userFollows, {
    relationName: "userFollowing",
  }),
  notifications: many(notifications, {
    relationName: "userNotifications",
  }),
  actorNotifications: many(notifications, {
    relationName: "actorNotifications",
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    relationName: "userFollowing",
    fields: [userFollows.followerId],
    references: [users.id],
  }),
  following: one(users, {
    relationName: "userFollowers",
    fields: [userFollows.followingId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  // Relation to the user who created the comment
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
    relationName: "comment_author",
  }),

  // Parent comment reference (self-reference)
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "comment_children", // This must match the relationName in childComments below
  }),

  // Child comments (replies)
  childComments: many(comments, {
    relationName: "comment_children", // This must match the relationName in parentComment above
  }),

  // One-to-One Relations to <CommentableEntityType> entities with explicit names
  plantComments: one(plants, {
    fields: [comments.entityId],
    references: [plants.id], // CommentableEntityType.Plant
    relationName: "plant_comments",
  }),

  imageComments: one(images, {
    fields: [comments.entityId],
    references: [images.id], // CommentableEntityType.Image
    relationName: "image_comments",
  }),

  growComments: one(grows, {
    fields: [comments.entityId],
    references: [grows.id], // CommentableEntityType.Grow
    relationName: "grow_comments",
  }),
}));

export const breedersRelations = relations(breeders, ({ many }) => ({
  strains: many(cannabisStrains),
}));

export const cannabisStrainsRelations = relations(
  cannabisStrains,
  ({ one, many }) => ({
    breeder: one(breeders, {
      fields: [cannabisStrains.breederId],
      references: [breeders.id],
    }),
    plants: many(plants),
  }),
);

export const growsRelations = relations(grows, ({ one, many }) => ({
  owner: one(users, {
    fields: [grows.ownerId],
    references: [users.id],
  }),
  // A grow has many plants
  plants: many(plants),
  // A grow has many likes
  likes: many(likes),
  // A grow has many comments
  comments: many(comments, { relationName: "grow_comments" }), // This must match the relationName in One-to-One Relation "growComments" above
  // A grow is referenced by many posts
  posts: many(posts),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  plant: one(plants, {
    fields: [likes.entityId],
    references: [plants.id],
  }),
  image: one(images, {
    fields: [likes.entityId],
    references: [images.id],
  }),
  grow: one(grows, {
    fields: [likes.entityId],
    references: [grows.id],
  }),
  comment: one(comments, {
    fields: [likes.entityId],
    references: [comments.id],
  }),
  post: one(posts, {
    fields: [likes.entityId],
    references: [posts.id],
  }),
}));

export const plantsRelations = relations(plants, ({ one, many }) => ({
  // A plant has one grow
  grow: one(grows, {
    fields: [plants.growId],
    references: [grows.id],
  }),
  // A plant has one strain
  strain: one(cannabisStrains, {
    fields: [plants.strainId],
    references: [cannabisStrains.id],
  }),
  // A plant has one owner
  owner: one(users, {
    fields: [plants.ownerId],
    references: [users.id],
  }),
  // A plant has one header image
  headerImage: one(images, {
    fields: [plants.headerImageId],
    references: [images.id],
  }),
  // A plant has many images
  plantImages: many(plantImages),
  // A plant has many likes
  likes: many(likes),
  // A plant has many comments
  comments: many(comments, { relationName: "plant_comments" }), // This must match the relationName in One-to-One Relation "plantComments" above
  // A plant is referenced by many posts
  posts: many(posts),
}));

export const imagesRelations = relations(images, ({ one, many }) => ({
  owner: one(users, {
    fields: [images.ownerId],
    references: [users.id],
  }),
  // An image has many likes
  likes: many(likes),
  // An image may show plants
  plantImages: many(plantImages),
  // An image may be headerImage for many plants
  plantsAsHeader: many(plants),
  // An image has many comments
  comments: many(comments, { relationName: "image_comments" }), // This must match the relationName in One-to-One Relation "imageComments" above
  // An image is referenced by many posts
  posts: many(posts),
}));

export const plantImagesRelations = relations(plantImages, ({ one }) => ({
  // Each plant-image association belongs to exactly one plant
  plant: one(plants, {
    fields: [plantImages.plantId],
    references: [plants.id],
  }),
  // Each plant-image association belongs to exactly one image
  image: one(images, {
    fields: [plantImages.imageId],
    references: [images.id],
  }),
}));

export const publicPostsRelations = relations(posts, ({ one }) => ({
  owner: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  grow: one(grows, {
    fields: [posts.entityId],
    references: [grows.id],
  }),
  plant: one(plants, {
    fields: [posts.entityId],
    references: [plants.id],
  }),
  photo: one(images, {
    fields: [posts.entityId],
    references: [images.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));
