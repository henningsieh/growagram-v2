// src/server/api/routers/plant.ts:
import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { plantImages, plants } from "~/lib/db/schema";
import { connectPlantWithImagesQuery } from "~/server/api/routers/plantImages";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { PlantsSortField } from "~/types/plant";
import { plantFormSchema } from "~/types/zodSchema";

export const plantRouter = createTRPCRouter({
  // Get paginated plants for the current user
  getOwnPlants: protectedProcedure
    .input(
      z
        .object({
          cursor: z.number().min(1).default(1).optional(),
          limit: z
            .number()
            .min(1)
            .max(100)
            .default(PaginationItemsPerPage.PLANTS_PER_PAGE)
            .optional(),
          sortField: z
            .nativeEnum(PlantsSortField)
            .default(PlantsSortField.CREATED_AT)
            .optional(),
          sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC).optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      // Use default values if input is not provided
      const limit = input?.limit ?? PaginationItemsPerPage.GROWS_PER_PAGE;
      const cursor = input?.cursor ?? 1;
      const sortField = input?.sortField ?? PlantsSortField.CREATED_AT;
      const sortOrder = input?.sortOrder ?? SortOrder.DESC;

      // Calculate offset based on page number
      const offset = (cursor - 1) * limit;

      // Get total count of user's grows
      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(plants)
        .where(eq(plants.ownerId, ctx.session.user.id));

      const totalCount = Number(totalCountResult[0].count);

      // Get own plants with pagination and sorting
      const userPlants = await ctx.db.query.plants.findMany({
        where: eq(plants.ownerId, ctx.session.user.id),
        orderBy: (plants, { desc, asc }) => [
          sortOrder === SortOrder.ASC
            ? asc(plants[sortField])
            : desc(plants[sortField]),
        ],
        offset: offset,
        limit: limit,
        with: {
          owner: true,
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
          headerImage: { columns: { id: true, imageUrl: true } },
        },
      });

      const nextCursor = userPlants.length === limit ? cursor + 1 : undefined;

      return {
        plants: userPlants,
        cursor: cursor,
        nextCursor: nextCursor,
        totalPages: Math.ceil(totalCount / limit),
        count: totalCount,
      };
    }),

  // Get single plant
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Logic to fetch a single image by ID
      const plant = await ctx.db.query.plants.findFirst({
        where: eq(plants.id, input.id),
        with: {
          owner: true,
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
          headerImage: { columns: { id: true, imageUrl: true } },
        },
      });

      // Sort the `plantImages.image` array by `captureDate`
      if (plant?.plantImages) {
        plant.plantImages = plant.plantImages.sort((a, b) => {
          const dateA = a.image?.captureDate
            ? new Date(a.image.captureDate)
            : new Date(0);
          const dateB = b.image?.captureDate
            ? new Date(b.image.captureDate)
            : new Date(0);
          return dateA.getTime() - dateB.getTime(); // Ascending order
        });
      }
      return plant;
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
