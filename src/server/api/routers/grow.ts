// src/server/api/routers/grow.ts:
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { grows, images, plants } from "~/lib/db/schema";
import { connectPlantWithImagesQuery } from "~/server/api/routers/plantImages";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/trpc/init";
import { GrowsSortField } from "~/types/grow";
import { growSchema } from "~/types/zodSchema";

export const growRouter = createTRPCRouter({
  // Get paginated grows for the current user

  getOwnGrows: protectedProcedure
    .input(
      z
        .object({
          cursor: z.number().min(1).default(1).optional(),
          limit: z
            .number()
            .min(1)
            .max(PaginationItemsPerPage.MAX_DEFAULT_ITEMS)
            .default(PaginationItemsPerPage.GROWS_PER_PAGE)
            .optional(),
          sortField: z
            .nativeEnum(GrowsSortField)
            .default(GrowsSortField.CREATED_AT)
            .optional(),
          sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC).optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      // Use default values if input is not provided
      const limit = input?.limit ?? PaginationItemsPerPage.GROWS_PER_PAGE;
      const cursor = input?.cursor ?? 1;
      const sortField = input?.sortField ?? GrowsSortField.CREATED_AT;
      const sortOrder = input?.sortOrder ?? SortOrder.DESC;

      // Calculate offset based on page number
      const offset = (cursor - 1) * limit;

      // Get total count of user's grows
      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(grows)
        .where(eq(grows.ownerId, ctx.session.user.id));

      const totalCount = Number(totalCountResult[0].count);

      // Get own grows with pagination and sorting
      const userGrows = await ctx.db.query.grows.findMany({
        where: eq(grows.ownerId, ctx.session.user.id),
        orderBy: (grows, { desc, asc }) => [
          sortOrder === SortOrder.ASC
            ? asc(grows[sortField])
            : desc(grows[sortField]),
        ],
        limit: limit,
        offset: offset,
        with: {
          owner: true,
          headerImage: true,
          plants: {
            with: {
              owner: true,
              grow: true,
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
              plantImages: connectPlantWithImagesQuery,
            },
          },
        },
      });

      const nextCursor = userGrows.length === limit ? cursor + 1 : undefined;

      return {
        grows: userGrows,
        cursor: cursor,
        nextCursor: nextCursor,
        totalPages: Math.ceil(totalCount / limit),
        count: totalCount,
      };
    }),

  // Get all grows with pagination
  getAllGrows: publicProcedure
    .input(
      z.object({
        cursor: z.number().min(1).default(1),
        limit: z
          .number()
          .min(1)
          .max(PaginationItemsPerPage.MAX_DEFAULT_ITEMS)
          .default(PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE),
        sortField: z
          .nativeEnum(GrowsSortField)
          .default(GrowsSortField.UPDATED_AT),
        sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      const cursor = input.cursor;
      const sortField = input.sortField;
      const sortOrder = input.sortOrder;

      const offset = (cursor - 1) * limit;

      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(grows);

      const totalCount = Number(totalCountResult[0].count);

      const allGrows = await ctx.db.query.grows.findMany({
        orderBy: (grows, { desc, asc }) => [
          sortOrder === SortOrder.ASC
            ? asc(grows[sortField])
            : desc(grows[sortField]),
        ],
        limit: limit,
        offset: offset,
        with: {
          owner: true,
          headerImage: true,
          plants: {
            with: {
              owner: true,
              grow: true,
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
              plantImages: connectPlantWithImagesQuery,
            },
          },
        },
      });

      const nextCursor = allGrows.length === limit ? cursor + 1 : undefined;

      return {
        grows: allGrows,
        cursor: cursor,
        nextCursor: nextCursor,
        totalPages: Math.ceil(totalCount / limit),
        count: totalCount,
      };
    }),

  // Get single grow by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.grows.findFirst({
        where: eq(grows.id, input.id),
        with: {
          owner: true,
          headerImage: true,
          plants: {
            with: {
              owner: true,
              grow: true,
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
              plantImages: connectPlantWithImagesQuery,
            },
          },
        },
      });
    }),

  // connectPlant mutation with additional validation
  connectPlant: protectedProcedure
    .input(
      z.object({
        plantId: z.string(),
        growId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const grow = await ctx.db.query.grows.findFirst({
          where: eq(grows.id, input.growId),
        });
        // Verify that the grow exists
        if (!grow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Grow environment was not found.",
          });
        }
        // Verify user ownership of grow
        if (grow.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not owner of this Grow environment.",
          });
        }

        const plant = await ctx.db.query.plants.findFirst({
          where: eq(plants.id, input.plantId),
        });
        // Verify that the plant exists
        if (!plant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This Plant was not found.",
          });
        }
        // Verify user ownership of plant
        if (plant.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not owner of this Plant.",
          });
        }

        // Check if plant is already connected to another grow
        const existingPlantInGrow = await ctx.db.query.plants.findFirst({
          where: and(
            eq(plants.id, input.plantId),
            eq(plants.growId, input.growId),
          ),
        });

        if (existingPlantInGrow) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Plant is already connected to this grow environment.",
          });
        }

        // Connect plant to grow
        const updatedPlant = await ctx.db
          .update(plants)
          .set({ growId: input.growId })
          .where(eq(plants.id, input.plantId))
          .returning();

        return updatedPlant[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        // Catch any unexpected errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while connecting the plant.",
          cause: error,
        });
      }
    }),

  //  disconnectPlant mutation with additional validation
  disconnectPlant: protectedProcedure
    .input(
      z.object({
        plantId: z.string(),
        growId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const grow = await ctx.db.query.grows.findFirst({
          where: eq(grows.id, input.growId),
        });
        // Verify that the grow exists
        if (!grow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Grow environment was not found.",
          });
        }
        // Verify user ownership of grow
        if (grow.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not owner of this Grow environment.",
          });
        }

        const plant = await ctx.db.query.plants.findFirst({
          where: and(
            eq(plants.id, input.plantId),
            eq(plants.growId, input.growId),
          ),
        });
        // Verify plant is connected to this specific grow
        if (!plant) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Plant is not connected to this grow environment.",
          });
        }

        // Disconnect plant from grow
        const disconnectedPlant = await ctx.db
          .update(plants)
          .set({ growId: null })
          .where(
            and(eq(plants.id, input.plantId), eq(plants.growId, input.growId)),
          )
          .returning();

        return disconnectedPlant[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        // Catch any unexpected errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An unexpected error occurred while disconnecting the plant.",
          cause: error,
        });
      }
    }),

  createOrEdit: protectedProcedure
    .input(growSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate input (though Zod schema already does this)
        if (!input.name.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Grow name cannot be empty.",
          });
        }

        // Check for existing grow if editing
        if (input.id) {
          const existingGrow = await ctx.db.query.grows.findFirst({
            where: and(
              eq(grows.id, input.id),
              eq(grows.ownerId, ctx.session.user.id),
            ),
          });

          if (!existingGrow) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message:
                "Grow environment not found or you do not have permission to edit.",
            });
          }
        }

        // Create or update grow
        const newGrow = await ctx.db
          .insert(grows)
          .values({
            id: input.id || crypto.randomUUID(),
            name: input.name,
            ownerId: ctx.session.user.id,
          })
          .onConflictDoUpdate({
            target: grows.id,
            set: {
              name: input.name,
            },
          })
          .returning();

        return newGrow[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        // Catch any unexpected errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An unexpected error occurred while creating or editing the grow.",
          cause: error,
        });
      }
    }),

  // Update the header image for a grow
  updateHeaderImage: protectedProcedure
    .input(
      z.object({
        growId: z.string(),
        headerImageId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify grow ownership
        const grow = await ctx.db.query.grows.findFirst({
          where: eq(grows.id, input.growId),
        });

        if (!grow) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Grow environment not found.",
          });
        }

        if (grow.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not owner of this Grow environment.",
          });
        }

        // If setting to null, simply update the grow
        if (input.headerImageId === null) {
          const updatedGrow = await ctx.db
            .update(grows)
            .set({ headerImageId: null })
            .where(eq(grows.id, input.growId))
            .returning();

          return updatedGrow[0];
        }

        // Verify image exists and is owned by the user
        const image = await ctx.db.query.images.findFirst({
          where: eq(images.id, input.headerImageId),
        });

        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found.",
          });
        }

        if (image.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not owner of this image.",
          });
        }

        // Update grow with the header image
        const updatedGrow = await ctx.db
          .update(grows)
          .set({ headerImageId: input.headerImageId })
          .where(eq(grows.id, input.growId))
          .returning();

        return updatedGrow[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An unexpected error occurred while updating the header image.",
          cause: error,
        });
      }
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
} satisfies TRPCRouterRecord);
