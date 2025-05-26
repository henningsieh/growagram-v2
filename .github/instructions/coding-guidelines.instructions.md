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
- **Animation**: framer-motion
- **Deployment**: Docker with Coolify CI/CD

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

### Generic Types

```typescript
interface ProcessedNavItem {
  title: string;
  items?: ProcessedNavItem[];
  // Other properties
}

type IconComponent = LucideIcon;
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

### Environment Variables

- Validate environment variables in `env.js`
- Use proper typing for environment configuration
- Include both client and server environment variables

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
