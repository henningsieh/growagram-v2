// src/types/api.ts
import type { Post, User } from "../lib/db/types";

export type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};

export type UserResponse = ApiResponse<User>;
export type PostResponse = ApiResponse<Post>;
