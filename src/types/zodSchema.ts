// src/types/zodSchema.ts:
import { z } from "zod";

export const plantFormSchema = z.object({
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
