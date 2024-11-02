// src/lib/db/types.ts
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  accounts,
  authenticators,
  images,
  plants,
  posts,
  sessions,
  users,
  verificationTokens,
} from "./schema";

// Base User type from schema
type FullUser = InferSelectModel<typeof users>;
type FullNewUser = InferInsertModel<typeof users>;

// Using Omit utility type to match Auth.js User type definition
export type User = Omit<FullUser, "emailVerified">;
export type NewUser = Omit<FullNewUser, "emailVerified">;

// Base types from schema

// Account types
export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

// Session types
export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;

// Verification token types
export type VerificationToken = InferSelectModel<typeof verificationTokens>;
export type NewVerificationToken = InferInsertModel<typeof verificationTokens>;

// Authenticator types
export type Authenticator = InferSelectModel<typeof authenticators>;
export type NewAuthenticator = InferInsertModel<typeof authenticators>;

// Post types
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

// Image types
export type Image = InferSelectModel<typeof images>;
export type NewImage = InferInsertModel<typeof images>;

// Plant types
export type Plant = InferSelectModel<typeof plants>;
export type NewPlant = InferInsertModel<typeof plants>;
