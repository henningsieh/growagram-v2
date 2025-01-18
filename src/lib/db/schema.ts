// src/lib/db/schema.ts:
import { relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { CommentableEntityType } from "~/types/comment";
import { LikeableEntityType } from "~/types/like";
import { PostableEntityType } from "~/types/post";
import { UserRoles } from "~/types/user";

// Creating table with a prefix for multi-project schema
export const createTable = pgTableCreator((name) => `growagram.com_${name}`);

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
    role: text("role", {
      // Assert UserRoles as drizzle enum tuple
      enum: Object.values(UserRoles) as [string, ...string[]],
    })
      .default(UserRoles.USER) // Use the TS enum for the default value
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
export const breeders = pgTable("breeder", {
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
});

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
  cloudinaryAssetId: text("asset_id").notNull(),
  cloudinaryPublicId: text("public_id").notNull(),
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
export const posts = pgTable(
  "public_post",
  {
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
  },
  (table) => ({
    // Prevent duplicate posts from the same user on the same entity
    uniquePost: uniqueIndex("unique_post").on(
      table.userId,
      table.entityId,
      table.entityType,
    ),
  }),
);

// Drizzle ORM Relations

export const usersRelations = relations(users, ({ many }) => ({
  grows: many(grows),
  plants: many(plants),
  Images: many(images),
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
  plants: many(plants),
  likes: many(likes),
  comments: many(comments, { relationName: "grow_comments" }), // This must match the relationName in One-to-One Relation "growComments" above
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
