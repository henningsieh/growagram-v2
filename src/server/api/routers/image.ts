// src/server/api/routers/image.ts:
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  NotFound,
} from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { and, count, eq, exists, not } from "drizzle-orm";
import { z } from "zod";
import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { env } from "~/env";
import cloudinary from "~/lib/cloudinary";
import { images, plantImages } from "~/lib/db/schema";
import { s3Client } from "~/lib/minio";
import { connectImageWithPlantsQuery } from "~/server/api/routers/plantImages";
import { protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { PhotosSortField } from "~/types/image";
import { imageSchema } from "~/types/zodSchema";

export const photoRouter = {
  getOwnPhotos: protectedProcedure
    .input(
      z
        .object({
          cursor: z.number().min(1).default(1).optional(),
          limit: z
            .number()
            .min(1)
            .max(PaginationItemsPerPage.MAX_DEFAULT_ITEMS)
            .default(PaginationItemsPerPage.PHOTOS_PER_PAGE)
            .optional(),
          sortField: z
            .nativeEnum(PhotosSortField)
            .default(PhotosSortField.UPLOAD_DATE)
            .optional(),
          sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC).optional(),
          filterNotConnected: z.boolean().default(false).optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      // Use default values if input is not provided
      const limit = input?.limit ?? 12;
      const cursor = input?.cursor ?? 1;
      const sortField = input?.sortField ?? PhotosSortField.UPLOAD_DATE;
      const sortOrder = input?.sortOrder ?? SortOrder.DESC;
      const filterNotConnected = input?.filterNotConnected ?? false;

      // Calculate offset based on page number
      const offset = (cursor - 1) * limit;

      // Base condition for both queries
      const isOwnImageCondition = eq(images.ownerId, ctx.session.user.id);

      // Additional condition for filtering unconnected images
      const isNewImageCondition = filterNotConnected
        ? not(
            exists(
              ctx.db
                .select()
                .from(plantImages)
                .where(eq(plantImages.imageId, images.id)),
            ),
          )
        : undefined;

      // Get total count using Drizzle query builder
      const [totalCountResult] = await ctx.db
        .select({ count: count() })
        .from(images)
        .where(
          isNewImageCondition
            ? and(isOwnImageCondition, isNewImageCondition)
            : isOwnImageCondition,
        );
      const totalCount = Number(totalCountResult?.count);

      // Get the images with pagination, sorting, and filtering
      const imagesList = await ctx.db.query.images.findMany({
        offset: offset,
        limit: limit,
        where: (images, { eq, and, not, exists }) => {
          const conditions = [isOwnImageCondition];

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
        with: {
          owner: true,
          posts: true,
          plantImages: connectImageWithPlantsQuery,
        },
      });

      const nextCursor = imagesList.length === limit ? cursor + 1 : undefined;

      return {
        images: imagesList,
        cursor: cursor,
        nextCursor: nextCursor,
        total: Math.ceil(totalCount / limit),
        count: totalCount,
      };
    }),

  // Get single image
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Logic to fetch a single image by ID
      const image = await ctx.db.query.images.findFirst({
        where: eq(images.id, input.id),
        with: {
          owner: true,
          posts: true,
          plantImages: connectImageWithPlantsQuery,
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

  // Connect image to a plant
  connectToPlant: protectedProcedure
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

  // Disonnect image from a plant
  disconnectFromPlant: protectedProcedure
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
  createPhoto: protectedProcedure
    .input(imageSchema)
    .mutation(async ({ ctx, input }) => {
      // Save image record to database
      const newImage = await ctx.db
        .insert(images)
        .values({
          id: input.id,
          ownerId: ctx.session.user.id,
          imageUrl: input.imageUrl,
          cloudinaryAssetId: input.cloudinaryAssetId,
          cloudinaryPublicId: input.cloudinaryPublicId,
          s3Key: input.s3Key,
          s3ETag: input.s3ETag,
          captureDate: input.captureDate,
          originalFilename: input.originalFilename,
        })
        // .onConflictDoUpdate() // TODO: ?
        .returning();

      if (!newImage) {
        throw new Error("Failed to save image record");
      }

      return newImage;
    }),

  // Delete image
  deletePhoto: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First, fetch the image to get its URL
        const image = await ctx.db.query.images.findFirst({
          where: eq(images.id, input.id),
          with: {
            posts: true,
          },
        });

        if (!image) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Image not found",
          });
        }

        if (image.posts.length > 0) {
          throw new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: "Image is connected to posts",
          });
        }

        // Verify ownership
        if (image.ownerId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this image",
          });
        }

        if (image.s3Key) {
          // Delete from S3
          const deleteResult = await deleteFromS3(image.s3Key);
          if (!deleteResult) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to delete image from storage",
            });
          }
        } else {
          // Delete from Cloudinary
          const deleteResult = (await cloudinary.uploader.destroy(
            //FIXME: stored in S3 MinIO if cloudinaryPublicId is null
            image.cloudinaryPublicId as string, //FIXME: cloudinaryPublicId is optional
          )) as { result: string };

          if (deleteResult.result !== "ok") {
            throw new TRPCError({
              code: "UNPROCESSABLE_CONTENT",
              message: "Failed delete image from Cloudinary",
            });
          }
        }

        // Delete database record
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
};

/**
 * Deletes an object from S3 storage.
 * @param s3Key - The key of the object to delete
 * @returns `true` if the object was successfully deleted, `false` otherwise
 * @throws TRPCError if an error occurs during deletion
 * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html#deleteobjectcommand}
 * @see {@link https://min.io/docs/minio/linux/index.html}
 */
export async function deleteFromS3(s3Key: string) {
  const bucket = env.MINIO_BUCKET_NAME;

  try {
    // Log pre-deletion state
    console.debug("Attempting to delete:", {
      bucket,
      key: s3Key,
    });

    // Perform deletion
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    const deleteResult = await s3Client.send(command);
    console.debug("deleteFromS3:", deleteResult);

    // Verify deletion
    const stillExists = await objectExists(bucket, s3Key);
    if (stillExists) {
      console.error("Object still exists after deletion attempt");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteFromS3:", {
      error,
      bucket,
      key: s3Key,
    });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete image from storage",
      cause: error,
    });
  }
}

/**
 * Checks if an object exists in S3 storage.
 * @param bucket - The bucket where the object is stored
 * @param key - The key of the object to check
 * @returns `true` if the object exists, `false` otherwise
 * @throws Error if an error occurs during the check
 */
async function objectExists(bucket: string, key: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    // NotFound is expected when object doesn't exist
    if (error instanceof NotFound) {
      return false;
    }
    // For other errors, we should throw
    console.error("Error checking if object exists:", error);
    throw new Error(`Failed to check if image exists in storage: ${error}`);
  }
}
