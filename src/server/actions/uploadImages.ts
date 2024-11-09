"use server";

import { UploadApiResponse } from "cloudinary";
import { createHash } from "crypto";
import { auth } from "~/lib/auth";
import cloudinary from "~/lib/cloudinary";
import { db } from "~/lib/db";
import { images } from "~/lib/db/schema";
import { getExifData } from "~/lib/utils/getExifData";

const MAX_FILE_SIZE = 10000000; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function generateCloudinaryFilename(
  originalFilename: string,
  username: string,
): string {
  const timestamp = Date.now();
  const hash = createHash("md5")
    .update(`${originalFilename}_${timestamp}_${username}`)
    .digest("hex")
    .slice(0, 8);

  return `${username}_${originalFilename}_${hash}`;
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

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const originalFilename = originalFilenames[i];

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
      const exifResult = await getExifData(buffer);

      // Convert the buffer to base64
      const base64String = buffer.toString("base64");
      const dataURI = `data:${file.type};base64,${base64String}`;

      // Generate unique filename for Cloudinary
      const cloudinaryFilename = generateCloudinaryFilename(
        originalFilename,
        session.user.name || session.user.email || session.user.id,
      );

      // Upload to Cloudinary
      const cloudinaryResponse = (await cloudinary.uploader.upload(dataURI, {
        folder: "growagram",
        resource_type: "auto",
        // allowed_formats: ACCEPTED_IMAGE_TYPES,
        public_id: cloudinaryFilename,
      })) satisfies UploadApiResponse;

      // Save image record to database
      const [newImage] = await db
        .insert(images)
        .values({
          ownerId: session.user.id,
          imageUrl: cloudinaryResponse.secure_url,
          captureDate: exifResult?.captureDate,
          originalFilename: originalFilename,
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
