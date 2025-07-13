---
applyTo: "**"
title: "Technology Stack & Architecture"
description: "Core technologies, package management, development workflows, and architecture patterns"
tags: [tech-stack, architecture, bun, next-js, development]
last_updated: 2025-01-07
---

# 🏗️ Tech Stack & Architecture

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

- `bun run dev` - Start development server with Turbopack (hot reload enabled)
- `bun run predev` - Run database generation and migration before dev (automatic)

#### Build & Production Scripts

- `bun run build` - Build the production application (includes optimizations)
- `bun run prebuild` - Run database generation and migration before build (automatic)
- `bun run start` - Start the production server (requires build first)

#### Database Scripts

- `bun run db:generate` - Generate Drizzle schema files from database
- `bun run db:migrate` - Run database migrations to update schema
- `bun run db:push` - Push schema changes directly to database (development only)
- `bun run db:studio` - Open Drizzle Studio in the browser for database management

#### Code Quality Scripts

- `bun run lint` - Run Next.js linter with custom rules
- `bun run format` - Format code with Prettier (includes import sorting)

#### Cleanup Scripts

- `bun run clean-dev` - Remove development build artifacts (.next-dev, out)
- `bun run clean-prod` - Remove production build artifacts (.next-prod, out)  
- `bun run clean-all` - Remove all build artifacts (both dev and prod)

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

### Current Dependency Versions

Based on `package.json` version **0.9.0-beta.1**, key dependencies include:

#### Core Framework
- **Next.js**: 15.3.4 (with Turbopack for fast builds)
- **React**: 19.1.0 (latest with concurrent features)
- **TypeScript**: 5.8.3 (strict mode enabled)

#### Backend & API
- **tRPC**: 11.4.3 (type-safe API routes)
- **Drizzle ORM**: 0.35.3 (TypeScript ORM for PostgreSQL)
- **NextAuth.js**: 5.0.0-beta.29 (authentication)
- **PostgreSQL**: 3.4.7 (database driver)

#### UI & Styling
- **Tailwind CSS**: 4.1.11 (latest v4 with performance improvements)
- **Radix UI**: Latest components for accessibility
- **Framer Motion**: 11.18.2 (animations)
- **Lucide React**: 0.525.0 (icon library)

#### Development Tools
- **Bun**: Package manager and runtime
- **ESLint**: Code linting with Next.js preset
- **Prettier**: Code formatting with import sorting
- **Drizzle Studio**: Database management UI

### Bun-Specific Features

#### Fast Package Installation
```bash
# Bun installs packages significantly faster than npm/yarn
bun install  # ~2-3x faster than npm install

# Adding packages
bun add react-hook-form zod  # Add multiple packages
bun add -D @types/node       # Add dev dependencies
bun remove unused-package    # Remove packages
```

#### Built-in Development Server
```bash
# Bun can run TypeScript files directly
bunx file.ts  # No compilation needed

# Run Next.js with Bun (when configured)
bun run dev   # Uses Next.js dev server with Turbopack
```

#### Package Resolution
- **Workspaces**: Bun supports monorepo workspaces
- **Node.js Compatibility**: 99%+ compatibility with npm packages
- **Native Performance**: Written in Zig for speed

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

## Environment Variables

- Validate environment variables in `env.js`
- Use proper typing for environment configuration
- Include both client and server environment variables

## Third-Party Integrations

### SteadyHQ Integration

- Follow API documentation patterns
- Implement proper OAuth flow
- Handle subscription states properly

### Storage (MinIO)

- Use S3-compatible API patterns
- Implement proper file upload handling
- Handle image optimization

---

## Related Resources

- **[TypeScript Guidelines](./typescript-guidelines.instructions.md)** - Type safety patterns for tech stack components
- **[React & Next.js Guidelines](./react-nextjs.instructions.md)** - Component structure and framework usage
- **[Database & tRPC](./database-trpc.instructions.md)** - Backend architecture and API patterns
- **[Development Workflow](./development-workflow.instructions.md)** - Package management and development processes
- **[Performance & SEO](./performance-seo.instructions.md)** - Build optimization and performance strategies
