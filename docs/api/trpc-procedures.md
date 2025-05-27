# tRPC Procedures Documentation

## Activity Feeds and Timeline API Documentation

This document provides comprehensive documentation for the enhanced post router and activity feed system implemented as part of the Week 1 Backend API Development sprint.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Post Router Procedures](#post-router-procedures)
3. [Timeline Features](#timeline-features)
4. [Performance Optimizations](#performance-optimizations)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)

## Overview

The post router provides sophisticated timeline and activity feed functionality with:

- ✅ **Enhanced cursor-based pagination** with performance optimizations
- ✅ **Multi-filter timeline support** (public, user-specific, following-only)
- ✅ **Comprehensive entity relations** (grows, plants, photos with full data)
- ✅ **Database indexes** for optimal query performance
- ✅ **Type-safe procedures** with proper input validation

## Post Router Procedures

### 🔧 `create`

**Type:** `protectedProcedure`  
**Purpose:** Create a new post linked to an entity (grow, plant, or photo)

**Input Schema:**

```typescript
{
  content: string; // Post content (min 1 character)
  entityId: string; // ID of the linked entity
  entityType: PostableEntityType; // 'GROW' | 'PLANT' | 'PHOTO'
}
```

**Features:**

- ✅ Entity existence validation before post creation
- ✅ Automatic user association from session
- ✅ Type-safe entity type validation
- ✅ Proper error handling for non-existent entities

**Example Usage:**

```typescript
const newPost = await trpc.post.create.mutate({
  content: "My plant is looking amazing today! 🌱",
  entityId: "plant_abc123",
  entityType: "PLANT",
});
```

---

### 🔧 `getAll`

**Type:** `publicProcedure`  
**Purpose:** Get paginated posts with advanced filtering capabilities

**Input Schema:**

```typescript
{
  cursor?: string;        // ISO datetime cursor for pagination
  limit?: number;         // Items per page (1-50, default: 20)
  followingOnly?: boolean; // Filter to following users only (default: false)
  userId?: string;        // Filter to specific user's posts
}
```

**Features:**

- ✅ **Cursor-based pagination** with proper `hasNextPage` detection
- ✅ **Multiple filtering modes:**
  - Public timeline (all posts)
  - User-specific posts (`userId` filter)
  - Following-only posts (`followingOnly` filter)
- ✅ **Comprehensive entity loading** with all relations
- ✅ **Performance optimized** with database indexes

**Return Type:**

```typescript
{
  posts: Post[];          // Array of posts with full relations
  nextCursor: string | null; // Cursor for next page
  hasNextPage: boolean;   // Whether more posts exist
}
```

**Entity Relations Loaded:**

- `owner` - Post author details
- `grow` - Full grow data with owner, header image, and plants
- `plant` - Full plant data with strain, breeder, and images
- `photo` - Image data with owner and plant relations

**Example Usage:**

```typescript
// Public timeline
const publicTimeline = await trpc.post.getAll.query({
  limit: 20,
});

// User-specific posts
const userPosts = await trpc.post.getAll.query({
  userId: "user_123",
  limit: 10,
});

// Following timeline (requires auth)
const followingPosts = await trpc.post.getAll.query({
  followingOnly: true,
  limit: 15,
});

// Paginated results
const nextPage = await trpc.post.getAll.query({
  cursor: publicTimeline.nextCursor,
  limit: 20,
});
```

---

### 🔧 `getFollowingTimeline`

**Type:** `protectedProcedure`  
**Purpose:** Get timeline of posts from users that the current user follows

**Input Schema:**

```typescript
{
  cursor?: string;        // ISO datetime cursor for pagination
  limit?: number;         // Items per page (1-50, default: 20)
}
```

**Features:**

- ✅ **Authentication required** - automatically uses session user
- ✅ **Optimized following queries** with proper indexing
- ✅ **Empty result handling** when user follows no one
- ✅ **Same comprehensive entity relations** as `getAll`
- ✅ **Cursor pagination** with performance optimization

**Example Usage:**

```typescript
const followingTimeline = await trpc.post.getFollowingTimeline.query({
  limit: 25,
});

// Pagination
const nextPage = await trpc.post.getFollowingTimeline.query({
  cursor: followingTimeline.nextCursor,
  limit: 25,
});
```

---

### 🔧 `deleteById`

**Type:** `protectedProcedure`  
**Purpose:** Delete a post by ID (owner only)

**Input Schema:**

```typescript
{
  id: string; // Post ID to delete
}
```

**Features:**

- ✅ **Ownership verification** - only post owner can delete
- ✅ **Existence checking** with proper error messages
- ✅ **Secure deletion** with authorization

**Example Usage:**

```typescript
const result = await trpc.post.deleteById.mutate({
  id: "post_abc123",
});
// Returns: { success: boolean }
```

## Timeline Features

### 🚀 Enhanced Pagination

**Cursor-Based Pagination:**

- Uses `createdAt` timestamps as cursors for consistent ordering
- Implements `hasNextPage` logic to detect more results
- Fetches `limit + 1` items to efficiently check for next page
- Provides stable pagination even with concurrent data changes

**Performance Benefits:**

- No `OFFSET` queries that become slower with large datasets
- Consistent performance regardless of page depth
- Database index optimized for cursor-based queries

### 🎯 Multi-Filter Support

**Filter Combinations:**

1. **Public Timeline** - All posts, ordered by creation date
2. **User Posts** - Posts from a specific user
3. **Following Timeline** - Posts from followed users only
4. **Entity-Specific** - Posts linked to specific grows/plants/photos

**Authentication Handling:**

- Public procedures allow unauthenticated access to public data
- Protected procedures enforce authentication for personalized features
- Following-only filter requires authentication even in public procedures

### 🔗 Comprehensive Entity Relations

**Loaded Relations:**

```typescript
{
  owner: User;                    // Post author
  grow?: {                        // If post links to grow
    owner: User;
    headerImage?: Image;
    plants: Plant[];              // All plants in grow
  };
  plant?: {                       // If post links to plant
    owner: User;
    grow?: Grow;
    strain?: Strain;              // With breeder info
    headerImage?: Image;
    plantImages: Image[];         // All plant photos
  };
  photo?: {                       // If post links to photo
    owner: User;
    plantImages: PlantImage[];    // Associated plant relations
  };
}
```

## Performance Optimizations

### 🗂️ Database Indexes

**Posts Table Indexes:**

```sql
-- Composite indexes for efficient timeline queries
posts_user_created_at_idx: (user_id, created_at DESC)
posts_entity_type_created_at_idx: (entity_type, created_at DESC)

-- Single column indexes for basic queries
posts_created_at_idx: (created_at DESC)
posts_user_idx: (user_id)
```

**User Follows Table Indexes:**

```sql
-- Unique constraint + performance
user_follows_follower_following_idx: UNIQUE (follower_id, following_id)
user_follows_follower_created_at_idx: (follower_id, created_at DESC)
user_follows_following_idx: (following_id)
```

**Additional Entity Indexes:**

- Grows: `owner_created_at_idx`, `owner_updated_at_idx`, `created_at_idx`
- Plants: `owner_created_at_idx`, `grow_created_at_idx`, `strain_created_at_idx`
- Images: `owner_created_at_idx`, `owner_capture_date_idx`, `capture_date_idx`

### ⚡ Query Optimizations

**Following Timeline Optimization:**

1. Single query to get following user IDs
2. `IN` clause query for posts from following users
3. Combined with cursor pagination for scalability

**Entity Relations Optimization:**

- Uses Drizzle's `with` syntax for efficient JOIN queries
- Selective column loading for related entities
- Optimized nested relation queries

## Usage Examples

### 📱 Frontend Integration

**React Query Integration:**

```typescript
// Infinite query for timeline
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ["posts", "timeline"],
    queryFn: ({ pageParam }) =>
      trpc.post.getAll.query({
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

// User-specific posts
const userPosts = useQuery({
  queryKey: ["posts", "user", userId],
  queryFn: () =>
    trpc.post.getAll.query({
      userId,
      limit: 10,
    }),
});

// Following timeline (authenticated)
const followingTimeline = useQuery({
  queryKey: ["posts", "following"],
  queryFn: () => trpc.post.getFollowingTimeline.query(),
  enabled: !!session?.user,
});
```

**Component Usage:**

```tsx
function Timeline() {
  const timeline = useInfiniteQuery({
    queryKey: ["posts", "public"],
    queryFn: ({ pageParam }) =>
      trpc.post.getAll.query({
        cursor: pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <div>
      {timeline.data?.pages.map((page) =>
        page.posts.map((post) => <PostCard key={post.id} post={post} />),
      )}

      {timeline.hasNextPage && (
        <button
          onClick={() => timeline.fetchNextPage()}
          disabled={timeline.isFetchingNextPage}
        >
          {timeline.isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

### 🔄 Advanced Filtering

**Conditional Filtering:**

```typescript
// Dynamic filter based on user preference
const getTimelineQuery = (
  isAuthenticated: boolean,
  showFollowingOnly: boolean,
  targetUserId?: string,
) => {
  if (targetUserId) {
    return trpc.post.getAll.query({ userId: targetUserId });
  }

  if (isAuthenticated && showFollowingOnly) {
    return trpc.post.getFollowingTimeline.query();
  }

  return trpc.post.getAll.query();
};
```

## Error Handling

### 🚨 Common Error Scenarios

**Authentication Errors:**

```typescript
// Following timeline without auth
try {
  const result = await trpc.post.getFollowingTimeline.query();
} catch (error) {
  if (error.code === "UNAUTHORIZED") {
    // Redirect to login or show auth prompt
  }
}
```

**Entity Not Found:**

```typescript
// Creating post with invalid entity
try {
  await trpc.post.create.mutate({
    content: "Test post",
    entityId: "invalid_id",
    entityType: "PLANT",
  });
} catch (error) {
  if (error.code === "NOT_FOUND") {
    // Show error: "Plant not found"
  }
}
```

**Validation Errors:**

```typescript
// Invalid input data
try {
  await trpc.post.create.mutate({
    content: "", // Too short
    entityId: "plant_123",
    entityType: "PLANT",
  });
} catch (error) {
  if (error.code === "BAD_REQUEST") {
    // Show validation errors
  }
}
```

### 🛡️ Error Response Types

```typescript
type TRPCError = {
  code: "BAD_REQUEST" | "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR";
  message: string;
  data?: {
    code: string;
    httpStatus: number;
    path: string;
  };
};
```

## 🎯 Best Practices

### Performance

1. **Use appropriate limits** - Don't fetch more data than needed
2. **Implement proper caching** - Use React Query's caching features
3. **Monitor query performance** - Use the database performance test script
4. **Use cursor pagination** - More efficient than offset-based pagination

### Security

1. **Validate entity ownership** - Check user permissions before mutations
2. **Sanitize content** - Ensure post content is safe
3. **Rate limiting** - Implement rate limits for post creation
4. **Authentication checks** - Verify user permissions for protected data

### User Experience

1. **Loading states** - Show appropriate loading indicators
2. **Error boundaries** - Handle errors gracefully
3. **Optimistic updates** - Update UI before server confirmation
4. **Infinite scroll** - Provide smooth pagination experience

---

## 🔗 Related Documentation

- [Database Schema Documentation](./database-schema.md)
- [Authentication System](./auth-system.md)
- [Frontend Integration Guide](./frontend-integration.md)
- [Performance Monitoring](./performance-monitoring.md)

---

_Last updated: May 26, 2025_  
_Version: 1.0.0_
