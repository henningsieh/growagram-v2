// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import cloudinary from "~/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract and process the file from the request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert the buffer to base64
    const base64String = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "growagram", // Customize folder name if needed
      resource_type: "auto",
    });

    // Return the uploaded image URL and public ID
    return NextResponse.json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 },
    );
  }
}
