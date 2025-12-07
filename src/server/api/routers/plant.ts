// src/server/api/routers/plant.ts:
import { TRPCError } from "@trpc/server";
import { and, count, eq, ilike, isNull, lt, or } from "drizzle-orm";
import { z } from "zod";

import { SortOrder } from "~/components/atom/sort-filter-controls";

import { connectPlantWithImagesQuery } from "~/server/api/routers/plantImages";

import { PlantsSortField } from "~/types/plant";
import {
  breederFormSchema,
  plantExplorationSchema,
  plantFormSchema,
  strainFormSchema,
} from "~/types/zodSchema";

import {
  breeders,
  cannabisStrains,
  grows,
  plantImages,
  plants,
} from "~/lib/db/schema";
import { protectedProcedure, publicProcedure } from "~/lib/trpc/init";

import { PaginationItemsPerPage } from "~/assets/constants";

export const plantRouter = {
  // Get paginated plants for the current user
  getOwnPlants: protectedProcedure
    .input(
      z
        .object({
          cursor: z.number().min(1).default(1).optional(),
          limit: z
            .number()
            .min(1)
            .max(PaginationItemsPerPage.MAX_DEFAULT_ITEMS)
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
          grow: true,
          plantImages: connectPlantWithImagesQuery,
          strain: {
            columns: {
              id: true,
              name: true,
              strainType: true,
              geneticsType: true,
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

  // Get "connectable" plants
  getConnectablePlants: protectedProcedure
    .input(z.object({ growId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const connectablePlants = await ctx.db.query.plants.findMany({
        where: and(
          eq(plants.ownerId, ctx.session.user.id),
          or(
            input.growId ? eq(plants.growId, input.growId) : undefined,
            isNull(plants.growId),
          ),
        ),
        with: {
          owner: true,
          grow: true,
          plantImages: connectPlantWithImagesQuery,
          strain: {
            columns: {
              id: true,
              name: true,
              strainType: true,
              geneticsType: true,
              thcContent: true,
              cbdContent: true,
            },
            with: { breeder: { columns: { id: true, name: true } } },
          },
          headerImage: { columns: { id: true, imageUrl: true } },
        },
      });

      return {
        plants: connectablePlants,
      };
    }),

  // Get all plants with pagination
  getAllPlants: publicProcedure
    .input(
      z.object({
        cursor: z.number().min(1).default(1).optional(),
        limit: z
          .number()
          .min(1)
          .max(1000)
          .default(PaginationItemsPerPage.PLANTS_PER_PAGE)
          .optional(),
        sortField: z
          .nativeEnum(PlantsSortField)
          .default(PlantsSortField.CREATED_AT)
          .optional(),
        sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? PaginationItemsPerPage.PLANTS_PER_PAGE;
      const cursor = input?.cursor ?? 1;
      const sortField = input?.sortField ?? PlantsSortField.CREATED_AT;
      const sortOrder = input?.sortOrder ?? SortOrder.DESC;

      const offset = (cursor - 1) * limit;

      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(plants);

      const totalCount = Number(totalCountResult[0].count);

      const allPlants = await ctx.db.query.plants.findMany({
        orderBy: (plants, { desc, asc }) => [
          sortOrder === SortOrder.ASC
            ? asc(plants[sortField])
            : desc(plants[sortField]),
        ],
        limit: limit,
        offset: offset,
        with: {
          owner: true,
          grow: true,
          plantImages: connectPlantWithImagesQuery,
          strain: {
            columns: {
              id: true,
              name: true,
              strainType: true,
              geneticsType: true,
              thcContent: true,
              cbdContent: true,
            },
            with: { breeder: { columns: { id: true, name: true } } },
          },
          headerImage: { columns: { id: true, imageUrl: true } },
        },
      });

      const nextCursor = allPlants.length === limit ? cursor + 1 : undefined;

      return {
        plants: allPlants,
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
          grow: true,
          plantImages: connectPlantWithImagesQuery,
          strain: {
            columns: {
              id: true,
              name: true,
              strainType: true,
              geneticsType: true,
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
        const plantId = input.id;
        const existingPlant = await ctx.db.query.plants.findFirst({
          where: (plants, { eq }) => eq(plants.id, plantId),
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

      const [plant] = await ctx.db
        // Logic to create a plant
        .insert(plants)
        .values({
          id: input.id || crypto.randomUUID(),
          name: input.name,
          growId: input.growId,
          strainId: input.strainId,
          ownerId: ctx.session.user.id,
          startDate: input.startDate,
          seedlingPhaseStart: input.seedlingPhaseStart,
          vegetationPhaseStart: input.vegetationPhaseStart,
          floweringPhaseStart: input.floweringPhaseStart,
          harvestDate: input.harvestDate,
          curingPhaseStart: input.curingPhaseStart,
        })
        // Logic to edit a plant
        .onConflictDoUpdate({
          target: plants.id,
          set: {
            name: input.name,
            growId: input.growId,
            strainId: input.strainId,
            startDate: input.startDate,
            seedlingPhaseStart: input.seedlingPhaseStart,
            vegetationPhaseStart: input.vegetationPhaseStart,
            floweringPhaseStart: input.floweringPhaseStart,
            harvestDate: input.harvestDate,
            curingPhaseStart: input.curingPhaseStart,
          },
        })
        .returning();

      // If plant is connected to a grow, update the grow's updatedAt timestamp
      if (plant.growId) {
        await ctx.db
          .update(grows)
          .set({
            updatedAt: new Date(),
          })
          .where(eq(grows.id, plant.growId));
      }

      return plant;
    }),

  // Delete plant
  deleteById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // check if the plant exists and the current user is the owner
      const plant = await ctx.db.query.plants.findFirst({
        where: (plants, { eq }) => eq(plants.id, input.id),
      });

      if (!plant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plant not found",
        });
      }

      if (plant.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Session user does not own this plant",
        });
      }

      // Logic to delete an plant by ID
      const deletedImage = await ctx.db
        .delete(plants)
        .where(eq(plants.id, input.id));
      return { success: !!deletedImage };
    }),

  // Get breeders with optional search filtering
  getBreeders: publicProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(50).optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const search = input?.search;
      const limit = input?.limit ?? 50;

      // If no search term provided, return empty array to encourage search usage
      if (!search || search.length < 3) {
        return [];
      }

      const searchTerm = `%${search}%`;

      const filteredBreeders = await ctx.db.query.breeders.findMany({
        where: (breeders, { ilike }) => ilike(breeders.name, searchTerm),
        orderBy: (breeders, { asc }) => [asc(breeders.name)],
        limit: limit,
      });

      return filteredBreeders;
    }),

  // Get strain by id
  getStrainById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const strain = await ctx.db.query.cannabisStrains.findFirst({
        where: eq(cannabisStrains.id, input.id),
        columns: {
          id: true,
          name: true,
          strainType: true,
          geneticsType: true,
          thcContent: true,
          cbdContent: true,
        },
        with: {
          breeder: {
            columns: { id: true, name: true },
          },
        },
      });

      return strain;
    }),

  // Get strains by breeder
  getStrainsByBreeder: publicProcedure
    .input(
      z.object({
        breederId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.breederId) {
        return [];
      }

      const breederStrains = await ctx.db.query.cannabisStrains.findMany({
        where: eq(cannabisStrains.breederId, input.breederId),
        orderBy: (strains, { asc }) => [asc(strains.name)],
      });

      return breederStrains;
    }),

  // Create a new breeder
  createBreeder: protectedProcedure
    .input(breederFormSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const newBreeder = await ctx.db
          .insert(breeders)
          .values({
            id: crypto.randomUUID(),
            name: input.name,
          })
          .returning();

        return newBreeder[0];
      } catch (error) {
        // Handle database constraint errors
        if (error instanceof Error) {
          // Check for unique constraint violation on name
          if (
            error.message.includes("unique constraint") &&
            error.message.toLowerCase().includes("breeder_name_unique_idx")
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message: `Breeder with name "${input.name}" already exists`,
            });
          }
        }
        // Re-throw other errors
        throw error;
      }
    }),

  // Create a new strain
  createStrain: protectedProcedure
    .input(strainFormSchema)
    .mutation(async ({ ctx, input }) => {
      const newStrain = await ctx.db
        .insert(cannabisStrains)
        .values({
          id: crypto.randomUUID(),
          name: input.name,
          breederId: input.breederId,
          thcContent: input.thcContent,
          cbdContent: input.cbdContent,
          strainType: input.strainType,
          geneticsType: input.geneticsType,
        })
        .returning();

      return newStrain[0];
    }),

  // Explore plants with filtering capabilities
  explore: publicProcedure
    .input(plantExplorationSchema)
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const cursor = input.cursor;

      // Build where conditions dynamically
      const whereConditions = [];

      if (input.growthStage) {
        // For now, simple filtering by existence of phase dates
        // TODO: Implement proper date-based growth stage detection
        switch (input.growthStage) {
          case "seedling":
            whereConditions.push(isNull(plants.seedlingPhaseStart));
            break;
          case "vegetation":
            whereConditions.push(
              and(
                eq(plants.seedlingPhaseStart, plants.seedlingPhaseStart), // Not null
                isNull(plants.floweringPhaseStart),
              ),
            );
            break;
          case "flowering":
            whereConditions.push(
              and(
                eq(plants.floweringPhaseStart, plants.floweringPhaseStart), // Not null
                isNull(plants.harvestDate),
              ),
            );
            break;
          case "harvested":
            whereConditions.push(
              and(
                eq(plants.harvestDate, plants.harvestDate), // Not null
                isNull(plants.curingPhaseStart),
              ),
            );
            break;
          case "curing":
            whereConditions.push(
              eq(plants.curingPhaseStart, plants.curingPhaseStart), // Not null
            );
            break;
        }
      }

      if (input.ownerId) {
        whereConditions.push(eq(plants.ownerId, input.ownerId));
      }

      // Apply cursor pagination if cursor is provided
      if (cursor) {
        whereConditions.push(lt(plants.createdAt, new Date(cursor)));
      }

      // Add search functionality if search term is provided
      if (input.search) {
        const searchTerm = `%${input.search}%`;
        whereConditions.push(ilike(plants.name, searchTerm));
      }

      // Filter by strain characteristics if provided
      if (input.strainType || input.geneticsType) {
        const strainFilters = [];
        if (input.strainType) {
          strainFilters.push(eq(cannabisStrains.strainType, input.strainType));
        }
        if (input.geneticsType) {
          strainFilters.push(
            eq(cannabisStrains.geneticsType, input.geneticsType),
          );
        }
        // This will be handled through the relation join
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      try {
        // Get filtered plants with cursor-based pagination
        const filteredPlants = await ctx.db.query.plants.findMany({
          where: whereClause,
          orderBy: (plants, { desc }) => [desc(plants.createdAt)],
          limit: limit + 1, // Get one extra to determine if there's a next page
          with: {
            owner: {
              columns: {
                id: true,
                username: true,
                email: true,
                image: true,
                createdAt: true,
              },
            },
            grow: {
              columns: {
                id: true,
                name: true,
                environment: true,
                cultureMedium: true,
              },
            },
            strain: {
              columns: {
                id: true,
                name: true,
                strainType: true,
                geneticsType: true,
                thcContent: true,
                cbdContent: true,
              },
              with: {
                breeder: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
              // Apply strain filters here if needed
              ...(input.strainType || input.geneticsType
                ? {
                    where: and(
                      ...[
                        input.strainType
                          ? eq(cannabisStrains.strainType, input.strainType)
                          : undefined,
                        input.geneticsType
                          ? eq(cannabisStrains.geneticsType, input.geneticsType)
                          : undefined,
                      ].filter(Boolean),
                    ),
                  }
                : {}),
            },
            headerImage: {
              columns: {
                id: true,
                imageUrl: true,
              },
            },
            plantImages: connectPlantWithImagesQuery,
          },
        });

        // Determine if there's a next page and prepare cursor
        const hasNextPage = filteredPlants.length > limit;
        const items = hasNextPage
          ? filteredPlants.slice(0, -1)
          : filteredPlants;
        const nextCursor = hasNextPage
          ? items[items.length - 1]?.createdAt.toISOString()
          : null;

        // Get total count for the filtered results
        const totalCountResult = await ctx.db
          .select({ count: count() })
          .from(plants)
          .where(whereClause);

        const totalCount = Number(totalCountResult[0]?.count ?? 0);

        return {
          plants: items,
          nextCursor,
          hasNextPage,
          totalCount,
          meta: {
            appliedFilters: {
              growthStage: input.growthStage,
              strainType: input.strainType,
              geneticsType: input.geneticsType,
              ownerId: input.ownerId,
              search: input.search,
            },
            pagination: {
              limit,
              cursor,
              hasNextPage,
              totalCount,
            },
          },
        };
      } catch (error) {
        console.error("Error in plants.explore:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch plants. Please try again.",
        });
      }
    }),
};
