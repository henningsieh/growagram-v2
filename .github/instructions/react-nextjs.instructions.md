---
applyTo: "**"
title: "React & Next.js Guidelines"
description: "Component structure, hooks usage patterns, and animation guidelines"
tags: [react, next-js, components, hooks, animation]
last_updated: 2025-01-07
---

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

**Always use ResponsiveDialog for modal interactions.** See [Dialog Patterns](.github/instructions/dialog-patterns.instructions.md) for complete guidelines and examples.

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
