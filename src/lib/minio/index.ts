import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "server-only";
import { env } from "~/env";

const s3Client = new S3Client({
  endpoint: env.MINIO_SERVER_URL,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
  // MinIO requires a region, but it can be any string
  region: "eu-central-1", // Frankfurt
  forcePathStyle: true,
});

export { getSignedUrl, s3Client };
