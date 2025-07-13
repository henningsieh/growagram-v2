---
applyTo: "**"
---

# ⚡ Performance & SEO Optimization

## SEO and Data Prefetching Strategy

**Critical decision point for search engine optimization and content discoverability.**

### Prefetch Strategy by Page Type

Choose the appropriate prefetching strategy based on the page's primary purpose:

| Page Type                   | Strategy         | Reasoning                                   |
| --------------------------- | ---------------- | ------------------------------------------- |
| **Content Discovery Pages** | `await` prefetch | Crawlers need actual content for indexing   |
| **Landing/Marketing Pages** | `void` prefetch  | Fast load times more important than content |
| **User Dashboards/Private** | `void` prefetch  | SEO irrelevant, UX prioritized              |

### Content Discovery Pages (Use `await`)

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

### Landing/Marketing Pages (Use `void`)

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

### User Dashboards/Private Content (Use `void`)

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

### SEO Impact Analysis

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

### Implementation Guidelines

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

### Error Handling Strategy

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

## Performance Guidelines

### Code Splitting

- Use dynamic imports for large components
- Implement proper loading states
- Optimize bundle size

### Image Optimization

- Use Next.js Image component
- Implement proper aspect ratios
- Handle EXIF data extraction for uploads
