// src/server/api/routers/grow.ts:
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { grows, plants } from "~/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { growSchema } from "~/types/zodSchema";

export const growRouter = createTRPCRouter({
  // Get paginated grows for the current user
  getOwnGrows: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(12).optional(),
          cursor: z.number().nullish().default(null).optional(), // Cursor-based pagination
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      // Access the user ID from session
      const userId = ctx.session.user.id as string;

      // Use default values if input is not provided
      const limit = input?.limit ?? 12;
      const cursor = input?.cursor ?? null;

      const userGrows = await ctx.db.query.grows.findMany({
        where: eq(grows.ownerId, userId),
        orderBy: (grows, { desc }) => [desc(grows.createdAt)],
        limit: limit + 1, // Fetch extra item to check for next page
        offset: cursor ?? 0, // Use cursor for offset
        with: {
          plants: {
            columns: {
              id: true,
              name: true,
              startDate: true,
              harvestDate: true,
            },
            with: {
              strain: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Check if there is a next page
      let nextCursor: number | null = null;
      if (userGrows.length > limit) {
        nextCursor = (cursor ?? 0) + limit;
        userGrows.pop(); // Remove the extra item
      }

      return {
        grows: userGrows,
        nextCursor,
      };
    }),

  // Get single grow by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.grows.findFirst({
        where: eq(grows.id, input.id),
        with: {
          plants: {
            with: {
              strain: true,
            },
          },
        },
      });
    }),

  // Revised connectPlant mutation with additional validation
  connectPlant: protectedProcedure
    .input(
      z.object({
        plantId: z.string(),
        growId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user ownership of both grow and plant
      const grow = await ctx.db.query.grows.findFirst({
        where: and(
          eq(grows.id, input.growId),
          eq(grows.ownerId, ctx.session.user.id as string),
        ),
      });

      const plant = await ctx.db.query.plants.findFirst({
        where: and(
          eq(plants.id, input.plantId),
          eq(plants.ownerId, ctx.session.user.id as string),
        ),
      });

      if (!grow || !plant) {
        throw new Error("Unauthorized or invalid plant/grow");
      }

      // Connect plant to grow
      return await ctx.db
        .update(plants)
        .set({ growId: input.growId })
        .where(eq(plants.id, input.plantId));
    }),

  // Revised disconnectPlant mutation
  disconnectPlant: protectedProcedure
    .input(
      z.object({
        plantId: z.string(),
        growId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user ownership
      const grow = await ctx.db.query.grows.findFirst({
        where: and(
          eq(grows.id, input.growId),
          eq(grows.ownerId, ctx.session.user.id as string),
        ),
      });

      if (!grow) {
        throw new Error("Unauthorized or invalid grow");
      }

      // Disconnect plant from grow
      return await ctx.db
        .update(plants)
        .set({ growId: null })
        .where(
          and(eq(plants.id, input.plantId), eq(plants.growId, input.growId)),
        );
    }),

  // Create or edit a grow
  createOrEdit: protectedProcedure
    .input(growSchema)
    .mutation(async ({ ctx, input }) => {
      const newGrow = await ctx.db
        .insert(grows)
        .values({
          id: input.id || crypto.randomUUID(),
          name: input.name,
          ownerId: ctx.session.user.id as string,
        })
        .onConflictDoUpdate({
          target: grows.id,
          set: {
            name: input.name,
          },
        })
        .returning();

      return newGrow[0];
    }),

  // Delete grow by ID
  deleteById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedGrow = await ctx.db
        .delete(grows)
        .where(eq(grows.id, input.id));
      return { success: !!deletedGrow };
    }),
});
