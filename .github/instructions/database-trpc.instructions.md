---
applyTo: "**"
description: "Drizzle ORM patterns, tRPC procedures, and state management strategies"
---

<!--
title: "Database, tRPC & State Management"
tags: [database, trpc, drizzle, state-management, queries]
last_updated: 2025-01-07
-->

# 🗄️ Database, tRPC & State Management

## State Management & Data Fetching

### tRPC Usage

- Use tRPC for type-safe API calls
- Implement proper error handling
- Use React Query for caching and synchronization

### URL Query Parameters

**All URL query parameters must be handled using the `nuqs` library for type-safe, reactive query parameter management.**

```typescript
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

// Basic string parameter
const [search, setSearch] = useQueryState(
  "search",
  parseAsString.withDefault(""),
);

// Integer parameter with validation
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

// Custom parser for complex types
const [filters, setFilters] = useQueryState("filters", {
  parse: (value) => JSON.parse(value),
  serialize: (value) => JSON.stringify(value),
  defaultValue: {},
});
```

#### Benefits of using `nuqs`:

- **Type Safety**: Ensures query parameters are properly typed
- **Automatic Serialization**: Handles conversion between URL strings and JavaScript values
- **React Integration**: Provides hooks that work seamlessly with React state
- **SSR Support**: Compatible with Next.js server-side rendering
- **History Management**: Properly handles browser back/forward navigation

#### Common Patterns:

```typescript
// Search functionality
const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString);

// Pagination
const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(1));

// Filtering
const [category, setCategory] = useQueryState('category', parseAsString);
const [sortBy, setSortBy] = useQueryState('sort', parseAsString.withDefault('newest'));

// Multiple query states
const {
  search,
  page,
  category
} = useQueryStates({
  search: parseAsString,
  page: parseAsInteger.withDefault(1),
  category: parseAsString
});
```

## Database & ORM Guidelines

### Drizzle ORM Best Practices

**Always use Drizzle syntax - never write manual SQL queries.**

#### Entity Relations

- Define proper relations between entities using Drizzle's relation syntax
- Use `one()` and `many()` relations appropriately
- Include foreign key constraints in table definitions

```typescript
// ✅ CORRECT: Proper Drizzle relations
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ...other fields
});

export const userFollows = pgTable(
  "user_follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Composite unique constraint
    followerFollowingIdx: uniqueIndex("user_follows_follower_following_idx").on(
      table.followerId,
      table.followingId,
    ),
    // Performance indexes
    followerIdx: index("user_follows_follower_idx").on(table.followerId),
    followingIdx: index("user_follows_following_idx").on(table.followingId),
  }),
);

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
  }),
}));
```

#### Performance Indexes

- Always consider query patterns when defining indexes
- Use composite indexes for multi-column queries
- Index foreign keys for optimal join performance
- Add indexes for common filter fields

```typescript
// ✅ CORRECT: Performance-focused indexing
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // ...other fields
  },
  (table) => ({
    // Timeline queries (user + chronological)
    userCreatedAtIdx: index("posts_user_created_at_idx").on(
      table.userId,
      table.createdAt.desc(),
    ),
    // Global timeline queries
    createdAtIdx: index("posts_created_at_idx").on(table.createdAt.desc()),
    // User-specific queries
    userIdx: index("posts_user_idx").on(table.userId),
  }),
);
```

#### Query Construction

- Use Drizzle's query builder for all database operations
- Leverage typed queries with proper relations
- Use `with` clauses for including related data

```typescript
// ✅ CORRECT: Drizzle query syntax
const timelinePosts = await db.query.posts.findMany({
  where: (posts, { inArray, desc }) => inArray(posts.userId, followingUserIds),
  orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  limit: 20,
  offset: page * 20,
  with: {
    user: {
      columns: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
    },
    grow: true,
    plant: true,
    likes: {
      where: (likes, { eq }) => eq(likes.userId, currentUserId),
    },
    _count: {
      likes: true,
      comments: true,
    },
  },
});
```

```typescript
// ❌ WRONG: Manual SQL - DON'T DO THIS
const result = await db.execute(sql`
  SELECT p.*, u.username, COUNT(l.id) as like_count
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN likes l ON p.id = l.post_id
  WHERE p.user_id IN (${followingUserIds})
  GROUP BY p.id, u.username
  ORDER BY p.created_at DESC
  LIMIT 20
`);
```

#### Migration Best Practices

- Use Drizzle's migration system
- Include proper constraints and indexes in migrations
- Test migrations on development data before production

## Advanced tRPC Patterns

### Complex Query Procedures

```typescript
// Advanced grow exploration with filtering and pagination
export const growRouter = createTRPCRouter({
  explore: publicProcedure
    .input(growExplorationSchema)
    .query(async ({ ctx, input }) => {
      const { cursor, limit = 20, search, environment, cultureMedium } = input;

      // Build dynamic where conditions
      const whereConditions = [];

      if (environment) {
        whereConditions.push(eq(grows.environment, environment));
      }

      if (cultureMedium) {
        whereConditions.push(eq(grows.cultureMedium, cultureMedium));
      }

      if (search) {
        whereConditions.push(ilike(grows.name, `%${search}%`));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const results = await ctx.db.query.grows.findMany({
        where: whereClause,
        orderBy: desc(grows.createdAt),
        limit: limit + 1,
        offset: cursor ? (cursor - 1) * limit : 0,
        with: {
          owner: {
            columns: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
          plants: {
            columns: {
              id: true,
              name: true,
              growthStage: true,
            },
          },
          _count: {
            plants: true,
            likes: true,
          },
        },
      });

      const hasNextPage = results.length > limit;
      const items = hasNextPage ? results.slice(0, -1) : results;

      return {
        items,
        nextCursor: hasNextPage ? (cursor || 1) + 1 : null,
      };
    }),
});
```

### Mutation Procedures with Optimistic Updates

```typescript
// Create grow with proper error handling and optimistic updates
export const growRouter = createTRPCRouter({
  create: protectedProcedure
    .input(growFormSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Transaction for atomic operations
        const result = await ctx.db.transaction(async (tx) => {
          // Create the grow
          const [newGrow] = await tx
            .insert(grows)
            .values({
              name: input.name,
              environment: input.environment,
              cultureMedium: input.cultureMedium,
              fertilizerType: input.fertilizerType,
              ownerId: ctx.session.user.id,
            })
            .returning();

          if (!newGrow) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create grow",
            });
          }

          // Connect plants if provided
          if (input.plantIds?.length) {
            await tx
              .update(plants)
              .set({ growId: newGrow.id })
              .where(
                and(
                  inArray(plants.id, input.plantIds),
                  eq(plants.ownerId, ctx.session.user.id),
                ),
              );
          }

          return newGrow;
        });

        // Invalidate related queries
        await ctx.revalidator.revalidateTag("user-grows");

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while creating the grow",
        });
      }
    }),
});
```

### Subscription Procedures for Real-time Updates

```typescript
// Real-time notification subscription
export const notificationRouter = createTRPCRouter({
  subscribe: protectedProcedure
    .input(
      z.object({
        lastEventId: z.string().optional(),
      }),
    )
    .subscription(async function* ({ ctx, input }) {
      const userId = ctx.session.user.id;

      // Listen for new notifications
      for await (const [notification] of on(
        notificationEmitter,
        "new-notification",
      )) {
        // Only emit notifications for the current user
        if (notification.recipientId === userId) {
          yield notification;
        }
      }
    }),

  // Batch mark as read for performance
  markMultipleAsRead: protectedProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            inArray(notifications.id, input.notificationIds),
            eq(notifications.recipientId, ctx.session.user.id),
          ),
        )
        .returning({ id: notifications.id });

      return {
        updatedCount: updated.length,
        updatedIds: updated.map((n) => n.id),
      };
    }),
});
```

### Input Validation and Sanitization

```typescript
// Advanced input validation for user content
export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, "Post content is required")
          .max(2000, "Post content too long")
          .transform((val) => val.trim()), // Sanitize input
        entityType: z.nativeEnum(PostableEntityType),
        entityId: z.string().uuid(),
        images: z
          .array(
            z.object({
              id: z.string().uuid(),
              alt: z.string().max(200).optional(),
            }),
          )
          .max(10, "Too many images"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify entity exists and user has permission
      const entity = await ctx.db.query[`${input.entityType}s`].findFirst({
        where: (table, { eq }) => eq(table.id, input.entityId),
        columns: { id: true, ownerId: true },
      });

      if (!entity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${input.entityType} not found`,
        });
      }

      if (entity.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only post to your own content",
        });
      }

      // Create post with validated input
      const [newPost] = await ctx.db
        .insert(posts)
        .values({
          content: input.content,
          entityType: input.entityType,
          entityId: input.entityId,
          authorId: ctx.session.user.id,
        })
        .returning();

      return newPost;
    }),
});
```

## Advanced tRPC Patterns

### Complex Query Procedures

```typescript
// Advanced grow exploration with filtering and pagination
export const growRouter = createTRPCRouter({
  explore: publicProcedure
    .input(growExplorationSchema)
    .query(async ({ ctx, input }) => {
      const { cursor, limit = 20, search, environment, cultureMedium } = input;

      // Build dynamic where conditions
      const whereConditions = [];

      if (environment) {
        whereConditions.push(eq(grows.environment, environment));
      }

      if (cultureMedium) {
        whereConditions.push(eq(grows.cultureMedium, cultureMedium));
      }

      if (search) {
        whereConditions.push(ilike(grows.name, `%${search}%`));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const results = await ctx.db.query.grows.findMany({
        where: whereClause,
        orderBy: desc(grows.createdAt),
        limit: limit + 1,
        offset: cursor ? (cursor - 1) * limit : 0,
        with: {
          owner: {
            columns: {
              id: true,
              username: true,
              name: true,
              image: true,
            },
          },
          plants: {
            columns: {
              id: true,
              name: true,
              growthStage: true,
            },
          },
          _count: {
            plants: true,
            likes: true,
          },
        },
      });

      const hasNextPage = results.length > limit;
      const items = hasNextPage ? results.slice(0, -1) : results;

      return {
        items,
        nextCursor: hasNextPage ? (cursor || 1) + 1 : null,
      };
    }),
});
```

### Mutation Procedures with Optimistic Updates

```typescript
// Create grow with proper error handling and optimistic updates
export const growRouter = createTRPCRouter({
  create: protectedProcedure
    .input(growFormSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Transaction for atomic operations
        const result = await ctx.db.transaction(async (tx) => {
          // Create the grow
          const [newGrow] = await tx
            .insert(grows)
            .values({
              name: input.name,
              environment: input.environment,
              cultureMedium: input.cultureMedium,
              fertilizerType: input.fertilizerType,
              ownerId: ctx.session.user.id,
            })
            .returning();

          if (!newGrow) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create grow",
            });
          }

          // Connect plants if provided
          if (input.plantIds?.length) {
            await tx
              .update(plants)
              .set({ growId: newGrow.id })
              .where(
                and(
                  inArray(plants.id, input.plantIds),
                  eq(plants.ownerId, ctx.session.user.id),
                ),
              );
          }

          return newGrow;
        });

        // Invalidate related queries
        await ctx.revalidator.revalidateTag("user-grows");

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while creating the grow",
        });
      }
    }),
});
```

### Subscription Procedures for Real-time Updates

```typescript
// Real-time notification subscription
export const notificationRouter = createTRPCRouter({
  subscribe: protectedProcedure
    .input(
      z.object({
        lastEventId: z.string().optional(),
      }),
    )
    .subscription(async function* ({ ctx, input }) {
      const userId = ctx.session.user.id;

      // Listen for new notifications
      for await (const [notification] of on(
        notificationEmitter,
        "new-notification",
      )) {
        // Only emit notifications for the current user
        if (notification.recipientId === userId) {
          yield notification;
        }
      }
    }),

  // Batch mark as read for performance
  markMultipleAsRead: protectedProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .update(notifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            inArray(notifications.id, input.notificationIds),
            eq(notifications.recipientId, ctx.session.user.id),
          ),
        )
        .returning({ id: notifications.id });

      return {
        updatedCount: updated.length,
        updatedIds: updated.map((n) => n.id),
      };
    }),
});
```

### Input Validation and Sanitization

```typescript
// Advanced input validation for user content
export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, "Post content is required")
          .max(2000, "Post content too long")
          .transform((val) => val.trim()), // Sanitize input
        entityType: z.nativeEnum(PostableEntityType),
        entityId: z.string().uuid(),
        images: z
          .array(
            z.object({
              id: z.string().uuid(),
              alt: z.string().max(200).optional(),
            }),
          )
          .max(10, "Too many images"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify entity exists and user has permission
      const entity = await ctx.db.query[`${input.entityType}s`].findFirst({
        where: (table, { eq }) => eq(table.id, input.entityId),
        columns: { id: true, ownerId: true },
      });

      if (!entity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${input.entityType} not found`,
        });
      }

      if (entity.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only post to your own content",
        });
      }

      // Create post with validated input
      const [newPost] = await ctx.db
        .insert(posts)
        .values({
          content: input.content,
          entityType: input.entityType,
          entityId: input.entityId,
          authorId: ctx.session.user.id,
        })
        .returning();

      return newPost;
    }),
});
```

## tRPC Procedure Examples

### Query Procedures

#### Basic Query with Input Validation

```typescript
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const growRouter = createTRPCRouter({
  // Public query - no authentication required
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const grow = await ctx.db.query.grows.findFirst({
        where: (grows, { eq }) => eq(grows.id, input.id),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          plants: {
            orderBy: (plants, { desc }) => [desc(plants.createdAt)],
            limit: 10,
          },
        },
      });

      if (!grow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Grow not found",
        });
      }

      return grow;
    }),

  // Protected query - requires authentication
  getMyGrows: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        status: z.enum(["active", "completed", "archived"]).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const offset = (input.page - 1) * input.limit;

      const grows = await ctx.db.query.grows.findMany({
        where: (grows, { eq, and }) =>
          and(
            eq(grows.userId, ctx.session.user.id),
            input.status ? eq(grows.status, input.status) : undefined,
          ),
        orderBy: (grows, { desc }) => [desc(grows.updatedAt)],
        limit: input.limit,
        offset,
        with: {
          plants: {
            limit: 1,
            orderBy: (plants, { desc }) => [desc(plants.createdAt)],
          },
          _count: {
            plants: true,
            likes: true,
          },
        },
      });

      return {
        grows,
        hasMore: grows.length === input.limit,
        nextPage: grows.length === input.limit ? input.page + 1 : null,
      };
    }),
});
```

#### Infinite Query Pattern

```typescript
export const postRouter = createTRPCRouter({
  getInfinite: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
        userId: z.string().uuid().optional(),
        followingOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { limit, cursor, userId, followingOnly } = input;

      // Get following list if needed
      const followingUserIds =
        followingOnly && ctx.session?.user.id
          ? await getFollowingUserIds(ctx.db, ctx.session.user.id)
          : [];

      const posts = await ctx.db.query.posts.findMany({
        where: (posts, { eq, and, lt, inArray }) =>
          and(
            cursor ? lt(posts.createdAt, new Date(cursor)) : undefined,
            userId ? eq(posts.userId, userId) : undefined,
            followingOnly ? inArray(posts.userId, followingUserIds) : undefined,
          ),
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        limit: limit + 1,
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          grow: true,
          plant: true,
          likes: ctx.session?.user.id
            ? {
                where: (likes, { eq }) => eq(likes.userId, ctx.session.user.id),
              }
            : false,
          _count: {
            likes: true,
            comments: true,
          },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.createdAt.toISOString();
      }

      return {
        posts,
        nextCursor,
      };
    }),
});
```

### Mutation Procedures

#### Create Operation with Validation

```typescript
export const growRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(1000).optional(),
        environment: z.nativeEnum(GrowEnvironment),
        cultureMedium: z.nativeEnum(CultureMedium),
        startDate: z.date(),
        expectedHarvest: z.date().optional(),
        isPublic: z.boolean().default(true),
        tags: z.array(z.string()).max(10).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Validate user limits
      const userGrowCount = await ctx.db.query.grows
        .findMany({
          where: (grows, { eq }) => eq(grows.userId, ctx.session.user.id),
        })
        .then((grows) => grows.length);

      if (userGrowCount >= 50) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum number of grows reached",
        });
      }

      // Create the grow
      const [grow] = await ctx.db
        .insert(grows)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning();

      // Create activity log
      await ctx.db.insert(activityLogs).values({
        userId: ctx.session.user.id,
        entityType: "grow",
        entityId: grow.id,
        action: "created",
        details: { name: input.name },
      });

      return grow;
    }),
});
```

#### Update Operation with Optimistic Updates

```typescript
export const growRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(1000).optional(),
        environment: z.nativeEnum(GrowEnvironment).optional(),
        cultureMedium: z.nativeEnum(CultureMedium).optional(),
        expectedHarvest: z.date().optional(),
        isPublic: z.boolean().optional(),
        tags: z.array(z.string()).max(10).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existingGrow = await ctx.db.query.grows.findFirst({
        where: (grows, { eq }) => eq(grows.id, id),
      });

      if (!existingGrow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Grow not found",
        });
      }

      if (existingGrow.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own grows",
        });
      }

      // Update the grow
      const [updatedGrow] = await ctx.db
        .update(grows)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(grows.id, id))
        .returning();

      // Log the update
      await ctx.db.insert(activityLogs).values({
        userId: ctx.session.user.id,
        entityType: "grow",
        entityId: id,
        action: "updated",
        details: updateData,
      });

      return updatedGrow;
    }),
});
```

#### Complex Mutation with Transactions

```typescript
export const followRouter = createTRPCRouter({
  toggle: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;
      const currentUserId = ctx.session.user.id;

      if (userId === currentUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot follow yourself",
        });
      }

      // Check if user exists
      const targetUser = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Use transaction for atomic operation
      const result = await ctx.db.transaction(async (tx) => {
        // Check if already following
        const existingFollow = await tx.query.userFollows.findFirst({
          where: (follows, { eq, and }) =>
            and(
              eq(follows.followerId, currentUserId),
              eq(follows.followingId, userId),
            ),
        });

        if (existingFollow) {
          // Unfollow
          await tx
            .delete(userFollows)
            .where(eq(userFollows.id, existingFollow.id));

          // Update follower counts
          await tx
            .update(users)
            .set({ followingCount: sql`${users.followingCount} - 1` })
            .where(eq(users.id, currentUserId));

          await tx
            .update(users)
            .set({ followersCount: sql`${users.followersCount} - 1` })
            .where(eq(users.id, userId));

          return { following: false };
        } else {
          // Follow
          await tx.insert(userFollows).values({
            followerId: currentUserId,
            followingId: userId,
          });

          // Update follower counts
          await tx
            .update(users)
            .set({ followingCount: sql`${users.followingCount} + 1` })
            .where(eq(users.id, currentUserId));

          await tx
            .update(users)
            .set({ followersCount: sql`${users.followersCount} + 1` })
            .where(eq(users.id, userId));

          // Create notification
          await NotificationFactoryRegistry.createNotification(
            NotificationEventType.NEW_FOLLOW,
            {
              entityType: NotifiableEntityType.USER,
              entityId: userId,
              actorId: currentUserId,
              actorName: ctx.session.user.name,
              actorUsername: ctx.session.user.username,
              actorImage: ctx.session.user.image,
            },
          );

          return { following: true };
        }
      });

      return result;
    }),
});
```

### Advanced Patterns

#### Subscription-like Real-time Updates

```typescript
export const notificationRouter = createTRPCRouter({
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.query.notifications
      .findMany({
        where: (notifications, { eq, and }) =>
          and(
            eq(notifications.recipientId, ctx.session.user.id),
            eq(notifications.read, false),
          ),
      })
      .then((notifications) => notifications.length);

    return { count };
  }),

  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationIds: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(notifications)
        .set({ read: true, readAt: new Date() })
        .where(
          and(
            eq(notifications.recipientId, ctx.session.user.id),
            inArray(notifications.id, input.notificationIds),
          ),
        );

      return { success: true };
    }),
});
```

#### Batch Operations

```typescript
export const plantRouter = createTRPCRouter({
  batchUpdate: protectedProcedure
    .input(
      z.object({
        plantIds: z.array(z.string().uuid()).min(1).max(50),
        updates: z.object({
          growthStage: z.nativeEnum(PlantGrowthStages).optional(),
          tags: z.array(z.string()).max(10).optional(),
          isPublic: z.boolean().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { plantIds, updates } = input;

      // Verify ownership of all plants
      const plants = await ctx.db.query.plants.findMany({
        where: (plants, { inArray }) => inArray(plants.id, plantIds),
        columns: { id: true, userId: true },
      });

      const unauthorizedPlants = plants.filter(
        (plant) => plant.userId !== ctx.session.user.id,
      );

      if (unauthorizedPlants.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own plants",
        });
      }

      if (plants.length !== plantIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Some plants were not found",
        });
      }

      // Perform batch update
      const updatedPlants = await ctx.db
        .update(plants)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(inArray(plants.id, plantIds))
        .returning();

      return {
        updatedCount: updatedPlants.length,
        plants: updatedPlants,
      };
    }),
});
```

## Related Resources

- **[Database Performance](./database-performance.instructions.md)** - Indexing strategies and query optimization
- **[TypeScript Guidelines](./typescript-guidelines.instructions.md)** - Zod schema patterns and type safety
- **[Performance & SEO](./performance-seo.instructions.md)** - API optimization and caching strategies
- **[Security & Testing](./security-testing.instructions.md)** - Authentication patterns and API security
- **[React & Next.js Guidelines](./react-nextjs.instructions.md)** - Frontend data fetching and state management patterns

---

_For database-specific performance optimization including indexing strategies and query performance, see the dedicated database performance optimization guide._

### Notification System Architecture

**GrowAGram uses a factory-based notification system with server-side text/href generation.**

#### Factory Pattern Usage

```typescript
// Use the NotificationFactoryRegistry for creating notifications
import { NotificationFactoryRegistry } from "~/lib/notifications/factories";

// Create notifications in API routes
await NotificationFactoryRegistry.createNotification(
  NotificationEventType.NEW_LIKE,
  {
    entityType: NotifiableEntityType.POST,
    entityId: postId,
    actorId: userId,
    actorName: user.name,
    actorUsername: user.username,
    actorImage: user.image,
  },
);
```

#### Server-Side Text/Href Generation

```typescript
// Notifications are enriched server-side with computed fields
export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Each notification gets server-computed fields:
    // - notificationText: Translated text ready for display
    // - notificationHref: Correct URL ready for navigation
  }),
});
```

#### Key Benefits

- **Zero client-side roundtrips**: Text and URLs computed server-side
- **Full internationalization**: Server-side translations using user's locale
- **Type safety**: Factory pattern ensures consistent notification creation
- **Maintainability**: Each notification type has its own factory class

#### Architecture Files

```
src/lib/notifications/
├── factories.ts         # NotificationFactoryRegistry and type-specific factories
├── server-side.ts       # ServerSideNotificationService for text/href generation
├── templates.ts         # NotificationTemplateGenerator (legacy, now server-side)
├── recipients.ts        # NotificationRecipientResolver
└── urls.ts             # NotificationUrlGenerator
```
