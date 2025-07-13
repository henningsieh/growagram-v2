---
applyTo: "**"
title: "Performance & SEO Optimization"
description: "Core Web Vitals, performance optimization techniques, and SEO strategies"
tags: [performance, seo, optimization, web-vitals, next-js]
last_updated: 2025-01-07
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

### Core Web Vitals Optimization

#### Largest Contentful Paint (LCP) - Target: < 2.5s

```typescript
// ✅ CORRECT: Optimize LCP with priority loading
import { Suspense } from 'react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <div className="relative h-screen">
      {/* Priority load hero image for faster LCP */}
      <Image
        src="/hero-image.jpg"
        alt="GrowAGram Hero"
        fill
        priority // Critical for LCP
        className="object-cover"
        sizes="100vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..." // Prevent layout shift
      />

      {/* Fallback for slow loading */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroContent />
      </Suspense>
    </div>
  );
}

// Preload critical resources
export function PreloadCriticalResources() {
  return (
    <head>
      <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="" />
      <link rel="preload" href="/api/grows/featured" as="fetch" crossOrigin="" />
    </head>
  );
}
```

#### First Input Delay (FID) / Interaction to Next Paint (INP) - Target: < 200ms

```typescript
// ✅ CORRECT: Optimize INP with efficient event handlers
import { useCallback, useMemo, startTransition } from 'react';
import { useDeferredValue } from 'react';

export function SearchComponent() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query); // Defer expensive updates

  // Memoize expensive operations
  const searchResults = useMemo(() => {
    return expensiveSearchFunction(deferredQuery);
  }, [deferredQuery]);

  // Use useCallback for event handlers to prevent re-renders
  const handleSearch = useCallback((value: string) => {
    // Use startTransition for non-urgent updates
    startTransition(() => {
      setQuery(value);
    });
  }, []);

  return (
    <div>
      <Input
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search grows..."
      />

      {/* Virtualize large lists for better performance */}
      <VirtualizedList items={searchResults} />
    </div>
  );
}
```

#### Cumulative Layout Shift (CLS) - Target: < 0.1

```typescript
// ✅ CORRECT: Prevent layout shifts with proper sizing
export function GrowCard({ grow }: { grow: GrowType }) {
  return (
    <div className="space-y-4">
      {/* Always reserve space for images */}
      <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
        {grow.headerImage ? (
          <Image
            src={grow.headerImage.publicUrl}
            alt={grow.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <PlantIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Reserve space for dynamic content */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg leading-tight min-h-[2.5rem]">
          {grow.name}
        </h3>

        {/* Use skeleton to maintain layout during loading */}
        <Suspense fallback={<Skeleton className="h-4 w-24" />}>
          <GrowStats growId={grow.id} />
        </Suspense>
      </div>
    </div>
  );
}
```

### Code Splitting & Bundle Optimization

```typescript
// ✅ CORRECT: Strategic code splitting
import dynamic from 'next/dynamic';
import { lazy, Suspense } from 'react';

// Lazy load heavy components that aren't immediately visible
const GrowAnalytics = dynamic(() => import('~/components/features/GrowAnalytics'), {
  loading: () => <AnalyticsSkeleton />,
  ssr: false, // Skip SSR for client-only components
});

const ImageGallery = lazy(() => import('~/components/features/ImageGallery'));

// Split by routes
const AdminPanel = dynamic(() => import('~/components/admin/AdminPanel'), {
  loading: () => <AdminSkeleton />,
});

export function GrowDetailPage({ grow }: { grow: GrowType }) {
  return (
    <div>
      {/* Critical content loads first */}
      <GrowHeader grow={grow} />
      <GrowDescription grow={grow} />

      {/* Non-critical content loads later */}
      <Suspense fallback={<GallerySkeleton />}>
        <ImageGallery images={grow.images} />
      </Suspense>

      {/* Admin features only for admin users */}
      {isAdmin && (
        <Suspense fallback={<AdminSkeleton />}>
          <AdminPanel />
        </Suspense>
      )}

      {/* Analytics load last (not immediately visible) */}
      <GrowAnalytics growId={grow.id} />
    </div>
  );
}
```

### Image Optimization Strategies

```typescript
// ✅ CORRECT: Comprehensive image optimization
export function OptimizedImage({
  src,
  alt,
  priority = false,
  ...props
}: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      priority={priority}
      quality={85} // Balance between quality and file size
      placeholder="blur"
      blurDataURL={generateBlurDataURL()} // Generate programmatically
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      {...props}
    />
  );
}

// Progressive image loading for galleries
export function ImageGallery({ images }: { images: ImageType[] }) {
  const [loadedImages, setLoadedImages] = useState(new Set());

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={image.id} className="aspect-square relative">
          <OptimizedImage
            src={image.publicUrl}
            alt={image.alt || "Gallery image"}
            fill
            priority={index < 6} // Prioritize first 6 images
            onLoad={() => setLoadedImages(prev => new Set(prev).add(image.id))}
            className={cn(
              "object-cover transition-opacity duration-300",
              loadedImages.has(image.id) ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      ))}
    </div>
  );
}
```

### Performance Monitoring

```typescript
// ✅ CORRECT: Real User Monitoring (RUM)
export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }, []);

  return null;
}

// Performance API usage
export function usePerformanceMetrics() {
  useEffect(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      // Measure component render time
      performance.mark("component-start");

      return () => {
        performance.mark("component-end");
        performance.measure(
          "component-render",
          "component-start",
          "component-end",
        );

        const measure = performance.getEntriesByName("component-render")[0];
        if (measure) {
          console.log(`Component render time: ${measure.duration}ms`);
        }
      };
    }
  }, []);
}
```

### Bundle Analysis and Optimization

```typescript
// Package usage optimization
// ✅ CORRECT: Tree-shakeable imports
import { format } from "date-fns";
// ❌ WRONG: Full package imports
import * as dateFns from "date-fns";
import { ChevronDown } from "lucide-react";
import * as LucideIcons from "lucide-react";

// next.config.js - Bundle analysis setup
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // Optimize imports
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
    "@radix-ui/react-icons": {
      transform: "@radix-ui/react-icons/dist/{{member}}.js",
    },
  },

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
});
```

### Code Splitting

- Use dynamic imports for large components
- Implement proper loading states
- Optimize bundle size

### Image Optimization

- Use Next.js Image component
- Implement proper aspect ratios
- Handle EXIF data extraction for uploads

## Core Web Vitals Optimization

### Largest Contentful Paint (LCP) - Target: <2.5s

#### Image Optimization for LCP

```typescript
import Image from "next/image";

// ✅ CORRECT: Optimized hero image
export function HeroSection() {
  return (
    <div className="relative">
      <Image
        src="/hero-image.jpg"
        alt="GrowAGram community"
        width={1920}
        height={1080}
        priority // Critical for LCP
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="w-full h-auto"
      />
    </div>
  );
}

// ✅ CORRECT: Responsive image with proper loading
export function PostImage({ src, alt, priority = false }: ImageProps) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover transition-transform hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
```

#### Font Optimization for LCP

```typescript
// next.config.ts
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  optimizeFonts: true,
  // Preload critical fonts
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
```

```css
/* styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Preload critical fonts */
@font-face {
  font-family: 'Inter';
  font-weight: 400;
  src: local('Inter Regular'), url('/fonts/inter-regular.woff2') format('woff2');
  font-display: swap;
}
```

### Cumulative Layout Shift (CLS) - Target: <0.1

#### Skeleton Loading Patterns

```typescript
// ✅ CORRECT: Skeleton with exact dimensions
export function PostSkeleton() {
  return (
    <div className="space-y-4">
      {/* User info skeleton */}
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      
      {/* Image skeleton with exact aspect ratio */}
      <Skeleton className="aspect-square w-full rounded-lg" />
      
      {/* Content skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Action buttons skeleton */}
      <div className="flex space-x-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-14" />
      </div>
    </div>
  );
}

// ✅ CORRECT: Grid layout with consistent spacing
export function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-sm">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}
```

#### Avoiding Layout Shifts

```typescript
// ✅ CORRECT: Reserve space for dynamic content
export function DynamicContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      {!isLoaded ? (
        <div className="w-full max-w-md">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ) : (
        <div className="w-full max-w-md">
          <ActualContent />
        </div>
      )}
    </div>
  );
}

// ✅ CORRECT: Image with known dimensions
export function ProfileImage({ user }: { user: User }) {
  return (
    <div className="relative h-24 w-24 rounded-full overflow-hidden">
      <Image
        src={user.image ?? "/default-avatar.png"}
        alt={user.name}
        fill
        className="object-cover"
        sizes="96px"
      />
    </div>
  );
}
```

### First Input Delay (FID) - Target: <100ms

#### Optimizing JavaScript Execution

```typescript
// ✅ CORRECT: Debounced search input
import { useDebouncedCallback } from "use-debounce";

export function SearchInput() {
  const [query, setQuery] = useState("");
  const { mutate: search } = api.search.plants.useMutation();
  
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      if (value.length > 2) {
        search({ query: value });
      }
    },
    300 // 300ms delay
  );
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
      }}
      placeholder="Search plants..."
      className="w-full rounded-lg border px-4 py-2"
    />
  );
}

// ✅ CORRECT: Optimized infinite scroll
export function InfinitePostList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.posts.getInfinite.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  // Throttled scroll handler
  const handleScroll = useCallback(
    throttle(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    }, 100),
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  
  return (
    <div className="space-y-6">
      {data?.pages.map((page) =>
        page.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
      {isFetchingNextPage && <PostSkeleton />}
    </div>
  );
}
```

#### Code Splitting for Better Performance

```typescript
// ✅ CORRECT: Dynamic imports for heavy components
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(() => import("./VideoPlayer"), {
  loading: () => <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />,
  ssr: false,
});

const GrowAnalytics = dynamic(() => import("./GrowAnalytics"), {
  loading: () => <AnalyticsSkeleton />,
});

// ✅ CORRECT: Lazy loading for admin features
const AdminPanel = dynamic(() => import("./AdminPanel"), {
  loading: () => <div>Loading admin panel...</div>,
  ssr: false,
});

export function GrowDetailsPage({ grow }: { grow: Grow }) {
  const { data: user } = api.user.getCurrent.useQuery();
  const isAdmin = user?.role === "admin";
  
  return (
    <div className="space-y-6">
      <GrowHeader grow={grow} />
      <GrowContent grow={grow} />
      
      {/* Analytics loaded only when needed */}
      <React.Suspense fallback={<AnalyticsSkeleton />}>
        <GrowAnalytics growId={grow.id} />
      </React.Suspense>
      
      {/* Admin panel loaded only for admins */}
      {isAdmin && (
        <React.Suspense fallback={<div>Loading admin tools...</div>}>
          <AdminPanel growId={grow.id} />
        </React.Suspense>
      )}
    </div>
  );
}
```

### Performance Monitoring

#### Web Vitals Measurement

```typescript
// lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log(metric);
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

// pages/_app.tsx
import { reportWebVitals } from "~/lib/web-vitals";

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    reportWebVitals();
  }, []);
  
  return <Component {...pageProps} />;
}
```

#### Performance Budgets

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    bundlePagesRouterDependencies: true,
  },
  
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
```

### Resource Optimization

#### Prefetching Strategies

```typescript
// ✅ CORRECT: Smart prefetching based on user behavior
export function PostCard({ post }: { post: Post }) {
  const prefetchUserProfile = api.user.getProfile.usePrefetch();
  const prefetchGrowDetails = api.grows.getById.usePrefetch();
  
  return (
    <div
      className="post-card"
      onMouseEnter={() => {
        // Prefetch on hover for likely navigation
        prefetchUserProfile({ username: post.user.username });
        if (post.growId) {
          prefetchGrowDetails({ id: post.growId });
        }
      }}
    >
      <PostContent post={post} />
    </div>
  );
}

// ✅ CORRECT: Intersection Observer for lazy loading
export function LazyImage({ src, alt, ...props }: ImageProps) {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className="aspect-square bg-gray-100">
      {isInView ? (
        <Image src={src} alt={alt} fill className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

---

## Related Resources

- **[React & Next.js Guidelines](./react-nextjs.instructions.md)** - Component optimization and loading strategies
- **[Technology Stack](./tech-stack.instructions.md)** - Build configuration and optimization setup
- **[Database & tRPC](./database-trpc.instructions.md)** - API optimization and caching strategies
- **[Styling & i18n](./styling-i18n.instructions.md)** - CSS optimization and responsive images
- **[Database Performance](./database-performance.instructions.md)** - Backend performance and query optimization
