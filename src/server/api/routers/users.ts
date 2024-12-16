// src/server/api/routers/users.ts:
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "~/lib/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { UserRoles } from "~/types/user";
import { userEditSchema } from "~/types/zodSchema";

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
});
