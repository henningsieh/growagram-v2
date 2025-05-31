---
applyTo: "**"
---

# GrowAGram Coding Guidelines & Standards

## Project Overview

GrowAGram is a modern social platform for plant enthusiasts built with Next.js 15, React 19, TypeScript, and tRPC. Follow these guidelines to maintain code quality and consistency.

## Core Technologies & Architecture

- **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: tRPC, Auth.js (NextAuth), PostgreSQL with Drizzle ORM
- **Storage**: Self-hosted MinIO (S3-compatible) on Hetzner Cloud
- **Internationalization**: next-intl for i18n support
- **State Management**: @tanstack/react-query
- **URL State Management**: nuqs for query parameters
- **Animation**: framer-motion
- **Deployment**: Docker with Coolify CI/CD

## Package Management & Development

### Package Manager

**Use Bun instead of npm for all package management and script execution.**

- **Package Manager**: Bun (creates `bun.lock` instead of `package-lock.json`)
- **Script Execution**: Use `bunx` instead of `npx` for executable scripts
- **Installation**: Use `bun install` instead of `npm install`
- **Adding Dependencies**: Use `bun add <package>` instead of `npm install <package>`

### Available Scripts

The project includes the following predefined scripts (run with `bun run <script>`):

#### Development Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run predev` - Run database generation and migration before dev (automatic)

#### Build & Production Scripts

- `bun run build` - Build the production application
- `bun run prebuild` - Run database generation and migration before build (automatic)
- `bun run start` - Start the production server

#### Database Scripts

- `bun run db:generate` - Generate Drizzle schema files
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio in the browser for database management

#### Code Quality Scripts

- `bun run lint` - Run Next.js linter
- `bun run format` - Format code with Prettier

#### Type Checking

- `bunx tsc --noEmit` - Run TypeScript type checking without compilation (fast alternative to full build)

### Development Workflow

```bash
# Start development
bun run dev

# Type checking during development
bunx tsc --noEmit

# Database operations
bun run db:generate
bun run db:migrate

# Code formatting
bun run format
```

## File Structure & Organization

### Directory Structure

```
src/
├── app/[locale]/          # App Router with i18n
├── components/
│   ├── atom/             # Atomic components (error-boundary, loading, etc.)
│   ├── features/         # Feature-specific components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── i18n/             # Internationalization utilities
│   ├── sidebar/          # Sidebar configuration and logic
│   ├── steady/           # SteadyHQ integration
│   └── utils/            # Utility functions
├── types/                # TypeScript type definitions
└── env.js               # Environment validation
```

### Naming Conventions

- **Files**: Use kebab-case for file names (`feature-section.tsx`, `error-boundary.tsx`)
- **Components**: Use PascalCase for component names
- **Functions**: Use camelCase for function names
- **Types/Interfaces**: Use PascalCase with descriptive names

## React & Next.js Guidelines

### Component Structure

```typescript
"use client"; // Only when needed for client components

import * as React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { VariantProps } from "class-variance-authority";
import { ClockIcon, Flower2Icon, TentTree } from "lucide-react";
import { modulePaths } from "~/assets/constants";
import { Button, buttonVariants } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Link, usePathname } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";

interface ComponentProps {
  // Define props with proper TypeScript types
}

export default function ComponentName({ prop }: ComponentProps) {
  const t = useTranslations("NamespaceKey");

  return (
    <div className="semantic-class-names">
      {/* JSX content */}
    </div>
  );
}

// Export additional components/utilities if needed
function HelperComponent() {
  // Helper component logic
}
```

### Client Components

- Use `"use client";` directive only when necessary
- Prefer server components by default
- Use client components for:
  - Event handlers
  - State management
  - Browser APIs
  - Animations with framer-motion

### Loading States

- Implement proper loading states using Skeleton components
- Use consistent loading patterns across the application
- Example from `loading.tsx`:

```typescript
<div className="aspect-square h-14 w-14 flex-shrink-0">
  <Skeleton className="h-full w-full rounded-full" />
</div>
```

## TypeScript Guidelines

### Type Definitions

- Define interfaces for component props
- Use proper type imports: `import type React from "react"`
- Create reusable types in the `types/` directory
- Use strict TypeScript configuration

### Single Source of Truth for Types

**All type definitions must have a single source of truth to avoid duplication and ensure consistency across the codebase.**

#### Zod Schema and Type Definitions

- **Primary Location:** All Zod schemas are defined in `src/types/zodSchema.ts`
- **Type Extraction:** Use `z.infer<typeof schema>` to extract TypeScript types from Zod schemas
- **Enum Definitions:** Define enums in `src/types/` directory and reuse in Zod schemas

```typescript
// ✅ CORRECT: Define enum once in types
// src/types/plant.ts
export const PlantGrowthStages = [
  { name: "planted", color: "planted" },
  { name: "seedling", color: "seedling" },
  { name: "vegetation", color: "vegetation" },
  { name: "flowering", color: "flowering" },
  { name: "harvested", color: "harvested" },
  { name: "curing", color: "curing" },
];

// src/types/zodSchema.ts
import { PlantGrowthStages } from "~/types/plant";

export const plantGrowthStageFilterSchema = z.object({
  growthStage: z.enum(PlantGrowthStages.map(stage => stage.name)).optional(),
});

// tRPC router
import { plantGrowthStageFilterSchema } from "~/types/zodSchema";

export const plantRouter = createTRPCRouter({
  explore: publicProcedure
    .input(plantGrowthStageFilterSchema.extend({
      // ... other fields
    }))
    .query(async ({ input }) => {
      // Use the validated input
    }),
});
```

```typescript
// ❌ WRONG: Duplicating enum definitions
// router.ts - DON'T DO THIS
.input(z.object({
  growthStage: z.enum(["seedling", "vegetation", "flowering", "harvested", "curing"])
}))

// component.tsx - DON'T DO THIS
type GrowthStage = "seedling" | "vegetation" | "flowering" | "harvested" | "curing";
```

#### Best Practices for Type Consistency

1. **Enum Definitions:** Create TypeScript enums in `src/types/` for all categorical data
2. **Zod Schema Reuse:** Reference enums using `z.nativeEnum()` in Zod schemas
3. **Type Inference:** Use `z.infer<typeof schema>` instead of manually creating matching types
4. **Import Consistency:** Always import from the single source, never redefine

```typescript
// src/types/zodSchema.ts
import { CultureMedium, FertilizerType, GrowEnvironment } from "./grow";

// Example: Grow entity types
// src/types/grow.ts
export enum GrowEnvironment {
  INDOOR = "indoor",
  OUTDOOR = "outdoor",
  GREENHOUSE = "greenhouse",
}

export enum CultureMedium {
  SOIL = "soil",
  COCOS = "cocos",
  HYDROPONIC = "hydroponic",
  OTHER = "other",
}

export enum FertilizerType {
  MINERAL = "mineral",
  ORGANIC = "organic",
  MIXED = "mixed",
}

export const growFilterSchema = z.object({
  environment: z.nativeEnum(GrowEnvironment).optional(),
  cultureMedium: z.nativeEnum(CultureMedium).optional(),
  fertilizerType: z.nativeEnum(FertilizerType).optional(),
});

// Extract TypeScript type
export type GrowFilterInput = z.infer<typeof growFilterSchema>;
```

#### Frontend Component Type Usage

```typescript
// ✅ CORRECT: Use enum from single source
import { PlantGrowthStages } from "~/types/plant";
// ✅ CORRECT: Use Zod-inferred types
import type { GrowFilterInput } from "~/types/zodSchema";

interface FilterProps {
  selectedStage: (typeof PlantGrowthStages)[number];
  onStageChange: (stage: (typeof PlantGrowthStages)[number]) => void;
}

interface ExploreGrowsProps {
  filters: GrowFilterInput;
}
```

#### Database Schema Consistency

- Ensure database enum values match TypeScript enum values
- Use the same enum definitions for both frontend validation and database constraints
- Reference the single source of truth in migration files

```typescript
// drizzle schema
import { GrowEnvironment } from "~/types/grow";

export const grows = pgTable("grows", {
  environment: varchar("environment").$type<GrowEnvironment>(),
  // ...
});
```

## Styling Guidelines

### Tailwind CSS Best Practices

- Use semantic class combinations
- Prefer responsive design patterns: `xs:gap-3 sm:gap-4 md:gap-6`
- Use consistent spacing scale
- Implement proper aspect ratios: `aspect-square`

### Component Styling

```typescript
// Use conditional classes properly
className={`text-${color}/70 hover:text-${color} text-xs`}

// Responsive breakpoints
className="xs:h-16 xs:w-16 h-14 w-14 sm:h-24 sm:w-24"
```

### CSS Custom Properties

- Maintain Tailwind's design system
- Use CSS variables for theming
- Follow shadcn/ui patterns for component styling

## Internationalization (i18n)

### Translation File Structure

```
messages/
├── en.json              # English (default/fallback language)
├── de.json              # German
├── es.json              # Spanish
├── fr.json              # French
└── [locale].json        # Additional locales as needed
```

### Translation File Organization

Each translation file should follow a consistent nested structure:

```json
{
  "Common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit"
    },
    "navigation": {
      "home": "Home",
      "profile": "Profile",
      "settings": "Settings"
    }
  },
  "Pages": {
    "HomePage": {
      "title": "Welcome to GrowAGram",
      "subtitle": "Connect with plant enthusiasts worldwide"
    },
    "ProfilePage": {
      "title": "Your Profile",
      "tabs": {
        "posts": "Posts",
        "followers": "Followers",
        "following": "Following"
      }
    }
  },
  "Components": {
    "FeaturesSection": {
      "title": "Features",
      "cards": {
        "growDiary": {
          "title": "Grow Diary",
          "description": "Track your plant's journey"
        }
      }
    },
    "ErrorBoundary": {
      "title": "Something went wrong",
      "message": "Please try refreshing the page"
    }
  },
  "Forms": {
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email",
      "minLength": "Must be at least {min} characters"
    }
  }
}
```

### Translation Usage

```typescript
const t = useTranslations("NamespaceKey");

// Basic usage
{t("Pages.HomePage.title")}

// With interpolation
{t("Forms.validation.minLength", { min: 8 })}

// Rich text with components
{t.rich("Pages.Welcome.description", {
  strong: (chunks) => <strong>{chunks}</strong>
})}
```

### Translation Key Naming Conventions

- **Hierarchy**: Use dot notation for nested keys
- **Consistency**: Follow `Category.Component.Element.Property` pattern
- **Descriptive**: Use clear, descriptive names
- **Pluralization**: Use `_one`, `_other` suffixes for plural forms

```json
{
  "Posts": {
    "count_one": "1 post",
    "count_other": "{count} posts"
  }
}
```

### Adding New Translations

1. **Add to English first** (`messages/en.json`) as the source of truth
2. **Maintain consistent structure** across all locale files
3. **Use descriptive keys** that reflect the content purpose
4. **Group related translations** under logical namespaces
5. **Keep translations concise** but descriptive

### Translation File Maintenance

- **Sync across locales**: Ensure all locale files have the same key structure
- **Use default values**: English acts as fallback for missing translations
- **Regular audits**: Remove unused translation keys
- **Professional translation**: Consider professional translation services for production locales

### Dynamic Translation Loading

```typescript
// For large applications, consider dynamic imports
const messages = await import(`~/messages/${locale}.json`);
```

### Translation Validation

- Validate that all locale files have consistent key structures
- Use TypeScript for type-safe translation keys
- Implement lint rules for missing or unused translations

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

### SEO and Data Prefetching Strategy

**Critical decision point for search engine optimization and content discoverability.**

#### Prefetch Strategy by Page Type

Choose the appropriate prefetching strategy based on the page's primary purpose:

| Page Type                   | Strategy         | Reasoning                                   |
| --------------------------- | ---------------- | ------------------------------------------- |
| **Content Discovery Pages** | `await` prefetch | Crawlers need actual content for indexing   |
| **Landing/Marketing Pages** | `void` prefetch  | Fast load times more important than content |
| **User Dashboards/Private** | `void` prefetch  | SEO irrelevant, UX prioritized              |

#### Content Discovery Pages (Use `await`)

**When to use:** Pages where search engines need to index the actual content.

```typescript
// ✅ CORRECT: Content discovery pages - await for SEO
export default async function ExploreGrowsPage({ searchParams }: PageProps) {
  const queryClient = getQueryClient();

  // Parse filters from URL
  const filters = parseFiltersFromSearchParams(await searchParams);

  // AWAIT prefetch - ensures content is in HTML for crawlers
  await queryClient.prefetchInfiniteQuery(
    trpc.grows.explore.infiniteQueryOptions(filters, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExploreGrowsClient />
    </HydrationBoundary>
  );
}
```

**Benefits:**

- ✅ Search engines index actual content
- ✅ Social media previews show real data
- ✅ Accessibility - screen readers get content immediately
- ✅ Better for content-heavy pages (blogs, product listings, etc.)

**Trade-offs:**

- ❌ Slower initial page load (blocked by API response time)
- ❌ Risk of timeout if API is slow

#### Landing/Marketing Pages (Use `void`)

**When to use:** Pages focused on fast loading and user conversion.

```typescript
// ✅ CORRECT: Marketing pages - void for speed
export default async function LandingPage() {
  const queryClient = getQueryClient();

  // VOID prefetch - start loading but don't block page render
  void queryClient.prefetchQuery(
    trpc.testimonials.getLatest.queryOptions({ limit: 3 }),
  );

  return (
    <div>
      <HeroSection />
      <React.Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsSection />
      </React.Suspense>
    </div>
  );
}
```

**Benefits:**

- ✅ Fastest possible page load
- ✅ Better Core Web Vitals scores
- ✅ Improved user experience
- ✅ Lower bounce rates

#### User Dashboards/Private Content (Use `void`)

**When to use:** Authenticated pages where SEO is not relevant.

```typescript
// ✅ CORRECT: Private dashboards - void for UX
export default async function UserDashboard() {
  const queryClient = getQueryClient();

  // VOID prefetch - SEO doesn't matter for private content
  void queryClient.prefetchInfiniteQuery(
    trpc.user.timeline.infiniteQueryOptions(),
  );

  return (
    <ProtectedRoute>
      <React.Suspense fallback={<DashboardSkeleton />}>
        <UserTimelineClient />
      </React.Suspense>
    </ProtectedRoute>
  );
}
```

#### SEO Impact Analysis

**`await` prefetch (Content Discovery):**

```html
<!-- What crawlers see in HTML -->
<div>
  <h2>Amazing Cannabis Grow - Week 8 Flowering</h2>
  <img src="grow-image.jpg" alt="Cannabis plant in flowering stage" />
  <p>This grow is using LED lights with organic nutrients...</p>
</div>
```

**`void` prefetch (Fast Loading):**

```html
<!-- What crawlers see in HTML -->
<div>
  <div class="skeleton-loader"></div>
  <!-- No actual content for indexing -->
</div>
```

#### Implementation Guidelines

1. **Content Discovery Pages Examples:**

   - `/explore/grows` - Public grow listings
   - `/search` - Search results pages
   - `/categories/[category]` - Category pages
   - `/users/[username]/public` - Public user profiles

2. **Landing/Marketing Pages Examples:**

   - `/` - Homepage
   - `/pricing` - Pricing page
   - `/about` - About page
   - `/features` - Features showcase

3. **Private/Dashboard Pages Examples:**
   - `/dashboard` - User dashboard
   - `/settings` - User settings
   - `/grows/my-grows` - Private grows list
   - `/messages` - Private messaging

#### Error Handling Strategy

Combine prefetch strategy with proper error boundaries:

```typescript
// For await prefetch - handle server errors gracefully
export default async function ContentPage() {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchInfiniteQuery(/* ... */);
  } catch (error) {
    // Log error but don't break the page
    console.error('Prefetch failed:', error);
  }

  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ContentClient />
      </HydrationBoundary>
    </ErrorBoundary>
  );
}
```

### Environment Variables

- Validate environment variables in `env.js`
- Use proper typing for environment configuration
- Include both client and server environment variables

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

## Testing & Documentation

### Documentation Standards

**For this private hobby project, focus on excellent documentation rather than unit tests.**

#### Code Documentation

- Write comprehensive JSDoc comments for all public functions and components
- Document complex business logic and calculations
- Include usage examples in component documentation
- Maintain up-to-date README files for major features

````typescript
/**
 * Calculates the grow status based on associated plants' growth stages.
 *
 * @description This function determines if a grow is "Growing" or "Harvested"
 * by examining the growth stages of all associated plants. A grow is considered
 * "Growing" if any plant is in active growth stages (Planted, Seedling,
 * vegetation, Flowering). Otherwise, it's "Harvested".
 *
 * @param plants - Array of plants associated with the grow
 * @returns "Growing" | "Harvested"
 *
 * @example
 * ```typescript
 * const plants = [
 *   { growthStage: PlantGrowthStage.FLOWERING },
 *   { growthStage: PlantGrowthStage.HARVESTED }
 * ];
 * const status = calculateGrowStatus(plants); // Returns "Growing"
 * ```
 */
export function calculateGrowStatus(plants: Plant[]): GrowStatus {
  // Implementation...
}
````

#### API Documentation

- Document all tRPC procedures with input/output types
- Include usage examples and common patterns
- Document filtering and pagination behavior

#### Component Documentation

- Document component props and usage patterns
- Include Storybook stories for complex components
- Document responsive behavior and accessibility features

### No Unit Testing Required

- Focus development time on features and user experience
- Rely on TypeScript for type safety
- Use comprehensive manual testing during development
- Prioritize good documentation over test coverage

## Error Handling

### Error Boundaries

```typescript
// Implement comprehensive error boundaries
<ErrorBoundary>
  <Component />
</ErrorBoundary>

// Include error details for debugging
{error.stack && `\n\nStack Trace:\n${error.stack}`}
```

### Error States

- Provide meaningful error messages
- Include error codes and HTTP status when available
- Implement proper fallback UI

## Performance Guidelines

### Code Splitting

- Use dynamic imports for large components
- Implement proper loading states
- Optimize bundle size

### Image Optimization

- Use Next.js Image component
- Implement proper aspect ratios
- Handle EXIF data extraction for uploads

## Security Guidelines

### Authentication

- Use Auth.js (NextAuth) for authentication
- Implement proper session management
- Handle user permissions and roles

### Data Validation

- Validate environment variables
- Sanitize user inputs
- Use proper TypeScript types for API endpoints

## Testing Guidelines (Future Implementation)

- Target ≥80% unit test coverage
- Test component functionality
- Test API endpoints
- Implement integration tests

## Git & Development Workflow

### Commit Messages

- Use conventional commit format
- Be descriptive and specific
- Reference issues when applicable

### Code Review

- Ensure TypeScript compilation
- Check responsive design
- Verify accessibility standards
- Test internationalization

## Third-Party Integrations

### SteadyHQ Integration

- Follow API documentation patterns
- Implement proper OAuth flow
- Handle subscription states properly

### Storage (MinIO)

- Use S3-compatible API patterns
- Implement proper file upload handling
- Handle image optimization

## Animation Guidelines

### Framer Motion

```typescript
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};
```

### Animation Principles

- Use subtle animations for better UX
- Implement consistent motion patterns
- Provide reduced motion alternatives

## Documentation

### Code Comments

- Document complex business logic
- Explain API integrations
- Include examples for utility functions

### README Maintenance

- Keep project status updated
- Document new features
- Maintain deployment instructions

## Future Considerations

### Roadmap Alignment

- Phase 1: Core Platform (85% Complete)
- Phase 2: Social Features
- Phase 3: Advanced Features & Monetization

### Technical Debt

- Maintain clean architecture
- Refactor when necessary
- Plan for scalability

Remember: This is an active development project in Phase 1 of 3. Prioritize clean, maintainable code that supports the growing feature set and user base.

Important: never hallucinate about things, you don'T know, Feel free to ask me at any time to prevent false conclusions on your side!
