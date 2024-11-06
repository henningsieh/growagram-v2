import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// Creating table with a prefix for multi-project schema
export const createTable = pgTableCreator((name) => `growagram.com_${name}`);

// Define the users table
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

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
  imageUrl: text("image_url").notNull(),
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

// Define the plants table
export const plants = pgTable("plant", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  headerImageId: text("header_image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  growId: text("grow_id").references(() => grows.id, { onDelete: "cascade" }),
  strainId: text("strain_id").references(() => cannabisStrains.id, {
    onDelete: "restrict",
  }),
  startDate: timestamp("start_date", { withTimezone: true }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
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
  },
  (t) => ({
    pk: primaryKey({ columns: [t.plantId, t.imageId] }),
  }),
);

// Drizzle ORM Relations

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
  plantImages: many(plantImages),
}));

export const imagesRelations = relations(images, ({ many }) => ({
  plantImages: many(plantImages),
  plantsAsHeader: many(plants),
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
