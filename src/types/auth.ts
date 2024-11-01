// src/types/auth.ts
import type { User } from "../lib/db/types";

export type AuthUser = User & {
  isAdmin?: boolean;
  // ... other auth-specific extensions
};
