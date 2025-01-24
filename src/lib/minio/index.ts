// src/lib/minio/index.ts:
import { S3Client } from "@aws-sdk/client-s3";
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";

const s3Client = new S3Client({
  endpoint: process.env.MINIO_SERVER_URL,
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER!,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD!,
  },
  // MinIO requires a region, but it can be any string
  region: "eu-central-1", // Frankfurt
  forcePathStyle: true,
});

export { getSignedUrl, s3Client };

async function objectExists(bucket: string, key: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    throw new Error("Failed to check if image exists in storage" + error);
  }
}

export async function deleteFromS3(s3Key: string) {
  const bucket = process.env.MINIO_BUCKET_NAME;

  if (!bucket) {
    throw new Error("MINIO_BUCKET_NAME environment variable is not set");
  }

  try {
    // Log pre-deletion state
    console.debug("Attempting to delete:", {
      bucket,
      key: s3Key,
    });

    // Check if object exists before deletion
    const exists = await objectExists(bucket, s3Key);
    if (!exists) {
      console.warn("Object not found in S3:", { bucket, key: s3Key });
      return false;
    }

    // Perform deletion
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    const deleteResult = await s3Client.send(command);
    console.log("deleteFromS3:", deleteResult);

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

export const uploadToS3 = async (
  file: File,
  uploadUrl: string,
): Promise<{
  url: string;
  eTag: string;
}> => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  // Extract ETag from response headers (remove quotes)
  const eTag = response.headers.get("ETag")?.replace(/['"]/g, "") || "";

  return {
    url: uploadUrl.split("?")[0], // Return the URL without query parameters
    eTag,
  };
};
