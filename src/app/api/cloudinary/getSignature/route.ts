import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/lib/auth";

// Since this is a dynamic route that requires authentication,
// we explicitly mark it as non-static
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "You are not authorized" },
        { status: 401 },
      );
    }

    // Get folder from request body
    const body = await request.json();
    const folder = `growagram/${body.folder}`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const api_secret = env.CLOUDINARY_API_SECRET;
    const transformation = "w_2000,h_2000,c_limit,q_auto";

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        transformation,
        folder,
      },
      api_secret,
    );

    return NextResponse.json({
      cloud_name: env.NEXT_PUBLIC_CLOUDINARY_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      signature,
      timestamp,
      transformation,
      folder,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
