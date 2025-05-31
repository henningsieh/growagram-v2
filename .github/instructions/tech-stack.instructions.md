---
applyTo: "**"
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
