---
applyTo: "**"
description: "Component structure, hooks usage patterns, and animation guidelines"
---

<!--
title: "React & Next.js Guidelines"
tags: [react, next-js, components, hooks, animation]
last_updated: 2025-01-07
-->

# ⚛️ React & Next.js Guidelines

## Component Structure

```typescript
"use client"; // Only when needed for client components

import * as React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { VariantProps } from "class-variance-authority";
import { ClockIcon, Flower2Icon, TentTreeIcon } from "lucide-react";
import { modulePaths } from "~/assets/constants";
import { Button, buttonVariants } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Link, usePathname } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils"

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

## Client Components

- Use `"use client";` directive only when necessary
- Prefer server components by default
- Use client components for:
  - Event handlers
  - State management
  - Browser APIs

## Dialog & Modal Components

**Always use ResponsiveDialog for modal interactions.** See [Dialog Patterns](./dialog-patterns.instructions.md) for complete guidelines and examples.

## Component Separation

**Break down complex components following the established patterns:**

- **Main component**: < 200 lines, handles primary logic
- **Dialog components**: < 150 lines, manage modal interactions
- **Content sections**: < 250 lines, focused functionality
- **Sub-components**: Single responsibility, reusable pieces

### File Organization

```
components/features/FeatureName/
├── index.ts                    # Clean exports
├── feature-main.tsx           # Primary component
├── feature-dialog.tsx         # Modal wrapper (if needed)
├── feature-controls.tsx       # Form/control components
└── sub-components/           # Additional focused components
```

## Loading States

- Implement proper loading states using Skeleton components
- Use consistent loading patterns across the application
- Example from `loading.tsx`:

```typescript
<div className="aspect-square h-14 w-14 flex-shrink-0">
  <Skeleton className="h-full w-full rounded-full" />
</div>
```

## Advanced Component Patterns

### Custom Hooks Usage

```typescript
// Custom data fetching hook
function useGrowData(growId: string) {
  const { data, error, isLoading } = trpc.grows.getById.useQuery(
    { id: growId },
    { enabled: !!growId },
  );

  return {
    grow: data,
    error,
    isLoading,
  };
}

// Custom form hook with validation
function useGrowForm() {
  const form = useForm<GrowFormData>({
    resolver: zodResolver(growFormSchema),
    defaultValues: {
      name: "",
      environment: undefined,
    },
  });

  const saveMutation = trpc.grows.create.useMutation();

  const handleSubmit = async (data: GrowFormData) => {
    try {
      await saveMutation.mutateAsync(data);
      toast.success("Grow created successfully");
    } catch (error) {
      toast.error("Failed to create grow");
    }
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting: saveMutation.isPending,
  };
}
```

### Compound Component Pattern

```typescript
// Main component that provides context
function ExploreFilters({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = React.useState<FilterState>({});

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      <div className="space-y-4">{children}</div>
    </FilterContext.Provider>
  );
}

// Sub-components that consume context
ExploreFilters.Search = function FilterSearch() {
  const { filters, setFilters } = useFilterContext();

  return (
    <Input
      placeholder="Search grows..."
      value={filters.search || ""}
      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
    />
  );
};

ExploreFilters.Environment = function FilterEnvironment() {
  const { filters, setFilters } = useFilterContext();

  return (
    <Select
      value={filters.environment}
      onValueChange={(value) => setFilters(prev => ({ ...prev, environment: value }))}
    >
      {/* Options */}
    </Select>
  );
};

// Usage
<ExploreFilters>
  <ExploreFilters.Search />
  <ExploreFilters.Environment />
</ExploreFilters>
```

### Error Boundary Pattern

```typescript
class GrowErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Grow component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback />;
    }

    return this.props.children;
  }
}

// Usage
<GrowErrorBoundary fallback={GrowErrorFallback}>
  <GrowComponent />
</GrowErrorBoundary>
```

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

---

## Related Resources

- **[Technology Stack](./tech-stack.instructions.md)** - Core frameworks and development setup
- **[TypeScript Guidelines](./typescript-guidelines.instructions.md)** - Component props and interface definitions
- **[Dialog Patterns](./dialog-patterns.instructions.md)** - ResponsiveDialog usage and modal patterns
- **[Styling & i18n](./styling-i18n.instructions.md)** - Component styling and internationalization
- **[Database & tRPC](./database-trpc.instructions.md)** - Data fetching and state management patterns
- **[Performance & SEO](./performance-seo.instructions.md)** - Component optimization and loading strategies
