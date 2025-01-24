// src/app/api/steadyhq/callback/route.ts:
import { NextRequest, NextResponse } from "next/server";
import s3 from "~/lib/minio";

export async function POST(req: NextRequest) {
  const { fileName, fileType } = await req.json();

  const params = {
    Bucket: process.env.MINIO_BUCKET_NAME,
    Key: `photos/${fileName}`,
    ContentType: fileType,
    Expires: 60, // URL expiration time in seconds
  };

  try {
    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { message: "Error generating signed URL" },
      { status: 500 },
    );
  }
}
