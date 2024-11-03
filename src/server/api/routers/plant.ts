// src/server/api/routers/image.ts:
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { plants } from "../../../lib/db/schema";
import { GetUserImagesInput } from "../root";

// Import the plants schema correctly

export const plantRouter = createTRPCRouter({
  // Get paginated plants for the current user
  getUserPlants: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(9),
        cursor: z.number().nullish(), // Cursor-based pagination
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string; // Access the user ID from session

      // Query the database for plants owned by the user, ordered by creation date
      const plantssList = await ctx.db.query.plants.findMany({
        where: eq(plants.ownerId, userId),
        orderBy: (plants, { desc }) => [desc(plants.createdAt)],
        limit: input.limit + 1, // Fetch one extra item to check if there's a next page
        offset: input.cursor ?? 0,
      });

      // Check if there is a next page
      let nextCursor: number | null = null;
      if (plantssList.length > input.limit) {
        nextCursor = (input.cursor ?? 0) + input.limit;
        plantssList.pop(); // Remove the extra item
      }

      return {
        plants: plantssList,
        nextCursor,
      };
    }),

  // Get single plant
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Logic to fetch a single image by ID
      return await ctx.db.query.plants.findFirst({
        where: eq(plants.id, input.id),
      });
    }),

  // Create a plant
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Logic to handle image creation
      const newPlant = await ctx.db.insert(plants).values({
        name: input.name,
        ownerId: ctx.session.user.id as string,
      });

      return newPlant;
    }),

  // Delete plant
  deleteById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Logic to delete an plant by ID
      const deletedImage = await ctx.db
        .delete(plants)
        .where(eq(plants.id, input.id));
      return { success: !!deletedImage };
    }),
});
