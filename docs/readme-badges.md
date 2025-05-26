# Badge System Documentation

## Overview

This document explains the badge system implemented in the GrowAGram project's README.md file, including the approach for private repositories and version management strategies.

## Current Implementation: Static Badges for Private Repository

**Why Static Badges?**

GrowAGram uses **static badges** because this is a **private repository**. shields.io cannot access private repositories to pull dynamic data from `package.json` or repository statistics.

### 🏷️ Static Badge Approach

- **Manually maintained** badge versions to match actual dependencies
- **Updated when dependencies change** as part of the development workflow
- **Consistent styling** with `style=for-the-badge` format
- **Proper descriptive names** instead of generic "Static Badge" labels

### ✅ Advantages for Private Repositories

- ✅ Static badges work reliably for all badge types
- ✅ Full control over badge appearance and information
- ✅ No dependency on external services accessing private data
- ✅ Consistent display regardless of repository visibility

### ⚠️ Maintenance Requirements

- ⚠️ Manual maintenance required when versions change
- ⚠️ Not automatically synchronized with package.json
- ⚠️ Developer responsibility to update during dependency upgrades

## Current Tech Stack Versions (as of May 2025)

Based on `package.json` version **0.9.0-beta.1**:

### Core Framework

- **Next.js**: 15.2.4
- **React**: 19.1.0
- **TypeScript**: 5.8.2

### Backend & Data

- **tRPC**: 11.1.2
- **Drizzle ORM**: 0.35.3
- **NextAuth.js**: 5.0.0-beta.25

### UI & Styling

- **Tailwind CSS**: 4.1.1
- **Framer Motion**: 11.18.2
- **TanStack Query**: 5.71.5

### Build Tools

- **Node.js**: 20 (required)
- **PostCSS**: 8.5.3

## Badge Types

### 1. Main Version Badge

Shows the current project version from `package.json`:

```markdown
[![Version](https://img.shields.io/badge/Version-0.9.0--beta.1-blue?style=for-the-badge&logo=npm&logoColor=white)](https://github.com/henningsieh/growagram-v2)
```

**Note**: For private repositories, this must be manually updated when `package.json` version changes.

### 2. Technology Stack Badges

Core framework and library versions (manually maintained):

```markdown
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
```

### 3. Infrastructure & Services Badges

For services not tracked in package.json:

```markdown
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Latest-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![MinIO](https://img.shields.io/badge/MinIO-S3%20Compatible-c72c48?style=for-the-badge&logo=minio&logoColor=white)](https://min.io)
```

### 4. License Badge

```markdown
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
```

## Badge URL Structure

### Static Badge Format

For private repositories, use static badge format:

```
https://img.shields.io/badge/{label}-{message}-{color}?{params}
```

**Example:**

```
https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white
```

### Dynamic Badge Format (Public Repos Only)

If repository becomes public, these formats can be used:

#### Package Version

```
https://img.shields.io/github/package-json/v/{owner}/{repo}?{params}
```

#### Dependency Version

```
https://img.shields.io/github/package-json/dependency-version/{owner}/{repo}/{dependency}?{params}
```

#### Repository Statistics

```
https://img.shields.io/github/{metric}/{owner}/{repo}?{params}
```

## Common Parameters

- `style=for-the-badge` - Makes badges larger and more prominent
- `logo={logoname}` - Adds a logo (see Simple Icons for available logos)
- `logoColor=white` - Sets logo color
- `label={text}` - Custom label text
- `color={color}` - Custom badge color (hex or named colors)

## Available Logos

Common logos available through Simple Icons:

- `next.js` - Next.js
- `react` - React
- `typescript` - TypeScript
- `postgresql` - PostgreSQL
- `tailwindcss` - Tailwind CSS
- `docker` - Docker
- `github` - GitHub
- `npm` - NPM
- `git` - Git

## Maintenance Workflow

### When to Update Badges

1. **Version Changes**: Update main version badge when `package.json` version changes
2. **Dependency Updates**: Update framework badges when major versions change (e.g., Next.js 14→15)
3. **Infrastructure Changes**: Update service badges when versions change (e.g., PostgreSQL 15→16)

### Update Process

1. **Check current versions** in `package.json`
2. **Update badge URLs** in README.md
3. **Test badge display** by viewing rendered markdown
4. **Commit changes** with descriptive message

### Version Management Script (Future)

Consider implementing automated version sync:

```javascript
// scripts/update-badges.js
const fs = require("fs");
const packageJson = require("../package.json");

function updateBadges() {
  const readme = fs.readFileSync("README.md", "utf8");
  const updatedReadme = readme.replace(
    /Version-[\d.-]+beta[\d.-]+/g,
    `Version-${packageJson.version}`,
  );
  fs.writeFileSync("README.md", updatedReadme);
}
```

## Migration Strategy

### If Repository Becomes Public

When/if the repository becomes public, badges can be migrated to dynamic versions:

**Before (Static):**

```markdown
[![Version](https://img.shields.io/badge/Version-0.9.0--beta.1-blue?style=for-the-badge&logo=npm&logoColor=white)](https://github.com/henningsieh/growagram-v2)
```

**After (Dynamic):**

```markdown
[![GitHub package.json version](https://img.shields.io/github/package-json/v/henningsieh/growagram-v2?style=for-the-badge&logo=npm&logoColor=white&label=Version)](https://github.com/henningsieh/growagram-v2)
```

### Benefits of Migration

- ✅ Automatic updates when package.json changes
- ✅ Real-time repository statistics
- ✅ Reduced maintenance overhead
- ✅ Always accurate dependency versions

## Best Practices

### For Private Repositories

1. **Use static badges** for all version-dependent information
2. **Group related badges** together (framework, backend, etc.)
3. **Maintain consistent styling** with `style=for-the-badge`
4. **Use descriptive labels** instead of generic text
5. **Link badges** to relevant documentation or websites
6. **Update as part of release process** when versions change
7. **Test badge rendering** after URL changes

### Badge Organization

```markdown
<!-- Main project version -->

[![Version](https://img.shields.io/badge/Version-0.9.0--beta.1-blue?style=for-the-badge&logo=npm&logoColor=white)](...)

<!-- Core technology stack -->

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](...)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](...)

<!-- Backend technologies -->

[![tRPC](https://img.shields.io/badge/tRPC-11-398CCB?style=for-the-badge&logo=typescript&logoColor=white)](...)

<!-- Infrastructure -->

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql&logoColor=white)](...)
[![Docker](https://img.shields.io/badge/Docker-Latest-2496ed?style=for-the-badge&logo=docker&logoColor=white)](...)

<!-- License -->

[![MIT License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](...)
```

### Styling Guidelines

- **Consistent style**: Always use `style=for-the-badge`
- **Appropriate logos**: Use recognizable technology logos
- **Color coordination**: Use official brand colors when possible
- **Readable contrast**: Ensure text is readable on badge background

## Testing Badge URLs

To test if a badge works correctly:

1. Copy the URL part (before the link destination)
2. Paste it directly in a browser
3. The badge image should display correctly

Example test URL:

```
https://img.shields.io/github/package-json/v/henningsieh/growagram-v2?style=for-the-badge&logo=npm&logoColor=white&label=Version
```

## Troubleshooting

### Private Repository Issues

**Problem**: Dynamic GitHub badges show "REPO NOT FOUND OR PACKAGE.JSON MISSING"

**Solution**: Use static badges instead of GitHub API badges for private repositories.

### Badge Not Displaying

**Common causes:**

- Invalid URL encoding in badge text
- Missing or incorrect logo name
- Network connectivity issues

**Solutions:**

- Test badge URL directly in browser
- Verify logo name against [Simple Icons](https://simpleicons.org/)
- Check for special characters in labels

### Badge Shows Wrong Information

**For Static Badges:**

- Verify manual version matches `package.json`
- Check for typos in version numbers
- Ensure consistent formatting

### Style Issues

**Common problems:**

- Inconsistent badge styles across README
- Poor color contrast
- Missing or wrong logos

**Solutions:**

- Use `style=for-the-badge` consistently
- Choose appropriate brand colors
- Reference official logo names from Simple Icons

## Badge Color Reference

### Technology Colors

- **Next.js**: `black` or `000000`
- **React**: `61DAFB`
- **TypeScript**: `blue` or `3178C6`
- **PostgreSQL**: `blue` or `336791`
- **Docker**: `2496ED`
- **Node.js**: `339933`

### Status Colors

- **Version**: `blue`
- **License**: `green`
- **Build Status**: `brightgreen` (passing), `red` (failing)
- **Coverage**: `brightgreen` (>80%), `yellow` (50-80%), `red` (<50%)

## Future Improvements

### When Repository Becomes Public

1. **Migrate to dynamic badges** for automatic updates
2. **Add repository statistics** (stars, issues, commits)
3. **Implement CI/CD badges** for build status
4. **Add code quality badges** (coverage, code grade)

### Development Workflow Integration

1. **Automated badge updates** via release scripts
2. **Version validation** to ensure badge/package.json sync
3. **Badge testing** in CI pipeline
4. **Dependency update notifications**

### Additional Badge Types

1. **Security badges** from Snyk or similar services
2. **Performance badges** from Lighthouse CI
3. **Dependency freshness** indicators
4. **Code complexity** metrics

## Conclusion

For **GrowAGram's private repository**, static badges provide:

✅ **Reliable display** regardless of repository visibility  
✅ **Full control** over badge appearance and information  
✅ **Professional presentation** for stakeholders  
✅ **No external dependencies** on GitHub API access

The trade-off is **manual maintenance**, but this can be integrated into the development workflow and release process to ensure badges stay current with actual project state. 4. **Coverage badges** when testing suite is expanded
