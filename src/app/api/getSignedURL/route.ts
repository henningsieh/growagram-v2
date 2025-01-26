// src/app/api/getSignedURL/route.ts:
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl, s3Client } from "~/lib/minio";

export async function POST(req: NextRequest) {
  const { fileName, fileType } = await req.json();

  const params = {
    Bucket: process.env.MINIO_BUCKET_NAME!,
    Key: `photos/${fileName}`,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { message: "Error generating signed URL" },
      { status: 500 },
    );
  }
}
