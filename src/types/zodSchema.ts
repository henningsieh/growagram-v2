// src/types/zodSchema.ts:
import { z } from "zod";

export const plantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Plant name must be at least 2 characters.",
  }),
  startDate: z
    .union([
      z.date({
        required_error: "'Seed Planted (Start date)' is required.",
      }),
      z.null(),
    ])
    .refine((value) => value !== null, {
      message: "'Seed Planted (Start date)' is required.", // Ensures `null` triggers the correct error message
    }),
  seedlingPhaseStart: z.date().nullable().optional(),
  vegetationPhaseStart: z.date().nullable().optional(),
  floweringPhaseStart: z.date().nullable().optional(),
  harvestDate: z.date().nullable().optional(),
  curingPhaseStart: z.date().nullable().optional(),
});

export const imageSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().url({ message: "Image URL must be a valid URL." }),
  cloudinaryAssetId: z.string().min(1, { message: "Asset ID is required." }),
  cloudinaryPublicId: z.string().min(1, { message: "Public ID is required." }),
  captureDate: z.date().optional(), // Optional capture date
  originalFilename: z.string().min(1, {
    message: "Original filename is required.",
  }),
});

// Define the schema for grow form validation
export const growSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Grow name is required"),
});

// likeRouter schemas
export const getUserLikedEntitiesInut = z.object({
  entityType: z.enum(["plant", "image"]).optional(),
});
export const getLikeCountInput = z.object({
  entityId: z.string(),
  entityType: z.enum(["plant", "image"]),
});
export const toggleLikeInput = z.object({
  entityId: z.string(),
  entityType: z.enum(["plant", "image"]),
});
