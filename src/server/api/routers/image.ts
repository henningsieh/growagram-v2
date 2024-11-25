// src/server/api/routers/image.ts:
import { TRPCError } from "@trpc/server";
import { and, count, eq, exists, not } from "drizzle-orm";
import { z } from "zod";
import cloudinary from "~/lib/cloudinary";
import { images, plantImages } from "~/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ImageSortField, SortOrder } from "~/types/image";
import { imageSchema } from "~/types/zodSchema";

export const imageRouter = createTRPCRouter({
  getOwnImages: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(12).optional(),
          page: z.number().min(1).default(1).optional(),
          sortField: z
            .nativeEnum(ImageSortField)
            .default(ImageSortField.UPLOAD_DATE)
            .optional(),
          sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC).optional(),
          filterNotConnected: z.boolean().default(false).optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      // Access the user ID from session
      const userId = ctx.session.user.id as string;
      // Use default values if input is not provided
      const limit = input?.limit ?? 12;
      const page = input?.page ?? 1;
      const sortField = input?.sortField ?? ImageSortField.UPLOAD_DATE;
      const sortOrder = input?.sortOrder ?? SortOrder.DESC;
      const filterNotConnected = input?.filterNotConnected ?? false;

      // Calculate offset based on page number
      const offset = (page - 1) * limit;

      // Base condition for both queries
      const baseCondition = eq(images.ownerId, userId);

      // Instead of using undefined, always return a condition
      const conditions = [baseCondition];
      if (filterNotConnected) {
        conditions.push(
          not(
            exists(
              ctx.db
                .select()
                .from(plantImages)
                .where(eq(plantImages.imageId, images.id)),
            ),
          ),
        );
      }

      // Get total count using Drizzle query builder
      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(images)
        .where(and(...conditions));

      const imagesList = await ctx.db.query.images.findMany({
        where: (images, { eq, and, not, exists }) => {
          const conditions = [baseCondition];

          if (filterNotConnected) {
            conditions.push(
              not(
                exists(
                  ctx.db
                    .select()
                    .from(plantImages)
                    .where(eq(plantImages.imageId, images.id)),
                ),
              ),
            );
          }

          return and(...conditions);
        },
        orderBy: (images, { desc, asc }) => [
          sortOrder === SortOrder.DESC
            ? desc(images[sortField])
            : asc(images[sortField]),
        ],
        limit: limit,
        offset: offset,
        with: {
          plantImages: {
            columns: { imageId: false, plantId: false },
            with: {
              plant: true,
            },
          },
        },
      });

      const totalCount = Number(totalCountResult[0].count);

      return {
        images: imagesList,
        total: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),

  // Get single image
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Logic to fetch a single image by ID
      const image = await ctx.db.query.images.findFirst({
        where: eq(images.id, input.id),
        with: {
          plantImages: {
            columns: { plantId: false, imageId: false },
            with: { plant: true },
          },
        },
      });

      if (!image) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Image not found",
        });
      }

      return image;
    }),

  // Connect a plant to this image
  connectPlant: protectedProcedure
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

  // Disonnect a plant to this image
  disconnectPlant: protectedProcedure
    .input(
      z.object({
        imageId: z.string(),
        plantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(plantImages)
        .where(
          and(
            eq(plantImages.imageId, input.imageId),
            eq(plantImages.plantId, input.plantId),
          ),
        );
    }),

  /**
   * Uploads an image.
   *
   * @see {@link ./src/server/actions/uploadImages.ts#L141}
   */

  // Create Image
  createImage: protectedProcedure
    .input(imageSchema)
    .mutation(async ({ ctx, input }) => {
      // Save image record to database

      console.debug("captureDate: ", input.captureDate);

      const newImage = await ctx.db
        .insert(images)
        .values({
          id: input.id,
          ownerId: ctx.session.user.id as string,
          imageUrl: input.imageUrl,
          cloudinaryAssetId: input.cloudinaryAssetId,
          cloudinaryPublicId: input.cloudinaryPublicId,
          captureDate: input.captureDate,
          originalFilename: input.originalFilename,
        })
        // .onConflictDoUpdate() // ToDo!!!
        .returning();

      if (!newImage) {
        throw new Error("Failed to save image record");
      }

      return newImage;
    }),

  // Delete image
  deleteImage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First, fetch the image to get its URL
        const image = await ctx.db.query.images.findFirst({
          where: eq(images.id, input.id),
        });

        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }

        // Verify ownership
        if (image.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this image",
          });
        }

        // Delete from Cloudinary
        const deleteResult = (await cloudinary.uploader.destroy(
          image.cloudinaryPublicId,
        )) as { result: string };

        if (deleteResult.result !== "ok") {
          throw new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: "Failed delete image from Cloudinary",
          });
        }

        // Delete from database
        const deletedImage = await ctx.db
          .delete(images)
          .where(eq(images.id, input.id))
          .returning();

        if (!deletedImage || deletedImage.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete image from database",
          });
        }

        return {
          success: true,
          deletedImage: deletedImage[0],
        };
      } catch (error) {
        // Log the error for debugging
        console.error("Error deleting image:", error);

        // If it's already a TRPCError, rethrow it
        if (error instanceof TRPCError) {
          throw error;
        }

        // Otherwise, wrap it in a TRPCError
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete image",
          cause: error,
        });
      }
    }),
});
