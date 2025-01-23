import AWS from "aws-sdk";

const s3 = new AWS.S3({
  endpoint: process.env.MINIO_SERVER_URL,
  accessKeyId: process.env.MINIO_ROOT_USER,
  secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
  s3ForcePathStyle: true, // needed with minio?
  signatureVersion: "v4",
});

export default s3;
