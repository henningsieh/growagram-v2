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
