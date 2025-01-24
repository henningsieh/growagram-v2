"server only";

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  NotFound,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

const s3Client = new S3Client({
  endpoint: env.MINIO_SERVER_URL,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY!,
    secretAccessKey: env.MINIO_SECRET_KEY!,
  },
  // MinIO requires a region, but it can be any string
  region: "eu-central-1", // Frankfurt
  forcePathStyle: true,
});
export { getSignedUrl, s3Client };

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
