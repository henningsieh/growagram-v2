// src/server/api/routers/plant.ts:
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { plantImages, plants } from "~/lib/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { plantFormSchema } from "~/types/zodSchema";

export const plantRouter = createTRPCRouter({
  // Get paginated plants for the current user
  getOwnPlants: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(12).optional(),
          cursor: z.number().nullish().default(null).optional(), // Cursor-based pagination
        })
        .optional(), // Make the entire input object optional
    )
    .query(async ({ ctx, input }) => {
      // Use default values if input is not provided
      const limit = input?.limit ?? 12;
      const cursor = input?.cursor ?? null;

      const userPlants = await ctx.db.query.plants.findMany({
        where: eq(plants.ownerId, ctx.session.user.id),
        orderBy: (plants, { desc }) => [desc(plants.createdAt)],
        limit: limit + 1, // Fetch extra item to check for next page
        offset: cursor ?? 0, // Use cursor for offset
        with: {
          owner: true,
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
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Logic to fetch a single image by ID
      return await ctx.db.query.plants.findFirst({
        where: eq(plants.id, input.id),
        with: {
          owner: true,
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
    }),

  // Connect plant to an image
  connectToImage: protectedProcedure
    .input(
      z.object({
        imageId: z.string(),
        plantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .insert(plantImages)
        .values({
          imageId: input.imageId,
          plantId: input.plantId,
        })
        .onConflictDoNothing();
    }),

  // Create or edit a plant
  createOrEdit: protectedProcedure
    .input(plantFormSchema)
    .mutation(async ({ ctx, input }) => {
      // If an existing plant ID is specified, check the existence
      // of the plant and the ownership of the current user
      if (input.id !== undefined && typeof input.id === "string") {
        const owenerid = input.id;
        const existingPlant = await ctx.db.query.plants.findFirst({
          where: (plants, { eq }) => eq(plants.id, owenerid),
        });

        // Throw a TRPC not found error if the plant doesn't exist
        if (!existingPlant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Plant not found",
          });
        }

        // Throw a TRPC unauthorized error if the current user is not the owner
        if (existingPlant.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Session user does not own this plant",
          });
        }
      }

      // Logic to handle image creation
      const newPlant = await ctx.db
        .insert(plants)
        .values({
          id: input.id || crypto.randomUUID(),
          name: input.name,
          ownerId: ctx.session.user.id,
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
            // ownerId: ctx.session.user.id, // no owner change onUpdate!
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
