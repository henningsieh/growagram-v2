// src/types/zodSchema.ts:
import { z } from "zod";
import { routing } from "~/lib/i18n/routing";

import { Locale } from "./locale";
import { NotifiableEntityType, NotificationEventType } from "./notification";
import { PostableEntityType } from "./post";

export const plantFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Plant name must be at least 2 characters.",
  }),
  growId: z.string().nullable().optional(),
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

// schema for updating user tokens
export const updateTokensSchema = z.object({
  userId: z.string(),
  accessToken: z.string(),
  expiresIn: z.number(),
  refreshToken: z.string(),
  refreshTokenExpiresIn: z.number(),
});

export const createNotificationSchema = z.object({
  notificationEventType: z.nativeEnum(NotificationEventType),
  commentId: z.string().optional(),
  notifiableEntity: z.object({
    type: z.nativeEnum(NotifiableEntityType),
    id: z.string(),
  }),
  actorData: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    username: z.string().nullable(),
    image: z.string().nullable(),
  }),
});
