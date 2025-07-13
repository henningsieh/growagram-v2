---
applyTo: "**"
title: "TypeScript Guidelines"
description: "Type safety patterns, Zod schemas, and TypeScript best practices"
tags: [typescript, type-safety, zod, patterns, guidelines]
last_updated: 2025-01-07
---

# 🔷 TypeScript Guidelines

## Type Definitions

- Define interfaces for component props
- Use proper type imports: `import type React from "react"`
- Create reusable types in the `types/` directory
- Use strict TypeScript configuration

## Single Source of Truth for Types

**All type definitions must have a single source of truth to avoid duplication and ensure consistency across the codebase.**

### Zod Schema and Type Definitions

- **Primary Location:** All Zod schemas are defined in `src/types/zodSchema.ts`
- **Type Extraction:** Use `z.infer<typeof schema>` to extract TypeScript types from Zod schemas
- **Enum Definitions:** Define enums in `src/types/` directory and reuse in Zod schemas

```typescript
// ✅ CORRECT: Define enum once in types
// src/types/plant.ts
export const PlantGrowthStages = [
  { name: "planted", color: "planted" },
  { name: "seedling", color: "seedling" },
  { name: "vegetation", color: "vegetation" },
  { name: "flowering", color: "flowering" },
  { name: "harvested", color: "harvested" },
  { name: "curing", color: "curing" },
];

// src/types/zodSchema.ts
import { PlantGrowthStages } from "~/types/plant";

export const plantGrowthStageFilterSchema = z.object({
  growthStage: z.enum(PlantGrowthStages.map(stage => stage.name)).optional(),
});

// tRPC router
import { plantGrowthStageFilterSchema } from "~/types/zodSchema";

export const plantRouter = createTRPCRouter({
  explore: publicProcedure
    .input(plantGrowthStageFilterSchema.extend({
      // ... other fields
    }))
    .query(async ({ input }) => {
      // Use the validated input
    }),
});
```

```typescript
// ❌ WRONG: Duplicating enum definitions
// router.ts - DON'T DO THIS
.input(z.object({
  growthStage: z.enum(["seedling", "vegetation", "flowering", "harvested", "curing"])
}))

// component.tsx - DON'T DO THIS
type GrowthStage = "seedling" | "vegetation" | "flowering" | "harvested" | "curing";
```

### Best Practices for Type Consistency

1. **Enum Definitions:** Create TypeScript enums in `src/types/` for all categorical data
2. **Zod Schema Reuse:** Reference enums using `z.nativeEnum()` in Zod schemas
3. **Type Inference:** Use `z.infer<typeof schema>` instead of manually creating matching types
4. **Import Consistency:** Always import from the single source, never redefine

```typescript
// src/types/zodSchema.ts
import { CultureMedium, FertilizerType, GrowEnvironment } from "./grow";

// Example: Grow entity types
// src/types/grow.ts
export enum GrowEnvironment {
  INDOOR = "indoor",
  OUTDOOR = "outdoor",
  GREENHOUSE = "greenhouse",
}

export enum CultureMedium {
  SOIL = "soil",
  COCOS = "cocos",
  HYDROPONIC = "hydroponic",
  OTHER = "other",
}

export enum FertilizerType {
  MINERAL = "mineral",
  ORGANIC = "organic",
  MIXED = "mixed",
}

export const growFilterSchema = z.object({
  environment: z.nativeEnum(GrowEnvironment).optional(),
  cultureMedium: z.nativeEnum(CultureMedium).optional(),
  fertilizerType: z.nativeEnum(FertilizerType).optional(),
});

// Extract TypeScript type
export type GrowFilterInput = z.infer<typeof growFilterSchema>;
```

### Advanced Zod Schema Patterns

#### Complex Validation Schemas

```typescript
// User registration schema with validation
export const userRegistrationSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string()
    .email("Invalid email format")
    .refine(async (email) => {
      // Custom async validation
      const exists = await checkEmailExists(email);
      return !exists;
    }, "Email already exists"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Plant post creation schema
export const plantPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image required"),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed"),
  growthStage: z.nativeEnum(PlantGrowthStages),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional(),
  }).optional(),
  metadata: z.object({
    cameraModel: z.string().optional(),
    timestamp: z.date(),
    private: z.boolean().default(false),
  }),
});
```

#### Enum Best Practices

```typescript
// ✅ CORRECT: Use const assertions for type safety
export const NOTIFICATION_TYPES = [
  "like",
  "comment", 
  "follow",
  "mention",
  "grow_update"
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const notificationSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES),
  recipientId: z.string().uuid(),
  senderId: z.string().uuid(),
  message: z.string(),
  read: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

// ✅ CORRECT: String enum with validation
export enum UserRole {
  ADMIN = "admin",
  MODERATOR = "moderator", 
  USER = "user",
  GUEST = "guest"
}

export const userRoleSchema = z.nativeEnum(UserRole);
```

### Type Safety Best Practices

```typescript
// ✅ CORRECT: Use strict TypeScript configuration
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUncheckedIndexedAccess": true
  }
}

// ✅ CORRECT: Use branded types for domain objects
type UserId = string & { readonly _brand: unique symbol };
type PlantId = string & { readonly _brand: unique symbol };
type GrowId = string & { readonly _brand: unique symbol };

// ✅ CORRECT: Use utility types effectively
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type UserWithoutId = Omit<User, "id">;
type UserKeys = keyof User;
type UserValues = User[keyof User];
```

### Frontend Component Type Usage

```typescript
// ✅ CORRECT: Use enum from single source
import { PlantGrowthStages } from "~/types/plant";
// ✅ CORRECT: Use Zod-inferred types
import type { GrowFilterInput } from "~/types/zodSchema";

interface FilterProps {
  selectedStage: (typeof PlantGrowthStages)[number];
  onStageChange: (stage: (typeof PlantGrowthStages)[number]) => void;
}

interface ExploreGrowsProps {
  filters: GrowFilterInput;
}
```

### Database Schema Consistency

- Ensure database enum values match TypeScript enum values
- Use the same enum definitions for both frontend validation and database constraints
- Reference the single source of truth in migration files

```typescript
// drizzle schema
import { GrowEnvironment } from "~/types/grow";

export const grows = pgTable("grows", {
  environment: varchar("environment").$type<GrowEnvironment>(),
  // ...
});
```

---

## Related Resources

- **[Technology Stack](./tech-stack.instructions.md)** - Core technologies and architectural patterns
- **[Database & tRPC](./database-trpc.instructions.md)** - Type-safe API patterns and database schemas
- **[React & Next.js Guidelines](./react-nextjs.instructions.md)** - Component props and interface definitions
- **[Security & Testing](./security-testing.instructions.md)** - Type safety in authentication and validation
- **[Styling & i18n](./styling-i18n.instructions.md)** - TypeScript patterns for styling and internationalization
