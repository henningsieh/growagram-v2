---
applyTo: "**"
---

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

## 🔄 Related Resources

- **Database Performance**: See [database-performance.instructions.md](.github/instructions/database-performance.instructions.md) for indexing, query optimization, and performance monitoring
- **TypeScript Guidelines**: See [typescript-guidelines.instructions.md](.github/instructions/typescript-guidelines.instructions.md) for Zod schema patterns
- **Performance & SEO**: See [performance-seo.instructions.md](.github/instructions/performance-seo.instructions.md) for web performance optimization

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
