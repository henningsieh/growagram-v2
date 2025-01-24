import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export { s3Client, getSignedUrl };
