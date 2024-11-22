// src/server/api/routers/image.ts:
import { eq } from "drizzle-orm";
import { z } from "zod";
import { plants } from "~/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { plantSchema } from "~/types/zodSchema";

import { imageRouter } from "./image";

const connectPlant__imported_from_imageRouter = imageRouter.connectPlant;

export const plantRouter = createTRPCRouter({
  // Get paginated plants for the current user
  getOwnPlants: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(12).optional(),
          cursor: z.number().nullish().default(null).optional(), // Cursor-based pagination
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string;

      // Use default values if input is not provided
      const limit = input?.limit ?? 12;
      const cursor = input?.cursor ?? null;

      const userPlants = await ctx.db.query.plants.findMany({
        where: eq(plants.ownerId, userId),
        orderBy: (plants, { desc }) => [desc(plants.createdAt)],
        limit: limit + 1, // Fetch extra item to check for next page
        offset: cursor ?? 0, // Use cursor for offset
        with: {
          strain: {
            columns: {
              id: true,
              name: true,
              thcContent: true,
              cbdContent: true,
            },
            with: { breeder: { columns: { id: true, name: true } } },
          },
          headerImage: { columns: { id: true, imageUrl: true } },
          plantImages: {
            columns: { imageId: false, plantId: false },
            with: {
              image: {
                columns: {
                  id: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      // Check if there is a next page
      let nextCursor: number | null = null;
      if (userPlants.length > limit) {
        nextCursor = (cursor ?? 0) + limit;
        userPlants.pop(); // Remove the extra item
      }

      return {
        plants: userPlants,
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
        with: {
          plantImages: {
            with: {
              image: true,
            },
          },
        },
      });
    }),

  // Connect an image to plant
  connectImage: connectPlant__imported_from_imageRouter,

  // Create a plant
  createOrEdit: protectedProcedure
    .input(plantSchema)
    .mutation(async ({ ctx, input }) => {
      // Logic to handle image creation
      const newPlant = await ctx.db
        .insert(plants)
        .values({
          id: input.id,
          name: input.name,
          ownerId: ctx.session.user.id as string,
          startDate: input.startDate,
          seedlingPhaseStart: input.seedlingPhaseStart,
          vegetationPhaseStart: input.vegetationPhaseStart,
          floweringPhaseStart: input.floweringPhaseStart,
          harvestDate: input.harvestDate,
          curingPhaseStart: input.curingPhaseStart,
        })
        .onConflictDoUpdate({
          target: plants.id,
          set: {
            name: input.name,
            // ownerId: ctx.session.user.id as string,
            startDate: input.startDate,
            seedlingPhaseStart: input.seedlingPhaseStart,
            vegetationPhaseStart: input.vegetationPhaseStart,
            floweringPhaseStart: input.floweringPhaseStart,
            harvestDate: input.harvestDate,
            curingPhaseStart: input.curingPhaseStart,
          },
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
