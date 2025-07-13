---
applyTo: "**"
title: "Security, Testing & Documentation"
description: "Authentication patterns, security practices, error handling, and testing guidelines"
tags: [security, testing, authentication, documentation, error-handling]
last_updated: 2025-01-07
---

# 🔒 Security, Testing & Documentation

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

## Security Guidelines

### Authentication

- Use Auth.js (NextAuth) for authentication
- Implement proper session management
- Handle user permissions and roles

#### Authentication Patterns

```typescript
// ✅ CORRECT: Protected tRPC procedure
export const growRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createGrowSchema)
    .mutation(async ({ input, ctx }) => {
      // ctx.session.user is guaranteed to exist
      const grow = await ctx.db.insert(grows).values({
        ...input,
        userId: ctx.session.user.id,
      }).returning();
      
      return grow[0];
    }),

  // ✅ CORRECT: Owner-only access
  update: protectedProcedure
    .input(updateGrowSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      
      // Verify ownership
      const existingGrow = await ctx.db.query.grows.findFirst({
        where: eq(grows.id, id),
        columns: { userId: true },
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
      
      const updatedGrow = await ctx.db.update(grows)
        .set(updates)
        .where(eq(grows.id, id))
        .returning();
      
      return updatedGrow[0];
    }),
});
```

#### Session Management

```typescript
// ✅ CORRECT: Session checking in components
export function CreateGrowButton() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <Button disabled>Loading...</Button>;
  }
  
  if (!session) {
    return (
      <Button onClick={() => signIn()}>
        Sign in to create grows
      </Button>
    );
  }
  
  return (
    <Button onClick={() => router.push("/grows/new")}>
      Create New Grow
    </Button>
  );
}

// ✅ CORRECT: Protected page component
export default function ProtectedPage() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return (
      <div className="text-center">
        <h1>Access Denied</h1>
        <p>You need to be signed in to view this page.</p>
        <Button onClick={() => signIn()}>Sign In</Button>
      </div>
    );
  }
  
  return <ProtectedContent />;
}
```

#### Role-Based Access Control

```typescript
// ✅ CORRECT: Role-based procedure
export const adminRouter = createTRPCRouter({
  getUsers: protectedProcedure
    .query(async ({ ctx }) => {
      // Check admin role
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }
      
      return await ctx.db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
      });
    }),
    
  banUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Check admin role
      if (ctx.session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }
      
      await ctx.db.update(users)
        .set({ 
          banned: true, 
          bannedAt: new Date(),
          bannedBy: ctx.session.user.id,
        })
        .where(eq(users.id, input.userId));
      
      return { success: true };
    }),
});

// ✅ CORRECT: Role-based component
export function AdminPanel() {
  const { data: session } = useSession();
  
  if (session?.user.role !== "admin") {
    return null; // Don't render anything for non-admins
  }
  
  return (
    <div className="border border-red-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-red-800">Admin Panel</h3>
      <AdminActions />
    </div>
  );
}
```

### Data Validation

- Validate environment variables
- Sanitize user inputs
- Use proper TypeScript types for API endpoints

#### Input Validation and Sanitization

```typescript
// ✅ CORRECT: Comprehensive input validation
export const postSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title is too long")
    .refine(
      (title) => !title.includes('<') && !title.includes('>'),
      "Title cannot contain HTML tags"
    ),
  content: z.string()
    .min(1, "Content is required")
    .max(5000, "Content is too long")
    .transform((content) => {
      // Sanitize HTML content
      return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }),
  tags: z.array(z.string().regex(/^[a-zA-Z0-9_-]+$/))
    .max(10, "Maximum 10 tags allowed")
    .optional(),
  isPublic: z.boolean().default(true),
});

// ✅ CORRECT: File upload validation
export const imageUploadSchema = z.object({
  file: z.custom<File>()
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    )
    .refine(
      (file) => file.name.length <= 255,
      "Filename is too long"
    ),
});

// ✅ CORRECT: Environment variable validation
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32, "NextAuth secret must be at least 32 characters"),
    NEXTAUTH_URL: z.string().url(),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

#### API Rate Limiting

```typescript
// ✅ CORRECT: Rate limiting middleware
import { TRPCError } from "@trpc/server";
import { rateLimit } from "~/lib/rate-limit";

export const rateLimitedProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const identifier = ctx.session.user.id;
    const { success } = await rateLimit.limit(identifier);
    
    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded. Please try again later.",
      });
    }
    
    return next();
  }
);

// Usage in router
export const postRouter = createTRPCRouter({
  create: rateLimitedProcedure
    .input(postSchema)
    .mutation(async ({ input, ctx }) => {
      // Create post logic
    }),
});
```

#### SQL Injection Prevention

```typescript
// ✅ CORRECT: Always use Drizzle ORM - never raw SQL
export const searchRouter = createTRPCRouter({
  posts: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input, ctx }) => {
      // ✅ CORRECT: Parameterized query with Drizzle
      const posts = await ctx.db.query.posts.findMany({
        where: (posts, { ilike }) => ilike(posts.title, `%${input.query}%`),
        limit: input.limit,
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });
      
      return posts;
    }),
});

// ❌ WRONG: Raw SQL is vulnerable to injection
// Never do this:
// const posts = await ctx.db.execute(
//   sql`SELECT * FROM posts WHERE title LIKE '%${input.query}%'`
// );
```

### Error Handling Patterns

```typescript
// ✅ CORRECT: Comprehensive error handling
export function useCreateGrow() {
  const utils = api.useUtils();
  
  return api.grows.create.useMutation({
    onSuccess: (data) => {
      toast.success("Grow created successfully!");
      utils.grows.getMyGrows.invalidate();
      router.push(`/grows/${data.id}`);
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Please sign in to create grows");
        signIn();
      } else if (error.data?.code === "FORBIDDEN") {
        toast.error("You don't have permission to create grows");
      } else if (error.data?.code === "BAD_REQUEST") {
        toast.error(error.message || "Invalid input data");
      } else {
        toast.error("Failed to create grow. Please try again.");
        console.error("Create grow error:", error);
      }
    },
  });
}

// ✅ CORRECT: Error boundary with logging
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryComponent
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || "An unexpected error occurred"}
          </p>
          <Button onClick={resetErrorBoundary}>
            Try Again
          </Button>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Log errors to monitoring service
        console.error("Error caught by boundary:", error);
        console.error("Error info:", errorInfo);
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}
```

### Security Best Practices

```typescript
// ✅ CORRECT: CSRF protection with tRPC
export const createTRPCNext = {
  config() {
    return {
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `/api/trpc`,
          headers: async () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    };
  },
  ssr: false,
};

// ✅ CORRECT: Content Security Policy
export const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "X-XSS-Protection": "1; mode=block",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https:;
  `.replace(/\s{2,}/g, ' ').trim(),
};
```

## Testing Guidelines (Future Implementation)

- Target ≥80% unit test coverage
- Test component functionality
- Test API endpoints
- Implement integration tests

## Important Note

This is an active hobby project. **Never hallucinate about features or implementations** - ask for clarification when uncertain!

---

## Related Resources

- **[Database & tRPC](./database-trpc.instructions.md)** - API security patterns and data validation
- **[TypeScript Guidelines](./typescript-guidelines.instructions.md)** - Type safety and Zod schema validation
- **[Technology Stack](./tech-stack.instructions.md)** - Security configuration and environment setup
- **[Performance & SEO](./performance-seo.instructions.md)** - Secure performance optimization techniques
- **[Development Workflow](./development-workflow.instructions.md)** - Security review processes
