---
applyTo: "**"
---

# 🔧 Development Workflow & Process

## Git & Development Workflow

### Commit Messages

Follow conventional commit format for consistent history:

```bash
# Format: <type>(<scope>): <description>
feat(grows): add filtering by growth stage
fix(auth): handle null session in middleware
docs(readme): update installation instructions
style(ui): improve mobile button spacing
refactor(db): simplify user query logic
test(utils): add date formatting tests
chore(deps): update Next.js to 15.3.4
```

#### Commit Types

- **feat**: New features
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Formatting, no logic changes
- **refactor**: Code restructuring without behavior changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

#### Commit Examples

```bash
# Feature commits
git commit -m "feat(plants): add growth stage tracking system"
git commit -m "feat(ui): implement responsive dialog component"

# Bug fix commits
git commit -m "fix(auth): prevent unauthorized access to protected routes"
git commit -m "fix(forms): validate required fields before submission"

# Documentation commits
git commit -m "docs(api): add tRPC procedure documentation"
git commit -m "docs(readme): update badge versions for 0.9.0-beta.1"
```

### Code Review Process

#### Pre-Review Checklist

- ✅ TypeScript compilation passes (`bunx tsc --noEmit`)
- ✅ Linting passes (`bun run lint`)
- ✅ Code formatting applied (`bun run format`)
- ✅ Responsive design tested on multiple screen sizes
- ✅ Accessibility standards verified (WCAG 2.1 AA)
- ✅ Internationalization tested with German locale
- ✅ Database migrations run successfully (`bun run db:migrate`)

#### Review Guidelines

```typescript
// ✅ GOOD: Clear, self-documenting code
export function calculateGrowDuration(
  plantedAt: Date,
  harvestedAt?: Date,
): number {
  const endDate = harvestedAt ?? new Date();
  const durationMs = endDate.getTime() - plantedAt.getTime();
  return Math.floor(durationMs / (1000 * 60 * 60 * 24)); // Convert to days
}

// ❌ NEEDS IMPROVEMENT: Unclear logic without comments
export function calcDur(p: Date, h?: Date): number {
  const e = h ?? new Date();
  return Math.floor((e.getTime() - p.getTime()) / 86400000);
}
```

#### Performance Review Points

- Check for unnecessary re-renders with React DevTools
- Verify efficient database queries (no N+1 problems)
- Ensure proper image optimization with Next.js Image component
- Validate bundle size impact for new dependencies

### Branch Strategy

```bash
# Main development branch
main

# Feature branches
feature/grows-filtering-system
feature/notification-improvements
feature/user-dashboard-redesign

# Bug fix branches
fix/auth-session-handling
fix/mobile-dialog-responsiveness

# Release branches
release/0.9.0-beta.2
release/1.0.0

# Hotfix branches (for production)
hotfix/critical-security-patch
```

### Development Workflow

#### Starting New Feature

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-feature-name

# 3. Set up development environment
bun install
bun run db:migrate
bun run dev

# 4. Make changes with proper commits
git add .
git commit -m "feat(scope): descriptive message"
```

#### Daily Development Routine

```bash
# Morning setup
git checkout main
git pull origin main
git checkout feature/current-feature
git rebase main  # Keep feature branch updated

# Development cycle
bun run dev          # Start development server
bunx tsc --noEmit   # Type checking
bun run lint        # Linting
bun run format      # Code formatting

# End of day
git add .
git commit -m "feat(scope): progress on feature implementation"
git push origin feature/current-feature
```

## Documentation

### Code Comments

Document complex business logic with comprehensive JSDoc comments:

````typescript
/**
 * Calculates the optimal harvest window for a cannabis plant based on
 * growth stage, flowering duration, and trichome development.
 *
 * @param plant - The plant object with growth tracking data
 * @param preferences - User preferences for harvest timing
 * @returns Harvest recommendation with date range and confidence score
 *
 * @example
 * ```typescript
 * const recommendation = calculateHarvestWindow(
 *   myPlant,
 *   { preference: 'peak-thc', tolerance: 'medium' }
 * );
 * console.log(`Harvest between ${recommendation.earliestDate} and ${recommendation.latestDate}`);
 * ```
 */
export function calculateHarvestWindow(
  plant: Plant,
  preferences: HarvestPreferences,
): HarvestRecommendation {
  // Complex algorithm implementation...
}
````

#### API Integration Documentation

```typescript
/**
 * SteadyHQ OAuth integration for subscription management.
 * Handles the complete OAuth flow including authorization, token exchange,
 * and subscription status synchronization.
 *
 * @see https://developers.steadyhq.com/oauth for API documentation
 * @see src/lib/steady/config.ts for configuration details
 */
export class SteadyHQIntegration {
  /**
   * Initiates OAuth flow by redirecting user to SteadyHQ authorization page.
   *
   * @param userId - Internal user ID for state tracking
   * @param redirectUrl - Where to redirect after successful authorization
   * @throws {AuthError} When OAuth configuration is invalid
   */
  async initiateOAuth(userId: string, redirectUrl: string): Promise<void> {
    // Implementation with error handling...
  }
}
```

#### Utility Function Documentation

````typescript
/**
 * Formats a date range for display in grow timeline components.
 * Handles various edge cases including ongoing grows and harvest dates.
 *
 * @param startDate - When the grow/plant was started
 * @param endDate - When harvested (optional for ongoing grows)
 * @param locale - Locale for date formatting (defaults to user's locale)
 * @returns Formatted string like "Mar 15 - Apr 20, 2024" or "Mar 15, 2024 - ongoing"
 *
 * @example
 * ```typescript
 * // Completed grow
 * formatGrowDateRange(
 *   new Date('2024-03-15'),
 *   new Date('2024-04-20')
 * ); // "Mar 15 - Apr 20, 2024"
 *
 * // Ongoing grow
 * formatGrowDateRange(
 *   new Date('2024-03-15')
 * ); // "Mar 15, 2024 - ongoing"
 * ```
 */
export function formatGrowDateRange(
  startDate: Date,
  endDate?: Date,
  locale = "en",
): string {
  // Implementation...
}
````

### README Maintenance

#### Version Management Workflow

Keep project documentation current with each release:

```markdown
<!-- Current project status -->

## 🚀 Project Status: Phase 2 - Social Features (In Progress)

**Current Version:** 0.9.0-beta.1  
**Next Milestone:** 1.0.0 (Q2 2024)  
**Focus Areas:** User engagement, community features, content discovery

### Recent Updates (v0.9.0-beta.1)

- ✅ Enhanced grow exploration with advanced filtering
- ✅ Improved notification system with real-time updates
- ✅ Mobile-responsive dialog components
- 🔄 In Progress: Follow system and activity feeds
```

#### Feature Documentation Updates

````markdown
<!-- Document new features with usage examples -->

### 🔍 Grow Exploration & Discovery

**Filter by Multiple Criteria**

- Environment type (Indoor/Outdoor/Greenhouse)
- Culture medium (Soil/Hydroponic/Coco)
- Growth stage and harvest status
- Date ranges and geographical location

**Smart Search**

- Full-text search across grow names and descriptions
- Strain-based filtering with genetic information
- User-based discovery (find grows by specific growers)

**Example Usage:**

```url
/explore?environment=indoor&medium=hydroponic&stage=flowering&sort=newest
```
````

#### Deployment Instructions

Update deployment docs with each infrastructure change:

```bash
# Production deployment with Docker and Coolify
git tag v0.9.0-beta.1
git push origin v0.9.0-beta.1

# Coolify automatically triggers deployment
# Monitor deployment at: https://coolify.yourdomain.com

# Manual database migration (if needed)
bun run db:migrate

# Verify deployment
curl https://growagram.com/api/health
```

#### Badge System Integration

**Critical: Update badges as part of release process**

```bash
# 1. Update package.json version
bun version patch  # or minor/major

# 2. Update README badges manually (private repo requirement)
# Edit README.md and update version badges:
# From: ![Version](https://img.shields.io/badge/Version-0.9.0--beta.1-blue...)
# To:   ![Version](https://img.shields.io/badge/Version-0.9.0--beta.2-blue...)

# 3. Verify badge rendering
# Check https://github.com/username/growagram-v2 for correct display

# 4. Update dependency badges if major versions changed
# Example: Next.js 15.2.4 → 15.3.0
# Update: ![Next.js](https://img.shields.io/badge/Next.js-15-black...)

# 5. Commit badge updates with release
git add README.md package.json
git commit -m "chore(release): update version badges for v0.9.0-beta.2"
```

#### Badge Maintenance Checklist

- [ ] Main version badge matches package.json
- [ ] Framework version badges reflect major updates
- [ ] Infrastructure badges updated for service changes
- [ ] All badges render correctly in GitHub
- [ ] Links point to correct documentation/repositories

### Automated Documentation Tools

#### API Documentation Generation

```typescript
// Generate tRPC procedure documentation
// Run: bun run docs:api
export const documentationConfig = {
  output: "./docs/api/trpc-procedures.md",
  procedures: [
    "grows.explore",
    "plants.create",
    "users.profile",
    "notifications.getAll",
  ],
  includeExamples: true,
  includeSchemas: true,
};
```

#### Code Comment Linting

```typescript
// ESLint rule for required JSDoc comments
// .eslintrc.js
module.exports = {
  rules: {
    "jsdoc/require-jsdoc": [
      "error",
      {
        require: {
          FunctionDeclaration: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false, // Optional for simple arrow functions
        },
      },
    ],
  },
};
```

## Future Considerations

### Roadmap Alignment

- Phase 1: Core Platform (100% Complete)
- Phase 2: Social Features (In Progress)
- Phase 3: Advanced Features & Monetization

### Technical Debt

- Maintain clean architecture
- Refactor when necessary
- Plan for scalability

Remember: This is an active development project in Phase 1 of 3. Prioritize clean, maintainable code that supports the growing feature set and user base.
