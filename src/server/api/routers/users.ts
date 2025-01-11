// src/server/api/routers/users.ts:
import { TRPCError } from "@trpc/server";
import { and, eq, not } from "drizzle-orm";
import { z } from "zod";
import { users } from "~/lib/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { UserRoles } from "~/types/user";
import { updateTokensSchema, userEditSchema } from "~/types/zodSchema";

export const userRouter = createTRPCRouter({
  // Get all users (public procedure)
  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    const allUsers = await ctx.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
    });

    return allUsers;
  }),

  // Get user by ID (public procedure)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        columns: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
          role: true,
        },
      });

      return user;
    }),

  // Edit user (protected procedure)
  editUser: protectedProcedure
    .input(userEditSchema)
    .mutation(async ({ ctx, input }) => {
      // Ensure the user is editing their own profile
      if (
        input.id !== ctx.session.user.id &&
        ctx.session.user.role !== UserRoles.ADMIN
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You can only edit your own profile",
        });
      }

      // Perform the update
      const updatedUser = await ctx.db
        .update(users)
        .set({
          name: input.name,
          username: input.username,
          image: input.image,
        })
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          image: users.image,
        });

      return updatedUser[0];
    }),

  // refactor method to check if username is taken by another user
  isUsernameAvailable: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        excludeOwn: z.boolean().optional().default(false), // Boolean flag for exclusion
      }),
    )
    .query(async ({ ctx, input }) => {
      const { username, excludeOwn } = input;

      // Determine the condition for excluding the current user
      const exclusionCondition = excludeOwn
        ? not(eq(users.id, ctx.session.user.id)) // Exclude current user's ID if `excludeOwn` is true
        : undefined;

      // Fetch user with matching username, applying exclusion condition if needed
      const existingUser = await ctx.db.query.users.findFirst({
        where: and(eq(users.username, username), exclusionCondition),
        columns: { id: true },
      });

      return { isUnique: !existingUser };
    }),

  updateUserTokens: protectedProcedure
    .input(updateTokensSchema)
    .mutation(async ({ ctx, input }) => {
      // Ensure the user is updating their own tokens or is an admin
      if (
        input.userId !== ctx.session.user.id &&
        ctx.session.user.role !== UserRoles.ADMIN
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You can only update your own tokens",
        });
      }

      const updatedUser = await ctx.db
        .update(users)
        .set({
          steadyAccessToken: input.accessToken,
          steadyRefreshToken: input.refreshToken,
          steadyTokenExpiresAt: new Date(Date.now() + input.expiresIn * 1000),
          steadyRefreshTokenExpiresAt: new Date(
            Date.now() + input.refreshTokenExpiresIn * 1000,
          ),
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId))
        .returning({
          id: users.id,
          steadyAccessToken: users.steadyAccessToken,
          steadyTokenExpiresAt: users.steadyTokenExpiresAt,
        });

      return updatedUser[0];
    }),
});
