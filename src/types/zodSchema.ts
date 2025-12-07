// src/types/zodSchema.ts:
import { z } from "zod";

import { SortOrder } from "~/components/atom/sort-filter-controls";

// Import filter enums
import {
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
  GrowsSortField,
} from "~/types/grow";
import { Locale } from "~/types/locale";
import {
  GeneticsType,
  type GrowthPhase,
  PlantGrowthStages,
  StrainType,
} from "~/types/plant";
import { PostableEntityType } from "~/types/post";
import { UserRoles } from "~/types/user";

import { routing } from "~/lib/i18n/routing";

export const plantFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Plant name must be at least 2 characters.",
  }),
  growId: z.string().nullable().optional(),
  strainId: z.string().nullable().optional(),
  breederId: z.string().nullable().optional(),
  startDate: z
    .date({
      required_error: "'Seed Planted (Start date)' is required.",
    })
    .refine((value) => value !== null, {
      message: "'Seed Planted (Start date)' is required.", // Ensures `null` triggers the correct error message
    }),
  seedlingPhaseStart: z.date().nullable().optional(),
  vegetationPhaseStart: z.date().nullable().optional(),
  floweringPhaseStart: z.date().nullable().optional(),
  harvestDate: z.date().nullable().optional(),
  curingPhaseStart: z.date().nullable().optional(),
});

// Schema for creating a new breeder
export const breederFormSchema = z.object({
  name: z.string().min(5, {
    message: "Breeder name must be at least 5 characters.",
  }),
});

// Schema for creating a new strain
export const strainFormSchema = z.object({
  name: z.string().min(5, {
    message: "Strain name must be at least 5 characters.",
  }),
  breederId: z.string().min(1, {
    message: "Breeder is required.",
  }),
  thcContent: z.number().min(0).max(100).optional(),
  cbdContent: z.number().min(0).max(100).optional(),
  // Plant Entity Fields for exploration and filtering
  strainType: z.nativeEnum(StrainType).optional(),
  geneticsType: z.nativeEnum(GeneticsType).optional(),
});

export const imageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL." }),
  cloudinaryAssetId: z.string().optional(),
  cloudinaryPublicId: z.string().optional(),
  s3Key: z.string().optional(),
  s3ETag: z.string().optional(),
  captureDate: z.date().optional(), // Optional capture date
  originalFilename: z.string().min(1, {
    message: "Original filename is required.",
  }),
});

// Define the schema for grow form validation
export const growFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Grow name is required"),
  // Grow Entity Fields for exploration and filtering
  environment: z.nativeEnum(GrowEnvironment).nullish(),
  cultureMedium: z.nativeEnum(CultureMedium).nullish(),
  fertilizerType: z.nativeEnum(FertilizerType).nullish(),
  fertilizerForm: z.nativeEnum(FertilizerForm).nullish(),
  // Header image handling - integrated into main form
  headerImageId: z.string().optional(),
  removeHeaderImage: z.boolean().optional(),
});

// form schema for user editing
export const userEditSchema = z.object({
  id: z.string(),
  name: z
    .string({ required_error: "Name is required" })
    .min(2, { message: "Name is required and must be at least 2 characters" })
    .max(24, { message: "Name must be less than 24 characters" }),
  username: z
    .string({ required_error: "Username is required" })
    .min(5, { message: "Username must be at least 5 characters" })
    .max(20, { message: "Userame must be less than 20 characters" })
    .regex(/^[a-zA-Z0-9]+$/, {
      message:
        "Username must only contain alphanumeric characters with no spaces",
    }),
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Invalid email address" }),
  image: z.string().url({ message: "Invalid image URL" }).nullable(),
});

// Admin user edit schema - allows partial updates and role assignment
export const adminEditUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(50).optional(),
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRoles),
  image: z.string().optional().nullable(),
});

// Schema for updating a user's role by an admin
// export const updateUserRoleSchema = z.object({
//   userId: z.string(),
//   role: z.nativeEnum(UserRoles),
// });

export function createRegisterSchema(t: (key: string) => string) {
  return z.object({
    name: z
      .string({ required_error: t("RegisterPage.validation.name.required") })
      .min(2, { message: t("RegisterPage.validation.name.tooShort") })
      .max(24, { message: t("RegisterPage.validation.name.tooLong") }),
    username: z
      .string({
        required_error: t("RegisterPage.validation.username.required"),
      })
      .min(5, { message: t("RegisterPage.validation.username.tooShort") })
      .max(20, { message: t("RegisterPage.validation.username.tooLong") })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: t("RegisterPage.validation.username.invalidFormat"),
      }),
    email: z
      .string({ required_error: t("RegisterPage.validation.email.required") })
      .email({ message: t("RegisterPage.validation.email.invalid") }),
    password: z
      .string({
        required_error: t("RegisterPage.validation.password.required"),
      })
      .min(6, { message: t("RegisterPage.validation.password.tooShort") }),
    locale: z.enum(routing.locales as [Locale, ...Locale[]]),
  });
}

export const postSchema = z.object({
  content: z.string().min(1),
  entityId: z.string(),
  entityType: z.nativeEnum(PostableEntityType),
});

// Timeline pagination schemas
export const timelinePaginationSchema = z.object({
  cursor: z.string().datetime().nullish(), // ISO datetime string for cursor
  limit: z.number().min(1).max(50).default(20),
});

// export const enhancedTimelinePaginationSchema = timelinePaginationSchema.extend(
//   {
//     followingOnly: z.boolean().default(false),
//     userId: z.string().optional(), // For user-specific feeds
//   },
// );

// schema for updating user tokens
export const updateTokensSchema = z.object({
  userId: z.string(),
  accessToken: z.string(),
  expiresIn: z.number(),
  refreshToken: z.string(),
  refreshTokenExpiresIn: z.number(),
});

// export const createNotificationSchema = z.object({
//   notificationEventType: z.nativeEnum(NotificationEventType),
//   commentId: z.string().optional(),
//   notifiableEntity: z.object({
//     type: z.nativeEnum(NotifiableEntityType),
//     id: z.string(),
//   }),
//   actorData: z.object({
//     id: z.string().min(1),
//     name: z.string().min(1),
//     username: z.string().nullable(),
//     image: z.string().nullable(),
//   }),
// });

// Exploration and filtering schemas
export const growExplorationSchema = z.object({
  environment: z.nativeEnum(GrowEnvironment).optional(),
  cultureMedium: z.nativeEnum(CultureMedium).optional(),
  fertilizerType: z.nativeEnum(FertilizerType).optional(),
  fertilizerForm: z.nativeEnum(FertilizerForm).optional(),
  ownerId: z.string().optional(), // Filter by specific user ID
  username: z.string().optional(), // Filter by username (@username)
  search: z.string().optional(), // Search in grow name
  sortField: z.nativeEnum(GrowsSortField).default(GrowsSortField.CREATED_AT),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
  cursor: z.number().min(1).default(1), // Page number for offset-based pagination
  limit: z.number().min(1).max(1000).default(20),
});

export const plantExplorationSchema = timelinePaginationSchema.extend({
  growthStage: z
    .enum(
      PlantGrowthStages.map((stage) => stage.name) as [
        GrowthPhase,
        ...GrowthPhase[],
      ],
    )
    .optional(),
  strainType: z.nativeEnum(StrainType).optional(), // Filter by strain type
  geneticsType: z.nativeEnum(GeneticsType).optional(), // Filter by genetics type
  strainId: z.string().optional(), // Filter by strain
  growId: z.string().optional(), // Filter by grow
  ownerId: z.string().optional(), // Filter by specific user
  search: z.string().optional(), // Search in plant name
});

// Activity feed schemas
// export const activityFeedSchema = timelinePaginationSchema.extend({
//   entityType: z.nativeEnum(PostableEntityType).optional(), // Filter by entity type
//   userId: z.string().optional(), // For user-specific activity
// });

// Timeline management schemas
// export const userTimelineSchema = z.object({
//   userId: z.string(),
//   cursor: z.string().datetime().nullish(),
//   limit: z.number().min(1).max(50).default(20),
//   includeFollowing: z.boolean().default(true), // Include posts from followed users
// });

// export const entityTimelineSchema = z.object({
//   entityId: z.string(),
//   entityType: z.nativeEnum(PostableEntityType),
//   cursor: z.string().datetime().nullish(),
//   limit: z.number().min(1).max(50).default(20),
// });

// Type exports for the new schemas
// export type GrowExplorationInput = z.infer<typeof growExplorationSchema>;
// export type PlantExplorationInput = z.infer<typeof plantExplorationSchema>;
// export type ActivityFeedInput = z.infer<typeof activityFeedSchema>;
// export type UserTimelineInput = z.infer<typeof userTimelineSchema>;
// export type EntityTimelineInput = z.infer<typeof entityTimelineSchema>;
