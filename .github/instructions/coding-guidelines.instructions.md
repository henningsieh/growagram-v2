---
applyTo: "**/*"
---

# GrowAGram - Coding Guidelines & Development Standards

## Project Overview

GrowAGram is a Next.js-based social media platform for plant enthusiasts, built with modern web technologies and following best practices for performance, accessibility, and maintainability.

### Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: tRPC, Drizzle ORM, PostgreSQL
- **Authentication**: Auth.js (NextAuth.js)
- **File Storage**: MinIO (S3-compatible)
- **Image Processing**: Cloudinary
- **Package Manager**: Bun
- **Internationalization**: next-intl
- **Animations**: Framer Motion

### Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
├── server/             # Server-side code (tRPC routers, actions)
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

---

## Navigation & Quick Reference

This document serves as the main entry point for all development guidelines. For detailed information on specific topics, refer to the specialized instruction files below:

| Topic                    | File                                                                             | Description                                                     |
| ------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Technology Stack**     | [tech-stack.instructions.md](./tech-stack.instructions.md)                       | Package management, architecture, and integrations              |
| **TypeScript**           | [typescript-guidelines.instructions.md](./typescript-guidelines.instructions.md) | Type safety, Zod schemas, and TypeScript patterns               |
| **React & Next.js**      | [react-nextjs.instructions.md](./react-nextjs.instructions.md)                   | Component structure, hooks, and animation guidelines            |
| **Styling & i18n**       | [styling-i18n.instructions.md](./styling-i18n.instructions.md)                   | Tailwind CSS, responsive design, and internationalization       |
| **Database & tRPC**      | [database-trpc.instructions.md](./database-trpc.instructions.md)                 | Drizzle ORM, tRPC procedures, and state management              |
| **Performance & SEO**    | [performance-seo.instructions.md](./performance-seo.instructions.md)             | Core Web Vitals, optimization, and SEO strategies               |
| **Development Workflow** | [development-workflow.instructions.md](./development-workflow.instructions.md)   | Git workflow, documentation, and code organization              |
| **Security & Testing**   | [security-testing.instructions.md](./security-testing.instructions.md)           | Authentication, security practices, error handling, and testing |

---

## Core Principles

### 1. Type Safety First

- Use TypeScript extensively with strict type checking
- Validate data with Zod schemas at runtime
- Never use `any` - prefer `unknown` or proper types

### 2. Performance-Driven Development

- Target Core Web Vitals benchmarks
- Implement proper code splitting and lazy loading
- Optimize images and assets for web delivery

### 3. Accessibility & Internationalization

- Follow WCAG guidelines for accessibility
- Implement comprehensive i18n support
- Ensure responsive design across all devices

### 4. Security Best Practices

- Validate all inputs and sanitize outputs
- Implement proper authentication and authorization
- Use secure communication protocols

### 5. Developer Experience

- Maintain clear code organization and documentation
- Use conventional commit messages and PR workflows
- Implement comprehensive testing strategies

---

## Quick Start Checklist

Before starting development, ensure you have:

- [ ] Read the relevant specialized instruction files for your task
- [ ] Set up the development environment with Bun
- [ ] Configured required environment variables
- [ ] Understood the project structure and conventions
- [ ] Reviewed security and performance guidelines

---

## Getting Help

For questions or clarifications about these guidelines:

1. **Check the specialized instruction files** for detailed guidance on specific topics
2. **Review existing code** in the project for implementation examples
3. **Consult the development team** for complex architectural decisions
4. **Update documentation** when you discover new patterns or solutions

---

## Contributing to Guidelines

These guidelines are living documents that should evolve with the project. When contributing:

1. Update the appropriate specialized instruction file
2. Ensure changes align with overall project principles
3. Provide clear examples and reasoning
4. Keep documentation concise and actionable

Remember: These guidelines ensure that GrowAGram maintains high code quality, performance, and maintainability across all development efforts.

---

_For specific guidelines, navigate to the relevant instruction file above._
