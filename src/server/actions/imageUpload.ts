"use server";

// src/app/upload.ts
import { UploadApiResponse } from "cloudinary";
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

export async function uploadImage(formData: FormData) {
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
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Response(
      JSON.stringify({
        error: {
          code: "UNPROCESSABLE_ENTITY",
          message: "No file provided",
          details: "A valid file is required for the upload",
          status: 422,
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 422,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // More lenient MIME type check
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
      {
        status: 415,
        headers: {
          "Content-Type": "application/json",
        },
      },
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
      {
        status: 413,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Read EXIF data before upload
    const exifResult = await getExifData(buffer);
    // if (exifResult) {
    //   const { captureDate, make, model, gpsLocation, rawExif } = exifResult;

    //   if (captureDate) {
    //     console.log("Photo taken on:", captureDate);
    //   }

    //   if (gpsLocation) {
    //     console.log(
    //       "Photo location:",
    //       `${gpsLocation.latitude}, ${gpsLocation.longitude}`,
    //       gpsLocation.altitude ? `altitude: ${gpsLocation.altitude}m` : "",
    //     );
    //   }

    //   // Access any other EXIF data from rawExif
    //   console.log("Camera:", make, model);
    //   console.log("ISO:", rawExif.Photo?.ISOSpeedRatings);
    //   console.log("Aperture:", rawExif.Photo?.ApertureValue);
    //   console.log("Exposure Time:", rawExif.Photo?.ExposureTime);
    // }

    // Convert the buffer to base64
    const base64String = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const cloudinaryResponse = (await cloudinary.uploader.upload(dataURI, {
      folder: "growagram",
      resource_type: "auto", // This allows Cloudinary to auto-detect the file type
      allowed_formats: ACCEPTED_IMAGE_TYPES, // Specify allowed formats in Cloudinary
    })) satisfies UploadApiResponse;

    // Save image record to database using Drizzle
    const [newImage] = await db
      .insert(images)
      .values({
        ownerId: session.user.id,
        imageUrl: cloudinaryResponse.secure_url,
        captureDate: exifResult?.captureDate,
      })
      .returning();

    if (!newImage) {
      throw new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to save image record",
            details:
              "An unexpected error occurred while saving the image to the database.",
            status: 500,
            timestamp: new Date().toISOString(),
          },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return {
      success: true as const,
      imageUrl: cloudinaryResponse.secure_url,
      publicId: cloudinaryResponse.public_id,
      image: newImage,
    };
  } catch (error) {
    // Log the error in a structured and detailed manner
    console.error("Upload error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timestamp: new Date().toISOString(),
    });

    // Construct a structured error response
    let errorResponse = {
      code: "UPLOAD_ERROR",
      message: "Error uploading file",
      details: "An unexpected error occurred during the upload process.",
      status: 500,
      timestamp: new Date().toISOString(),
    };

    // If the error is an instance of Error, provide more details
    if (error instanceof Error) {
      errorResponse = {
        ...errorResponse,
        message: `Upload failed: ${error.message}`,
        details: error.stack || "No additional error details available.",
      };
    }

    // Throw a structured error response
    throw new Response(JSON.stringify({ error: errorResponse }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
