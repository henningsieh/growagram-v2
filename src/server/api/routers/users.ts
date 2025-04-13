// src/server/api/routers/users.ts:
import { TRPCError } from "@trpc/server";
import { and, eq, not } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "~/lib/auth/password";
import { userFollows, users, verificationTokens } from "~/lib/db/schema";
import { createNotification } from "~/lib/notifications";
import { sendVerificationEmail } from "~/server/actions/sendVerificationEmail";
import { connectPlantWithImagesQuery } from "~/server/api/routers/plantImages";
import { protectedProcedure, publicProcedure } from "~/server/api/trpc";
import {
  NotifiableEntityType,
  NotificationEventType,
} from "~/types/notification";
import { UserRoles } from "~/types/user";
import {
  createRegisterSchema,
  updateTokensSchema,
  userEditSchema,
} from "~/types/zodSchema";

// Fake translation function for server-side use of translated ZOD schema messages
const outsideReactT = (key: string) => key; // Just returns the key, or provide basic English messages

export const userRouter = {
  // Get public user data by user id (public procedure)
  getPublicUserProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
        columns: {
          id: true,
          name: true,
          image: true,
          username: true,
          role: true,
        },
        with: {
          followers: {
            with: {
              follower: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                  username: true,
                },
              },
            },
          },
          following: {
            with: {
              following: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                  username: true,
                },
              },
            },
          },
          grows: {
            with: {
              owner: true,
              headerImage: true,
              plants: {
                with: {
                  owner: true,
                  grow: true,
                  headerImage: { columns: { id: true, imageUrl: true } },
                  plantImages: connectPlantWithImagesQuery,
                  strain: {
                    columns: {
                      id: true,
                      name: true,
                      thcContent: true,
                      cbdContent: true,
                    },
                    with: { breeder: { columns: { id: true, name: true } } },
                  },
                },
              },
            },
          },
          plants: {
            with: {
              owner: true,
              grow: true,
              headerImage: { columns: { id: true, imageUrl: true } },
              plantImages: connectPlantWithImagesQuery,
              strain: {
                columns: {
                  id: true,
                  name: true,
                  thcContent: true,
                  cbdContent: true,
                },
                with: { breeder: { columns: { id: true, name: true } } },
              },
            },
          },
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

  // Get user by ID (public procedure)
  getOwnUserData: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      with: {},
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
  isUsernameAvailable: publicProcedure
    .input(
      z.object({
        username: z.string(),
        excludeOwn: z.boolean().optional().default(false), // Boolean flag for exclusion
      }),
    )
    .query(async ({ ctx, input }) => {
      const { username: username, excludeOwn } = input;

      // Determine the condition for excluding the current user
      const exclusionCondition =
        ctx.session && excludeOwn
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

  // Register user (public procedure)
  registerUser: publicProcedure
    .input(createRegisterSchema(outsideReactT))
    .mutation(async ({ ctx, input }) => {
      try {
        const [existingEmail, existingUsername] = await Promise.all([
          ctx.db.query.users.findFirst({
            where: eq(users.email, input.email),
          }),
          ctx.db.query.users.findFirst({
            where: eq(users.username, input.username),
          }),
        ]);

        if (existingEmail && existingUsername) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "BOTH_TAKEN",
          });
        } else if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "EMAIL_TAKEN",
          });
        } else if (existingUsername) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "USERNAME_TAKEN",
          });
        }

        const hashedPassword = await hashPassword(input.password);

        const newUser = await ctx.db
          .insert(users)
          .values({
            email: input.email,
            passwordHash: hashedPassword,
            username: input.username,
            name: input.name,
          })
          .returning({
            id: users.id,
            email: users.email,
            username: users.username,
            name: users.name,
          });

        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        const verificationToken = Array.from(randomBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        await ctx.db.insert(verificationTokens).values({
          identifier: newUser[0]?.email as string,
          token: verificationToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        await sendVerificationEmail(
          newUser[0]?.email as string,
          verificationToken,
          input.locale,
        );

        return newUser[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        // Handle unexpected errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        });
      }
    }),

  followUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const follow = await ctx.db
        .insert(userFollows)
        .values({
          followerId: ctx.session.user.id,
          followingId: input.userId,
        })
        .returning();

      await createNotification({
        notificationEventType: NotificationEventType.NEW_FOLLOW,
        notifiableEntity: {
          type: NotifiableEntityType.USER,
          // user being followed AND notified
          id: input.userId,
        },
        actorData: {
          id: ctx.session.user.id,
          name: ctx.session.user.name,
          username: ctx.session.user.username ?? null,
          image: ctx.session.user.image ?? null,
        },
      });

      return follow[0];
    }),

  unfollowUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(userFollows)
        .where(
          and(
            eq(userFollows.followerId, ctx.session.user.id),
            eq(userFollows.followingId, input.userId),
          ),
        );
    }),
};
