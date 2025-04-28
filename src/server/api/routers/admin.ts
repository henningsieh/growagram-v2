// src/server/api/routers/admin.ts
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { BAN_DURATIONS } from "~/assets/constants";
import { users } from "~/lib/db/schema";
import { adminProcedure, createTRPCRouter } from "~/trpc/init";
import { UserRoles } from "~/types/user";
import { adminEditUserSchema } from "~/types/zodSchema";

export const adminRouter = createTRPCRouter({
  // Get all users with pagination
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    const allUsers = await ctx.db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      columns: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        emailVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        bannedUntil: true,
        banReason: true,
      },
    });

    return allUsers;
  }),

  // Get user by ID
  getUserById: adminProcedure
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
          emailVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          bannedUntil: true,
          banReason: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  // Update user details
  updateUserDetails: adminProcedure
    .input(adminEditUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Cannot demote yourself from admin
      if (input.id === ctx.session.user.id && input.role !== UserRoles.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot demote yourself from admin role",
        });
      }

      const updatedUser = await ctx.db
        .update(users)
        .set({
          name: input.name,
          username: input.username,
          email: input.email,
          role: input.role,
          image: input.image,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          role: users.role,
          image: users.image,
        });

      if (!updatedUser.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return updatedUser[0];
    }),

  // Update user role
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum([UserRoles.ADMIN, UserRoles.MOD, UserRoles.USER]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Cannot demote yourself
      if (
        input.userId === ctx.session.user.id &&
        input.role !== UserRoles.ADMIN
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot demote yourself from admin role",
        });
      }

      const updatedUser = await ctx.db
        .update(users)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId))
        .returning({
          id: users.id,
          role: users.role,
        });

      if (!updatedUser.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return updatedUser[0];
    }),

  // Ban a user
  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        banDuration: z.string(),
        banReason: z.string().min(3).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Cannot ban yourself
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot ban yourself",
        });
      }

      // Cannot ban other admins
      const targetUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        columns: {
          role: true,
        },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if ((targetUser.role as UserRoles) === UserRoles.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot ban an administrator",
        });
      }

      // Find the ban duration in milliseconds
      const banDurationOption = BAN_DURATIONS.find(
        (duration) => duration.value === input.banDuration,
      );

      if (!banDurationOption) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid ban duration",
        });
      }

      // Calculate ban end date (or null for permanent ban)
      let bannedUntil = null;
      if (banDurationOption.milliseconds > 0) {
        bannedUntil = new Date(Date.now() + banDurationOption.milliseconds);
      }

      // Update the user
      const updatedUser = await ctx.db
        .update(users)
        .set({
          bannedUntil,
          banReason: input.banReason,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId))
        .returning({
          id: users.id,
          bannedUntil: users.bannedUntil,
          banReason: users.banReason,
        });

      if (!updatedUser.length) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to ban user",
        });
      }

      return updatedUser[0];
    }),

  // Unban a user
  unbanUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db
        .update(users)
        .set({
          bannedUntil: null,
          banReason: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId))
        .returning({
          id: users.id,
          bannedUntil: users.bannedUntil,
          banReason: users.banReason,
        });

      if (!updatedUser.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return updatedUser[0];
    }),
} satisfies TRPCRouterRecord);
