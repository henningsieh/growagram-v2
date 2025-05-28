# Product Requirements Document (PRD)

# Activity Feeds/Timelines and Follow System

**Document Version:** 1.0  
**Created:** May 26, 2025  
**Last Updated:** May 26, 2025  
**Project:** GrowAGram v2  
**Phase:** Phase 2 - Social Features

---

## Executive Summary

This PRD outlines the comprehensive design and implementation strategy for Activity Feeds/Timelines and Follow System features in GrowAGram. These features will transform the current public timeline into a more sophisticated social platform with personalized feeds, exploration pages, and user-centric content discovery.

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Problem Statement](#problem-statement)
3. [Goals and Objectives](#goals-and-objectives)
4. [Feature Requirements](#feature-requirements)
5. [Technical Architecture](#technical-architecture)
6. [Database Schema Changes](#database-schema-changes)
7. [API Specifications](#api-specifications)
8. [Frontend Components](#frontend-components)
9. [User Experience Flow](#user-experience-flow)
10. [Implementation Plan](#implementation-plan)
11. [Testing Strategy](#testing-strategy)
12. [Performance Considerations](#performance-considerations)
13. [Success Metrics](#success-metrics)

---

## Current State Analysis

### Existing Features

- ✅ Basic public timeline showing all posts/updates
- ✅ User follow/unfollow functionality in database
- ✅ Post creation for Grows, Plants, and Photos
- ✅ Comment and like system
- ✅ Notification system with factory pattern
- ✅ User profile pages with basic information

### Current Limitations

- ❌ Public timeline mixes posts with direct entity listings (grows/plants)
- ❌ No personalized timeline for followed users
- ❌ No dedicated exploration pages for Grows and Plants
- ❌ No activity feeds for individual entities (Users, Grows, Plants)
- ❌ No filtering or sorting options for content discovery
- ❌ No infinite scroll implementation for timelines

---

## Problem Statement

The current public timeline implementation creates confusion by mixing different content types and lacks the social features necessary for a thriving community. Users need:

1. **Clear Content Separation:** Distinct viewing experiences for posts vs. entity exploration
2. **Personalized Feeds:** Timeline showing content from followed users
3. **Discovery Features:** Dedicated pages to explore grows and plants with advanced filtering
4. **Activity Tracking:** Individual timelines for users, grows, and plants
5. **Performance:** Efficient infinite scroll and pagination for large datasets

---

## Goals and Objectives

### Primary Goals

1. **Restructure Timeline System:** Split public timeline into "All Posts" and "Following" feeds
2. **Create Exploration Pages:** Dedicated pages for browsing grows and plants
3. **Implement Activity Feeds:** Individual timelines for users, grows, and plants
4. **Enhance Discovery:** Advanced filtering, sorting, and search capabilities
5. **Improve Performance:** Infinite scroll and optimized data loading

### Secondary Goals

- Increase user engagement through personalized content
- Improve content discoverability
- Provide better user experience for community exploration
- Establish foundation for future social features

---

## Entity Field Assignments

### Filter Categories by Entity

To ensure proper data modeling and filtering, the following categorization defines which filters belong to which entities:

**Note:** The enum values below represent the final implementation with enhanced options that provide better granularity for filtering and user experience compared to the initial minimal requirements. During development, these categories were expanded to better serve the growing community's needs.

#### Grow Entity Fields

- **Environment:** Indoor, Outdoor, Greenhouse, Hydroponic
- **Culture Medium:** Soil, Coco, Hydro, Rockwool, Perlite, Vermiculite
- **Fertilizer Type:** Organic, Mineral
- **Fertilizer Form:** Liquid, Granular, Slow Release
- **Status:** All, Growing, Harvested _(calculated on-the-fly based on associated plants' growth stages)_

#### Plant Entity Fields

- **Growth Stage:** Planted, Seedling, Vegetation, Flowering, Harvested, Curing
- **Strain Type:** Indica, Sativa, Hybrid
- **Genetics Type:** Autoflowering, Photoperiod
- **Associated Grow:** Filter by specific grows (relationship filter)

#### Calculated Fields Logic

- **Grow Status** is determined by examining the growth stages of all plants associated with a grow:
  - **Growing:** At least one plant in stages: Planted, Seedling, Vegetation, or Flowering
  - **Harvested:** At least one plant in stages: Harvested or Curing

---

## Feature Requirements

### 1. Timeline System Restructure

#### 1.1 Public Timeline (/public/timeline)

**Description:** Main timeline with two distinct tabs

**Features:**

- **All Posts Tab (Default):** Shows all public posts/updates from the entire platform
- **Following Tab:** Shows posts/updates only from users the current user follows
- Posts are chronologically ordered (newest first)
- Each post displays full social features (likes, comments, shares)
- Infinite scroll implementation
- Real-time updates for new posts

**Acceptance Criteria:**

- [ ] Timeline loads with "All Posts" as default tab
- [ ] Infinite scroll loads more posts when reaching bottom
- [ ] Posts display consistent social interaction elements
- [ ] Following tab requires user authentication
- [ ] Empty states handled gracefully

#### 1.2 Following Timeline Logic

**Description:** Filtered timeline showing content from followed users only

**Logic:**

```typescript
// Pseudo-code for following timeline query
const followingPosts = await db.query.posts.findMany({
  where: (posts, { inArray, eq }) => inArray(posts.userId, userFollowingIds),
  orderBy: [desc(posts.createdAt)],
  // ... with relations
});
```

### 2. Exploration Pages

#### 2.1 Explore Grows (/public/explore/grows)

**Description:** Dedicated page for browsing and discovering grows

**Inspired by:** GrowDiaries.com/explore structure

**Features:**

- **Filter Categories (Grow Entity Fields):**
  - Status: All, Growing, Harvested _(calculated on-the-fly, see logic below)_
  - Environment: Indoor, Outdoor, Greenhouse, Hydroponic
  - Culture Medium: Soil, Coco, Hydro, Rockwool, Perlite, Vermiculite
  - Fertilizer Type: Organic, Mineral
  - Fertilizer Form: Liquid, Granular, Slow Release
- **Sorting Options:**
  - Newest, Oldest, Most Popular, Most Comments, Most Likes
- **Display Format:**
  - Grid layout with grow cards
  - Header image, title, grower name, strain info
  - Quick stats (week, likes, comments)
  - Hover effects for additional info (important: make shure, that most of the additional info is also visible on mobile, where no hover mechanism exists!)
- **Infinite Scroll:** Load more grows as user scrolls
- **Search:** Full text search in grow names and descriptions

**Acceptance Criteria:**

- [ ] Filter system works independently and in combination
- [ ] Sorting persists across page loads
- [ ] Grid layout responsive across devices
- [ ] Each grow card links to individual grow page
- [ ] Search results update in real-time
- [ ] URL parameters reflect current filters/sort

**Grow Status Calculation Logic:**

The Grow Status filter is **calculated on-the-fly** based on the growth stages of plants associated with each grow, not stored as a hardcoded field:

- **All:** No filtering applied, shows all grows
- **Growing:** Shows grows that have one or more plants with growth stages: `Planted`, `Seedling`, `Vegetation`, or `Flowering`
- **Harvested:** Shows grows that have one or more plants with growth stages: `Harvested` or `Curing`

```typescript
// Pseudo-code for grow status filtering
const growingGrows = await db.query.grows.findMany({
  where: exists(
    db.query.plants.findFirst({
      where: and(
        eq(plants.growId, grows.id),
        inArray(plants.growthStage, [
          "planted",
          "seedling",
          "vegetation",
          "flowering",
        ]),
      ),
    }),
  ),
});

const harvestedGrows = await db.query.grows.findMany({
  where: exists(
    db.query.plants.findFirst({
      where: and(
        eq(plants.growId, grows.id),
        inArray(plants.growthStage, ["harvested", "curing"]),
      ),
    }),
  ),
});
```

#### 2.2 Explore Plants (/public/explore/plants)

**Description:** Dedicated page for browsing and discovering plants

**Features:**

- **Filter Categories (Plant Entity Fields):**
  - Growth Stages: Planted, Seedling, Vegetation, Flowering, Harvested, Curing
  - Strain Type: Indica, Sativa, Hybrid
  - Genetics Type: Autoflowering, Photoperiod
  - Associated Grow: Filter by specific grows
- **Sorting Options:**
  - Newest, Oldest, Most Popular, Most Comments, Most Likes,
- **Display Format:**
  - Grid layout with plant cards
  - Header image, name, owner, strain info
  - Growth stage indicator
  - Quick stats (age, likes, comments)
- **Advanced Features:**
  - Strain information overlay
  - Growth phase timeline preview

**Acceptance Criteria:**

- [ ] Similar functionality to Explore Grows
- [ ] Plant-specific filters work correctly
- [ ] Growth stage indicators are accurate
- [ ] Strain information displays properly

### 3. Activity Feeds

#### 3.1 User Activity Feed (/public/users/[id]/activity)

**Description:** Comprehensive timeline of user's activities

**Content Types:**

- Posts created by the user
- Comments made by the user
- Likes given by the user
- New grows started
- New plants added
- Milestone achievements (harvest, etc.)

**Features:**

- Chronological timeline format
- Activity type filtering
- Pagination with infinite scroll
- Privacy controls (public activities only)

#### 3.2 Grow Activity Feed (/public/grows/[id]/activity)

**Description:** Timeline of activities related to specific grow

**Content Types:**

- Posts about the grow
- Comments on grow posts
- Likes received
- Plant additions/removals
- Phase transitions (veg to flower, etc.)
- Updates and milestones

#### 3.3 Plant Activity Feed (/public/plants/[id]/activity)

**Description:** Timeline of activities related to specific plant

**Content Types:**

- Posts about the plant
- Comments and likes
- Growth phase changes
- Photo uploads
- Care updates

### 4. Enhanced User Profiles

#### 4.1 Profile Timeline Tabs

**Description:** Enhanced user profile pages with content tabs

**Tabs Structure:**

- **Timeline:** User's activity feed (posts, updates)
- **Grows:** Grid view of user's grows (reuse Explore Grows template)
- **Plants:** Grid view of user's plants (reuse Explore Plants template)
- **Photos:** Gallery of user's uploaded photos
- **Following:** List of users this user follows
- **Followers:** List of users following this user

**Acceptance Criteria:**

- [ ] Tabs load content without page refresh
- [ ] Grows and Plants tabs reuse exploration page templates
- [ ] Privacy settings respected for each tab
- [ ] Empty states provide helpful guidance

---

## Technical Architecture

### 1. Database Schema Analysis

**Current Schema Status:**

- ✅ `userFollows` table exists with proper relations
- ✅ `posts` table with entity relationships
- ✅ Proper indexing for followers/following queries
- ✅ Users, grows, plants relations established

**Required Indexes (Performance Optimization):**

```sql
-- For timeline queries
CREATE INDEX IF NOT EXISTS posts_user_created_at_idx ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);

-- For entity-specific queries
CREATE INDEX IF NOT EXISTS posts_entity_type_id_idx ON posts(entity_type, entity_id);

-- For user following queries (already exists)
-- user_follows has proper indexes
```

### 2. API Router Enhancements

#### 2.1 Enhanced Post Router

```typescript
// src/server/api/routers/post.ts
export const postRouter = {
  // Enhanced getAll with filtering
  getAll: publicProcedure
    .input(
      z.object({
        cursor: z.date().nullish(),
        limit: z.number().min(1).max(50).default(20),
        followingOnly: z.boolean().default(false),
        userId: z.string().optional(), // For user-specific feeds
      }),
    )
    .query(async ({ ctx, input }) => {
      // Implementation for cursor-based pagination
      // Filter by following if requested
    }),

  // New: Get user's following timeline
  getFollowingTimeline: protectedProcedure
    .input(
      z.object({
        cursor: z.date().nullish(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get posts from followed users only
    }),

  // New: Get entity-specific activity feed
  getEntityActivity: publicProcedure
    .input(
      z.object({
        entityType: z.enum(["user", "grow", "plant"]),
        entityId: z.string(),
        cursor: z.date().nullish(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get activity for specific entity
    }),
};
```

#### 2.2 Enhanced Grow Router

```typescript
// src/server/api/routers/grow.ts
export const growRouter = {
  // New: Exploration query with filters (Grow entity fields)
  explore: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(50).default(20),
        status: z.enum(["all", "growing", "harvested"]).default("all"), // Calculated on-the-fly
        environment: z
          .enum(["all", "indoor", "outdoor", "greenhouse"])
          .default("all"),
        cultureMedium: z
          .enum(["all", "soil", "cocos", "hydroponic", "other"])
          .default("all"),
        fertilizerType: z
          .enum(["all", "mineral", "organic", "mixed"])
          .default("all"),
        sortBy: z
          .enum(["newest", "oldest", "popular", "comments"])
          .default("newest"),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Implementation with grow-specific filters
      // Status filtering requires joining with plants table to check growth stages
    }),
};
```

#### 2.3 Enhanced Plant Router

```typescript
// src/server/api/routers/plant.ts
export const plantRouter = {
  // Plant exploration with plant entity fields
  explore: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(50).default(20),
        growthStage: z
          .enum([
            "all",
            "seedling",
            "vegetation",
            "flowering",
            "harvested",
            "curing",
          ])
          .default("all"),
        strainType: z
          .enum(["all", "indica", "sativa", "hybrid"])
          .default("all"),
        geneticsType: z
          .enum(["all", "autoflowering", "photoperiod"])
          .default("all"),
        associatedGrow: z.string().optional(), // Filter by specific grow ID
        sortBy: z
          .enum(["newest", "oldest", "stage", "popular"])
          .default("newest"),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Implementation with plant-specific filters
      // Direct plant entity field filtering
    }),
};
```

### 3. Frontend Component Architecture

#### 3.1 Enhanced Timeline Components

```
src/components/features/Timeline/
├── Views/
│   ├── public-timeline.tsx          // Main timeline with tabs
│   ├── following-timeline.tsx       // Following-only timeline
│   ├── user-activity-feed.tsx       // User activity timeline
│   ├── grow-activity-feed.tsx       // Grow-specific activity
│   └── plant-activity-feed.tsx      // Plant-specific activity
├── Components/
│   ├── timeline-tabs.tsx            // Tab switcher component
│   ├── post-filter.tsx              // Filtering controls
│   ├── infinite-scroll-timeline.tsx // Infinite scroll wrapper
│   └── activity-item.tsx            // Individual activity item
└── Post/
    ├── post-card.tsx                // Enhanced post card
    ├── post-form-modal.tsx          // Existing post creation
    └── post-actions.tsx             // Like, comment, share actions
```

#### 3.2 Exploration Page Components

```
src/components/features/Exploration/
├── Grows/
│   ├── explore-grows-page.tsx       // Main exploration page
│   ├── grow-exploration-grid.tsx    // Grid layout for grows
│   ├── grow-card.tsx                // Individual grow card
│   └── grow-filters.tsx             // Filter controls
├── Plants/
│   ├── explore-plants-page.tsx      // Main exploration page
│   ├── plant-exploration-grid.tsx   // Grid layout for plants
│   ├── plant-card.tsx               // Individual plant card
│   └── plant-filters.tsx            // Filter controls
└── Common/
    ├── exploration-layout.tsx       // Shared layout component
    ├── filter-sidebar.tsx           // Reusable filter sidebar
    ├── sort-controls.tsx            // Sorting dropdown
    └── search-bar.tsx               // Search input component
```

#### 3.3 Enhanced Profile Components

```
src/components/features/Profile/
├── Views/
│   ├── user-profile-layout.tsx      // Main profile layout
│   ├── profile-timeline-tab.tsx     // Timeline tab content
│   ├── profile-grows-tab.tsx        // Grows tab (reuse exploration)
│   ├── profile-plants-tab.tsx       // Plants tab (reuse exploration)
│   └── profile-photos-tab.tsx       // Photos gallery
├── Components/
│   ├── profile-header.tsx           // User info header
│   ├── profile-tabs.tsx             // Tab navigation
│   ├── follow-stats.tsx             // Followers/following counts
│   └── profile-activity-summary.tsx // Quick activity overview
```

---

## User Experience Flow

### 1. Timeline Navigation Flow

```
1. User visits /public/timeline
   ├── Sees "All Posts" tab (default)
   ├── Can switch to "Following" tab (if authenticated)
   └── Infinite scroll loads more content

2. Following Tab (authenticated users only)
   ├── Shows posts from followed users only
   ├── Empty state encourages following users
   └── Suggests users to follow

3. Post Interactions
   ├── Like/unlike posts
   ├── Comment on posts
   ├── Share posts (future feature)
   └── Navigate to entity details
```

### 2. Exploration Flow

```
1. User visits /public/explore/grows or /public/explore/plants
   ├── Sees grid of entities with default sorting
   ├── Can apply filters in sidebar
   ├── Can change sorting method
   └── Can search by name/description

2. Filter Application
   ├── Multiple filters can be combined
   ├── URL updates to reflect filters
   ├── Results update in real-time
   └── Clear filters option available

3. Entity Selection
   ├── Click on entity card
   ├── Navigate to entity detail page
   ├── Can like/comment/follow from detail page
   └── Can view entity activity feed
```

### 3. Profile Navigation Flow

```
1. User visits /public/users/[id]
   ├── Sees profile header with follow button
   ├── Default tab shows user timeline
   └── Tab navigation for different content types

2. Tab Navigation
   ├── Timeline: User's activity feed
   ├── Grows: User's grows in grid format
   ├── Plants: User's plants in grid format
   ├── Photos: User's photo gallery
   ├── Following: Users this user follows
   └── Followers: Users following this user

3. Content Interaction
   ├── Each tab shows relevant content
   ├── Maintains same interaction patterns
   └── Consistent navigation experience
```

---

## Implementation Plan

### Foundational Work Completed

**✅ Database Schema Enhancements (Migration 0024)**

- Enhanced `grows` table with filtering fields: `environment`, `culture_medium`, `fertilizer_type`
- Added performance indexes for exploration queries
- Type-safe enum definitions in TypeScript with enhanced values

**✅ Form System Updates**

- Updated `grow-form.tsx` with complete UI for all three new filtering fields
- Enhanced strain creation with `strainType` and `geneticsType` fields
- Updated Zod schemas for type-safe form validation

**✅ API Layer Enhancements**

- Enhanced grow and plant router mutations to handle new filtering fields
- Single source of truth for type definitions using z.nativeEnum() references
- Consistent enum usage across database, API, and frontend

**✅ Navigation System Restructure**

- Replaced tab-based timeline navigation with route-based responsive navigation
- Updated `modulePaths` constants: removed PUBLICGROWS, PUBLICPLANTS; added FOLLOWINGTIMELINE
- Restructured timeline routes: `/public/timeline` (All Public), `/public/timeline/following` (Following)
- Removed `timeline-tabs.tsx` component in favor of existing responsive navigation pattern
- Updated translation keys for new navigation items in English and German
- Implemented separate layouts with proper prefetching for each timeline route

### Phase 1: Timeline System Restructure (Week 1-2)

#### Week 1: Backend API Development

- [x] **Day 1-2:** Enhance post router with filtering and pagination
  - ✅ Add `getFollowingTimeline` endpoint
  - ✅ Implement cursor-based pagination
  - ✅ Add filtering by user follows
- [x] **Day 3-4:** Database optimizations with Drizzle
  - ✅ Add performance indexes using Drizzle schema syntax
  - ✅ Optimize query performance with proper relations
  - ✅ Test with realistic datasets
- [x] **Day 5-7:** API documentation and manual testing
  - ✅ Comprehensive tRPC procedure documentation
  - ✅ Manual testing of new endpoints
  - ✅ Performance monitoring and optimization

#### Week 2: Frontend Timeline Implementation

- [x] **Day 1-3:** Timeline components development
  - ✅ Create `timeline-tabs.tsx` component
  - ✅ Implement `following-timeline.tsx`
  - ✅ Enhance `public-timeline.tsx`
- [x] **Day 4-5:** Infinite scroll implementation
  - ✅ Use reusable `InfiniteScrollLoader` component with intersection observer pattern
  - ✅ Implement cursor-based pagination
  - ✅ Add loading states and error handling
- [x] **Day 6-7:** Integration and testing
  - ✅ Integrate new components with existing pages
  - ✅ End-to-end testing
  - ✅ Performance testing

### Phase 2: Exploration Pages (Week 3-4)

#### Week 3: Backend Exploration APIs

- [x] **Day 1-3:** Grow exploration API
  - ✅ Implement `grows.explore` endpoint
  - ✅ Add filtering and sorting logic
  - ✅ Optimize query performance
- [x] **Day 4-5:** Plant exploration API
  - ✅ Implement `plants.explore` endpoint
  - ✅ Add plant-specific filters
  - ✅ Search functionality
- [x] **Day 6-7:** Testing and optimization
  - ✅ Performance testing with filters
  - ✅ API response optimization
  - ✅ Cache strategy implementation

#### Week 4: Frontend Exploration Pages

- [ ] **Day 1-3:** Exploration page layouts
  - Create exploration page templates
  - Implement filter sidebars
  - Grid layouts for entities
- [ ] **Day 4-5:** Filter and search components
  - Multi-select filter components
  - Real-time search implementation
  - URL parameter management
- [ ] **Day 6-7:** Integration and styling
  - Responsive design implementation
  - Accessibility features
  - Cross-browser testing

### Phase 3: Activity Feeds (Week 5-6)

#### Week 5: Activity Feed Backend

- [ ] **Day 1-3:** Activity feed APIs
  - User activity feed endpoint
  - Entity-specific activity feeds
  - Activity type categorization
- [ ] **Day 4-5:** Activity aggregation logic
  - Recent activity queries
  - Activity importance scoring
  - Performance optimization
- [ ] **Day 6-7:** Testing and documentation
  - Activity feed testing
  - Performance benchmarking

#### Week 6: Activity Feed Frontend

- [ ] **Day 1-3:** Activity components
  - Activity timeline components
  - Activity item templates
  - Activity type indicators
- [ ] **Day 4-5:** Profile integration
  - Enhanced profile tabs
  - Activity feed integration
  - User interaction features
- [ ] **Day 6-7:** Final integration
  - End-to-end testing
  - Performance optimization
  - User acceptance testing

### Phase 4: Enhanced Profiles (Week 7-8)

#### Week 7: Profile Backend Enhancements

- [ ] **Day 1-3:** User profile APIs
  - Enhanced user data queries
  - Profile-specific content aggregation
  - Privacy controls implementation
- [ ] **Day 4-5:** Content aggregation
  - User grows/plants/photos queries
  - Follow relationship queries
  - Activity summary calculations
- [ ] **Day 6-7:** Testing and optimization

#### Week 8: Profile Frontend Implementation

- [ ] **Day 1-4:** Profile page redesign
  - Tab-based profile layout
  - Content reuse from exploration pages
  - Enhanced user information display
- [ ] **Day 5-7:** Final integration and testing
  - Cross-feature integration testing
  - Performance optimization
  - User feedback incorporation

---

## Documentation & Testing Strategy

### 1. Documentation Requirements

**For this private hobby project, prioritize excellent documentation over unit testing.**

- **API Documentation:** Comprehensive tRPC procedure documentation with examples
- **Component Documentation:** JSDoc comments for all components and hooks
- **Database Schema:** Document entity relations and indexing strategies
- **Business Logic:** Document complex calculations (e.g., Grow Status logic)
- **Usage Examples:** Include code examples in all major feature documentation

### 2. Manual Testing Approach

- **Feature Testing:** Manual verification of all new functionality
- **Cross-browser Testing:** Test on major browsers and mobile devices
- **Performance Testing:** Monitor database query performance and page load times
- **User Flow Testing:** Verify complete user journeys through new features

### 3. Development Testing

- **TypeScript Validation:** Rely on TypeScript for type safety and error prevention
- **Drizzle Query Validation:** Test database queries during development
- **Real Data Testing:** Use production-like data for realistic testing scenarios
- **Performance Monitoring:** Monitor query execution times and memory usage

---

## Performance Considerations

### 1. Database Optimization with Drizzle

**Always use Drizzle ORM syntax - never write manual SQL queries.**

#### Performance Indexes in Drizzle Schema

```typescript
// Critical indexes for timeline performance
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    entityType: varchar("entity_type", { length: 50 }),
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
    // Entity type filtering
    entityTypeCreatedAtIdx: index("posts_entity_type_created_at_idx").on(
      table.entityType,
      table.createdAt.desc(),
    ),
  }),
);

export const userFollows = pgTable(
  "user_follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint for follow relationships
    followerFollowingIdx: uniqueIndex("user_follows_follower_following_idx").on(
      table.followerId,
      table.followingId,
    ),
    // Performance indexes for follow queries
    followerCreatedAtIdx: index("user_follows_follower_created_at_idx").on(
      table.followerId,
      table.createdAt.desc(),
    ),
    followingIdx: index("user_follows_following_idx").on(table.followingId),
  }),
);
```

#### Optimized Drizzle Queries

```typescript
// Following timeline query with proper relations
const followingTimeline = await db.query.posts.findMany({
  where: (posts, { inArray, desc }) => inArray(posts.userId, followingUserIds),
  orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  limit: 20,
  offset: cursor * 20,
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
    _count: {
      likes: true,
      comments: true,
    },
  },
});

// Explore grows with calculated status filtering
const exploreGrows = await db.query.grows.findMany({
  where: (grows, { and, eq, exists, inArray, ilike }) =>
    and(
      // Text search
      searchQuery ? ilike(grows.name, `%${searchQuery}%`) : undefined,
      // Environment filter
      environment ? eq(grows.environment, environment) : undefined,
      // Status filter (calculated from plant growth stages)
      status === "growing"
        ? exists(
            db
              .select()
              .from(plants)
              .where(
                and(
                  eq(plants.growId, grows.id),
                  inArray(plants.growthStage, [
                    "planted",
                    "seedling",
                    "vegetation",
                    "flowering",
                  ]),
                ),
              ),
          )
        : status === "harvested"
          ? exists(
              db
                .select()
                .from(plants)
                .where(
                  and(
                    eq(plants.growId, grows.id),
                    inArray(plants.growthStage, ["harvested", "curing"]),
                  ),
                ),
            )
          : undefined,
    ),
  orderBy: (grows, { desc, asc }) =>
    sortBy === "newest"
      ? [desc(grows.createdAt)]
      : sortBy === "oldest"
        ? [asc(grows.createdAt)]
        : [desc(grows.createdAt)], // default
  limit: 24,
  offset: page * 24,
  with: {
    user: {
      columns: {
        username: true,
        displayName: true,
        avatar: true,
      },
    },
    plants: {
      columns: {
        id: true,
        growthStage: true,
      },
    },
    _count: {
      posts: true,
      likes: true,
    },
  },
});
```

### 2. API Response Optimization

- **Cursor-based Pagination:** Efficient for large datasets
- **Field Selection:** Only fetch required fields
- **Batch Loading:** Reduce N+1 query problems
- **Caching Strategy:** Redis cache for frequently accessed data

### 3. Frontend Performance

- **Virtual Scrolling:** For large lists (future enhancement)
- **Image Lazy Loading:** Optimize image loading in grids
- **Component Memoization:** Prevent unnecessary re-renders
- **Bundle Optimization:** Code splitting for exploration pages

### 4. Caching Strategy

```typescript
// Example caching configuration
const cacheConfig = {
  timelines: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  exploration: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  profiles: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 15 * 60 * 1000, // 15 minutes
  },
};
```

---

## Success Metrics

### 1. Engagement Metrics

- **Timeline Usage:** Daily active users on timeline pages
- **Exploration Usage:** Time spent on exploration pages
- **Follow Actions:** New follows generated per day
- **Content Interaction:** Likes, comments, shares per post

### 2. Performance Metrics

- **Page Load Times:** < 2 seconds for initial load
- **Infinite Scroll Performance:** < 500ms for new content
- **API Response Times:** < 200ms for timeline queries
- **Error Rates:** < 1% for all new endpoints

### 3. User Experience Metrics

- **Feature Adoption:** % of users using new features
- **Navigation Patterns:** User flow through different sections
- **Content Discovery:** Items viewed via exploration pages
- **User Retention:** Return visits after new feature use

### 4. Technical Metrics

- **Database Performance:** Query execution times
- **Memory Usage:** Client-side memory consumption
- **Bundle Size:** JavaScript bundle size impact
- **Cache Hit Rates:** Effectiveness of caching strategy

---

## Internationalization (i18n) Requirements

### 1. New Translation Keys Structure

```json
{
  "Timeline": {
    "tabs": {
      "all": "All Posts",
      "following": "Following"
    },
    "empty": {
      "all": "No posts yet. Be the first to share something!",
      "following": "No posts from followed users. Start following growers to see their updates!"
    },
    "loading": "Loading timeline...",
    "loadMore": "Load more posts"
  },
  "Exploration": {
    "grows": {
      "title": "Explore Grows",
      "filters": {
        "status": "Status",
        "type": "Type",
        "environment": "Environment",
        "lightType": "Light Type"
      },
      "sort": {
        "newest": "Newest",
        "oldest": "Oldest",
        "popular": "Most Popular",
        "comments": "Most Comments"
      }
    },
    "plants": {
      "title": "Explore Plants",
      "filters": {
        "stage": "Growth Stage",
        "strainType": "Strain Type",
        "environment": "Environment"
      }
    },
    "search": {
      "placeholder": "Search...",
      "noResults": "No results found for your search."
    }
  },
  "Profile": {
    "tabs": {
      "timeline": "Timeline",
      "grows": "Grows",
      "plants": "Plants",
      "photos": "Photos",
      "following": "Following",
      "followers": "Followers"
    },
    "stats": {
      "growsCount": "{count} Grows",
      "plantsCount": "{count} Plants",
      "followersCount": "{count} Followers",
      "followingCount": "{count} Following"
    }
  },
  "Activity": {
    "types": {
      "post": "posted an update",
      "comment": "commented on",
      "like": "liked",
      "follow": "started following",
      "harvest": "harvested",
      "phaseChange": "transitioned to {phase}"
    },
    "empty": "No recent activity"
  }
}
```

---

## Security and Privacy Considerations

### 1. Data Access Controls

- **Public Content:** Ensure only public entities are shown in exploration
- **Following Privacy:** Respect user privacy settings for follow lists
- **Activity Feeds:** Only show public activities
- **User Authentication:** Proper session validation for protected features

### 2. API Security

- **Rate Limiting:** Prevent abuse of exploration endpoints
- **Input Validation:** Sanitize all filter and search inputs
- **SQL Injection Prevention:** Use parameterized queries
- **Authorization Checks:** Verify user permissions for actions

### 3. Privacy Controls

- **Profile Visibility:** User controls for profile information
- **Activity Visibility:** Toggle for public activity sharing
- **Follow Privacy:** Option to hide follow lists
- **Content Privacy:** Respect entity privacy settings

---

## Future Enhancements

### 1. Advanced Features (Phase 3+)

- **Real-time Timeline Updates:** WebSocket implementation for live updates
- **Content Recommendations:** AI-powered content suggestion system
- **Advanced Search:** Full-text search with Elasticsearch
- **Social Features:** Direct messaging, groups, events

### 2. Performance Optimizations

- **Virtual Scrolling:** For very large lists
- **Progressive Web App:** Offline functionality
- **Image Optimization:** Advanced image compression and CDN
- **Service Workers:** Background sync and push notifications

### 3. Analytics and Insights

- **User Analytics Dashboard:** Personal usage statistics
- **Content Performance:** Post analytics for creators
- **Community Insights:** Platform-wide statistics
- **Trend Analysis:** Popular strains, techniques, etc.

---

## Conclusion

This PRD provides a comprehensive roadmap for implementing Activity Feeds/Timelines and Follow System features in GrowAGram. The phased approach ensures manageable development cycles while delivering value incrementally.

The implementation will transform GrowAGram from a basic content platform into a sophisticated social network for plant enthusiasts, with personalized experiences, powerful discovery tools, and engaging community features.

**Next Steps:**

1. Technical review and approval of API specifications
2. UI/UX design mockups for new components
3. Development environment setup and testing data preparation
4. Sprint planning and resource allocation for Phase 1 implementation

**Success Criteria:**

- Increased user engagement through personalized timelines
- Improved content discoverability via exploration pages
- Enhanced social interactions through follow system
- Performance benchmarks met for all new features
- Positive user feedback and adoption rates

---

_This document serves as the definitive guide for the Activity Feeds/Timelines and Follow System implementation. All stakeholders should review and approve before development begins._
