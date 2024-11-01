// src/app/api/users/route.ts
import { db } from "~/lib/db";
import { users } from "~/lib/db/schema";
import { type ApiResponse, type User } from "~/types";

export async function GET(): Promise<ApiResponse<User[]>> {
  const allUsers = await db.select().from(users);
  return {
    data: allUsers,
    status: 200,
  };
}
