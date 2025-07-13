---
applyTo: "**"
---

# 🚀 Database Performance Optimization

## Performance Indexes and Query Optimization

This guide documents the database optimizations implemented for the activity feeds and timeline system in GrowAGram v2.

## 📊 Overview

The optimization strategy focuses on:

1. **Index Strategy** - Composite and single-column indexes for optimal query performance
2. **Query Patterns** - Optimized for common timeline and feed operations
3. **Pagination Performance** - Cursor-based pagination with proper indexing
4. **Relationship Loading** - Efficient JOIN operations for complex entity relations

## 🗂️ Implemented Indexes

### Posts Table (`public_post`)

**Purpose:** Optimize timeline queries and post filtering

```sql
-- Composite indexes for complex timeline queries
CREATE INDEX posts_user_created_at_idx ON public_post (user_id, created_at DESC);
CREATE INDEX posts_entity_type_created_at_idx ON public_post (entity_type, created_at DESC);

-- Single column indexes for basic operations
CREATE INDEX posts_created_at_idx ON public_post (created_at DESC);
CREATE INDEX posts_user_idx ON public_post (user_id);
```

**Query Patterns Optimized:**

- ✅ Public timeline ordered by creation date
- ✅ User-specific posts with temporal ordering
- ✅ Entity-type filtering with temporal ordering
- ✅ Cursor-based pagination queries

### User Follows Table (`user_follow`)

**Purpose:** Optimize following relationship queries and timeline generation

```sql
-- Unique constraint prevents duplicate follows + performance
CREATE UNIQUE INDEX user_follows_follower_following_idx ON user_follow (follower_id, following_id);

-- Temporal ordering for follow timeline generation
CREATE INDEX user_follows_follower_created_at_idx ON user_follow (follower_id, created_at DESC);

-- Following lookup optimization
CREATE INDEX user_follows_following_idx ON user_follow (following_id);
```

**Query Patterns Optimized:**

- ✅ Get all users a person follows
- ✅ Check if user A follows user B
- ✅ Get followers of a specific user
- ✅ Recent following relationships

### Grows Table (`grow`)

**Purpose:** Optimize grow exploration and owner-based queries

```sql
-- Owner-based queries with temporal ordering
CREATE INDEX grows_owner_created_at_idx ON grow (owner_id, created_at DESC);
CREATE INDEX grows_owner_updated_at_idx ON grow (owner_id, updated_at DESC);

-- Public exploration queries
CREATE INDEX grows_created_at_idx ON grow (created_at DESC);
CREATE INDEX grows_updated_at_idx ON grow (updated_at DESC);

-- Basic lookup indexes
CREATE INDEX grows_owner_idx ON grow (owner_id);
CREATE INDEX grows_name_idx ON grow (name);
```

**Query Patterns Optimized:**

- ✅ User's grows with temporal ordering
- ✅ Recently updated grows for exploration
- ✅ Newest grows for discovery
- ✅ Grow name searches

### Plants Table (`plant`)

**Purpose:** Optimize plant exploration, filtering, and relationship queries

```sql
-- Owner and relationship-based queries
CREATE INDEX plants_owner_created_at_idx ON plant (owner_id, created_at DESC);
CREATE INDEX plants_owner_updated_at_idx ON plant (owner_id, updated_at DESC);
CREATE INDEX plants_grow_created_at_idx ON plant (grow_id, created_at DESC);
CREATE INDEX plants_strain_created_at_idx ON plant (strain_id, created_at DESC);

-- Temporal ordering for exploration
CREATE INDEX plants_created_at_idx ON plant (created_at DESC);
CREATE INDEX plants_updated_at_idx ON plant (updated_at DESC);
CREATE INDEX plants_start_date_idx ON plant (start_date DESC);

-- Basic lookup indexes
CREATE INDEX plants_owner_idx ON plant (owner_id);
CREATE INDEX plants_grow_idx ON plant (grow_id);
CREATE INDEX plants_strain_idx ON plant (strain_id);
CREATE INDEX plants_name_idx ON plant (name);
```

**Query Patterns Optimized:**

- ✅ User's plants with temporal ordering
- ✅ Plants in a specific grow
- ✅ Plants of a specific strain
- ✅ Plant lifecycle phase filtering
- ✅ Recently started plants

### Images Table (`image`)

**Purpose:** Optimize image queries and media timelines

```sql
-- Owner-based image queries
CREATE INDEX images_owner_created_at_idx ON image (owner_id, created_at DESC);
CREATE INDEX images_owner_capture_date_idx ON image (owner_id, captureDate DESC);

-- Public image exploration
CREATE INDEX images_created_at_idx ON image (created_at DESC);
CREATE INDEX images_capture_date_idx ON image (captureDate DESC);

-- Basic lookup
CREATE INDEX images_owner_idx ON image (owner_id);
```

**Query Patterns Optimized:**

- ✅ User's photos with temporal ordering
- ✅ Recently uploaded images
- ✅ Photos by capture date
- ✅ Media timeline generation

## 🚀 Performance Benefits

### Timeline Query Performance

**Before Optimization:**

```sql
-- Slow: Full table scan for user timeline
SELECT * FROM public_post
WHERE user_id IN (SELECT following_id FROM user_follow WHERE follower_id = ?)
ORDER BY created_at DESC
LIMIT 20;
```

**After Optimization:**

```sql
-- Fast: Uses user_follows_follower_created_at_idx + posts_user_created_at_idx
-- Same query but now index-optimized
```

**Expected Performance Gains:**

- Timeline queries: **10-50x faster** for large datasets
- User-specific queries: **5-20x faster** with composite indexes
- Following lookups: **Near-instant** with unique constraint index
- Pagination: **Consistent performance** regardless of offset depth

### Cursor Pagination Benefits

**Traditional Offset Pagination Problems:**

```sql
-- Gets slower as offset increases
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 10000;
```

**Cursor-Based Solution:**

```sql
-- Consistent performance using indexed WHERE clause
SELECT * FROM posts
WHERE created_at < '2025-05-26T10:00:00Z'
ORDER BY created_at DESC
LIMIT 20;
```

**Performance Characteristics:**

- ✅ **O(log n)** complexity instead of **O(n)**
- ✅ Consistent response times regardless of page depth
- ✅ Stable results even during concurrent data changes
- ✅ Index-optimized WHERE clauses

## 📈 Query Analysis Examples

### Example 1: Public Timeline Query

```typescript
// tRPC Query
const posts = await trpc.post.getAll.query({ limit: 20 });

// Generated SQL (simplified)
SELECT p.*, u.name as owner_name
FROM public_post p
JOIN user u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 21;  -- +1 for hasNextPage detection
```

**Index Used:** `posts_created_at_idx`  
**Expected Performance:** < 10ms for millions of posts

### Example 2: Following Timeline Query

```typescript
// tRPC Query
const timeline = await trpc.post.getFollowingTimeline.query({ limit: 20 });

// Generated SQL (simplified)
-- Step 1: Get following users (uses user_follows_follower_created_at_idx)
SELECT following_id FROM user_follow WHERE follower_id = ?;

-- Step 2: Get posts from following users (uses posts_user_created_at_idx)
SELECT p.*, u.name
FROM public_post p
JOIN user u ON p.user_id = u.id
WHERE p.user_id IN (?, ?, ?, ...)
ORDER BY p.created_at DESC
LIMIT 21;
```

**Indexes Used:**

- `user_follows_follower_created_at_idx`
- `posts_user_created_at_idx`

**Expected Performance:** < 25ms for complex following relationships

### Example 3: User-Specific Posts

```typescript
// tRPC Query
const userPosts = await trpc.post.getAll.query({
  userId: "user_123",
  limit: 20
});

// Generated SQL (simplified)
SELECT p.*, u.name
FROM public_post p
JOIN user u ON p.user_id = u.id
WHERE p.user_id = ?
ORDER BY p.created_at DESC
LIMIT 21;
```

**Index Used:** `posts_user_created_at_idx`  
**Expected Performance:** < 5ms for any user's post history

## 🧪 Performance Testing

### Automated Testing Script

Use the provided performance testing script:

```bash
bun run scripts/test-database-performance.ts
```

**Test Coverage:**

- ✅ Public timeline performance
- ✅ User-specific post queries
- ✅ Following timeline generation
- ✅ Cursor pagination efficiency
- ✅ Entity relationship loading
- ✅ Image query performance

### Performance Benchmarks

**Target Performance Goals:**

| Query Type         | Target Time | Index Used                  |
| ------------------ | ----------- | --------------------------- |
| Public Timeline    | < 10ms      | `posts_created_at_idx`      |
| User Posts         | < 5ms       | `posts_user_created_at_idx` |
| Following Timeline | < 25ms      | Multiple composite indexes  |
| Cursor Pagination  | < 15ms      | Date-based WHERE clauses    |
| Grow Exploration   | < 20ms      | `grows_updated_at_idx`      |
| Plant Exploration  | < 20ms      | `plants_created_at_idx`     |

### Monitoring Query Performance

**Database Query Logging:**

```typescript
// Enable query logging in development
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
```

**Performance Monitoring:**

```typescript
// Custom query timing
const startTime = performance.now();
const result = await db.query.posts.findMany(/* query */);
const duration = performance.now() - startTime;
console.log(`Query took ${duration.toFixed(2)}ms`);
```

## 🔧 Migration Strategy

### Applying Index Migrations

**Generated Migration File:** `0024_fancy_santa_claus.sql`

```sql
-- Example migration commands
CREATE INDEX IF NOT EXISTS "posts_user_created_at_idx"
ON "public_post" USING btree ("user_id","created_at" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "posts_created_at_idx"
ON "public_post" USING btree ("created_at" DESC NULLS LAST);

-- ... additional indexes
```

**Deployment Steps:**

1. **Generate migration:** `bun run db:generate`
2. **Review migration:** Check generated SQL file
3. **Apply migration:** `bun run db:migrate`
4. **Verify indexes:** Check database index creation
5. **Test performance:** Run performance test script

### Safe Migration Practices

**Production Deployment:**

1. **Create indexes concurrently** to avoid table locks
2. **Monitor migration progress** for large tables
3. **Test index effectiveness** after deployment
4. **Rollback plan** - document index removal if needed

**Example Concurrent Index Creation:**

```sql
-- For production environments
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_created_at_idx"
ON "public_post" USING btree ("created_at" DESC NULLS LAST);
```

## 🎯 Optimization Recommendations

### Immediate Optimizations ✅

- ✅ **Composite indexes** for timeline queries
- ✅ **Cursor-based pagination** implementation
- ✅ **Following relationship indexes** for social features
- ✅ **Entity exploration indexes** for discovery features

### Future Optimizations 🔮

**Advanced Indexing:**

- **Partial indexes** for active/non-deleted records
- **Expression indexes** for computed values
- **Full-text search indexes** for content search

**Caching Strategy:**

- **Redis caching** for frequently accessed timelines
- **CDN caching** for public content
- **Application-level caching** for expensive queries

**Database Scaling:**

- **Read replicas** for timeline queries
- **Connection pooling** optimization
- **Query result caching** with invalidation

### Monitoring and Alerting

**Performance Metrics to Track:**

- Average query response times
- 95th percentile query performance
- Index usage statistics
- Cache hit rates

**Alerting Thresholds:**

- Timeline queries > 50ms
- Following queries > 100ms
- Database connection pool exhaustion
- Index scan ratio degradation

## 🔄 Related Resources

- **Database Setup**: See `/database/README.md` for structure and migrations
- **Performance SEO**: See `performance-seo.instructions.md` for web/frontend performance (separate from DB)
- **Coding Guidelines**: See `coding-guidelines.instructions.md` for database query patterns
- PostgreSQL Index Documentation: https://www.postgresql.org/docs/current/indexes.html
- Drizzle ORM Performance Guide: https://orm.drizzle.team/docs/performance

---

_This guide covers database-specific performance optimization. For web/frontend performance optimization, see performance-seo.instructions.md._
