// src/app/actions/upload.ts
"use server";

import { z } from "zod";
import { auth } from "~/lib/auth";
import cloudinary from "~/lib/cloudinary";
import { db } from "~/lib/db";
import { images } from "~/lib/db/schema";

// src/app/actions/upload.ts

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  // Add more if needed
];

export async function uploadImage(formData: FormData) {
  // Authenticate the user
  const session = await auth();
  if (
    !session?.user?.id ||
    typeof session.user.id !== "string" ||
    session.user.id.length === 0
  ) {
    throw new Error("Unauthorized or invalid user ID");
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("No file provided");
  }

  // Debug log
  console.log("File type:", file.type);
  console.log("File name:", file.name);
  console.log("File size:", file.size);

  // More lenient MIME type check
  const isAcceptedType = ACCEPTED_IMAGE_TYPES.some(
    (type) =>
      file.type.toLowerCase().startsWith("image/") ||
      ACCEPTED_IMAGE_TYPES.includes(file.type.toLowerCase()),
  );

  if (!isAcceptedType) {
    throw new Error(
      `Invalid file type: ${file.type}. Accepted types: ${ACCEPTED_IMAGE_TYPES.join(", ")}`,
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size too large (max ${MAX_FILE_SIZE / 1000000}MB)`);
  }

  try {
    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert the buffer to base64
    const base64String = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(dataURI, {
      folder: "growagram",
      resource_type: "auto", // This allows Cloudinary to auto-detect the file type
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // Specify allowed formats in Cloudinary
    });

    // Save image record to database using Drizzle
    const [newImage] = await db
      .insert(images)
      .values({
        imageUrl: cloudinaryResult.secure_url,
        ownerId: session.user.id,
      })
      .returning();

    if (!newImage) {
      throw new Error("Failed to save image record");
    }

    return {
      success: true as const,
      imageUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      image: newImage,
    };
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    throw new Error("Error uploading file");
  }
}
