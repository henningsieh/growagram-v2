---
applyTo: "**"
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

## Advanced Zod Schema Patterns

### Complex Form Validation

```typescript
// Advanced form schema with custom validations
export const plantFormSchema = z.object({
  name: z.string()
    .min(1, "Plant name is required")
    .max(100, "Plant name too long"),
  
  strainId: z.string()
    .uuid("Invalid strain ID")
    .optional(),
  
  growId: z.string()
    .uuid("Invalid grow ID")
    .optional(),
  
  // Date validations with custom logic
  plantedAt: z.date()
    .max(new Date(), "Planting date cannot be in the future"),
  
  harvestedAt: z.date()
    .optional()
    .refine((date, ctx) => {
      if (date && ctx.parent.plantedAt && date <= ctx.parent.plantedAt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Harvest date must be after planting date",
        });
        return false;
      }
      return true;
    }),
  
  // Conditional validation based on growth stage
  growthStage: z.nativeEnum(PlantGrowthStage),
}).refine((data) => {
  // Custom validation: if harvested, must have harvest date
  if (data.growthStage === PlantGrowthStage.HARVESTED && !data.harvestedAt) {
    return false;
  }
  return true;
}, {
  message: "Harvest date required when plant is harvested",
  path: ["harvestedAt"],
});
```

### API Input/Output Schemas

```typescript
// Pagination schema with defaults
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Search and filter schema
export const growExplorationSchema = paginationSchema.extend({
  environment: z.nativeEnum(GrowEnvironment).optional(),
  cultureMedium: z.nativeEnum(CultureMedium).optional(),
  fertilizerType: z.nativeEnum(FertilizerType).optional(),
  search: z.string()
    .min(1, "Search term too short")
    .max(100, "Search term too long")
    .optional(),
  sortField: z.nativeEnum(GrowsSortField).default(GrowsSortField.CREATED_AT),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
});

// Response schema with computed fields
export const growResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  environment: z.nativeEnum(GrowEnvironment).nullable(),
  cultureMedium: z.nativeEnum(CultureMedium).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // Relations
  owner: z.object({
    id: z.string().uuid(),
    username: z.string().nullable(),
    name: z.string().nullable(),
  }),
  
  plants: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    growthStage: z.nativeEnum(PlantGrowthStage),
  })),
  
  // Computed fields
  _count: z.object({
    plants: z.number(),
    likes: z.number(),
    comments: z.number(),
  }),
});
```

### Discriminated Union Schemas

```typescript
// Different notification types with specific data
export const notificationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(NotificationEventType.NEW_LIKE),
    entityType: z.nativeEnum(NotifiableEntityType),
    entityId: z.string().uuid(),
    actorId: z.string().uuid(),
    actorName: z.string(),
  }),
  
  z.object({
    type: z.literal(NotificationEventType.NEW_COMMENT),
    entityType: z.nativeEnum(NotifiableEntityType),
    entityId: z.string().uuid(),
    commentId: z.string().uuid(),
    actorId: z.string().uuid(),
    actorName: z.string(),
    commentText: z.string().max(500),
  }),
  
  z.object({
    type: z.literal(NotificationEventType.NEW_FOLLOW),
    actorId: z.string().uuid(),
    actorName: z.string(),
    actorUsername: z.string().nullable(),
  }),
]);
```

### Environment Variable Validation

```typescript
// Comprehensive env schema with proper types
export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  
  // Storage
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.number().int().min(1).max(65535),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(8),
  MINIO_BUCKET_NAME: z.string().min(1),
  
  // Optional with defaults
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.number().int().min(1).max(65535).default(3000),
  
  // Runtime-only validation
}).transform((env) => ({
  ...env,
  // Transform and validate URLs
  minioUrl: `${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
}));

// Type extraction for use throughout app
export type Env = z.infer<typeof envSchema>;
```
