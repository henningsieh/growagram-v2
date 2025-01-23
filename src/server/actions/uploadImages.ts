"use server";

import { createHash } from "crypto";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { images } from "~/lib/db/schema";
import s3 from "~/lib/minio/minio";
import { readExif } from "~/lib/utils/readExif";

const MAX_FILE_SIZE = 10000000; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function generateS3Filename(
  originalFilename: string,
  username: string,
): string {
  const hash = createHash("md5")
    .update(originalFilename + username)
    .digest("hex");
  return `${username}/${hash}-${originalFilename}`;
}

export async function uploadImages(formData: FormData) {
  // Authenticate the user
  const session = await auth();
  if (
    !session?.user?.id ||
    typeof session.user.id !== "string" ||
    session.user.id.length === 0
  ) {
    throw new Response(
      JSON.stringify({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
          details: "Valid user session required to upload images",
          status: 401,
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const files = formData.getAll("files") as File[];
  const originalFilenames = formData.getAll("originalFilenames") as string[];

  if (!files.length) {
    throw new Response(
      JSON.stringify({
        error: {
          code: "UNPROCESSABLE_ENTITY",
          message: "No files provided",
          details: "At least one valid file is required for upload",
          status: 422,
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 422, headers: { "Content-Type": "application/json" } },
    );
  }

  const uploadedImages = [];

  for (const [index, file] of files.entries()) {
    const originalFilename = originalFilenames[index];

    // Validate file type
    const isAcceptedType = ACCEPTED_IMAGE_TYPES.some(
      (acceptedType) =>
        file.type.toLowerCase().startsWith("image/") ||
        acceptedType === file.type.toLowerCase(),
    );

    if (!isAcceptedType) {
      throw new Response(
        JSON.stringify({
          error: {
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: `Invalid file type: ${file.type}`,
            details: `Accepted types are: ${ACCEPTED_IMAGE_TYPES.join(", ")}`,
            status: 415,
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 415, headers: { "Content-Type": "application/json" } },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Response(
        JSON.stringify({
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: `File size too large (max ${MAX_FILE_SIZE / 1000000}MB)`,
            details: `The uploaded file exceeds the maximum allowed size of ${MAX_FILE_SIZE / 1000000}MB.`,
            status: 413,
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 413, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      // Convert the file to a buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Read EXIF data before upload
      // const exifResult = await getExifData(buffer);
      const exifResult = await readExif(buffer);

      // Generate unique filename for MinIO S3
      const s3Filename = generateS3Filename(
        originalFilename,
        session.user.username as string,
      );

      const uploadParams = {
        Bucket: process.env.MINIO_BUCKET_NAME as string,
        Key: s3Filename,
        Body: buffer,
        ContentType: file.type,
      };

      // Upload to MinIO S3
      const s3Response = await s3.upload(uploadParams).promise();
      console.debug("s3Response: ", s3Response);

      // Save image record to database
      const [newImage] = await db
        .insert(images)
        .values({
          ownerId: session.user.id,
          imageUrl: s3Response.Location,
          cloudinaryAssetId: s3Response.ETag,
          cloudinaryPublicId: s3Filename,
          captureDate: exifResult?.captureDate || new Date(),
          originalFilename,
        })
        .returning();

      if (!newImage) {
        throw new Error("Failed to save image record");
      }

      uploadedImages.push(newImage);
    } catch (error) {
      console.error("Upload error for file:", originalFilename, error);
      throw error;
    }
  }

  return {
    success: true as const,
    images: uploadedImages,
  };
}
