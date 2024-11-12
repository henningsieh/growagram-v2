import { v2 as cloudinary } from "cloudinary";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/lib/auth";

// Configuration for the API route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Since this is a dynamic route that requires authentication,
// we explicitly mark it as non-static
export const dynamic = "force-dynamic";

export async function GET(request: NextApiRequest) {
  try {
    const session = await auth();

    console.debug(request);

    if (!session) {
      return NextResponse.json(
        { error: "You are not authorized" },
        { status: 401 },
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const api_secret = env.CLOUDINARY_API_SECRET;
    const transformation = "w_2000,h_2000,c_limit,q_auto";
    const folder = "growagram/user_uploads";

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        transformation: transformation,
        folder: folder,
      },
      api_secret,
    );

    return NextResponse.json({
      cloud_name: env.NEXT_PUBLIC_CLOUDINARY_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      signature: signature,
      timestamp: timestamp,
      transformation: transformation,
      folder: folder,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Optional: Add a GET method that returns a 405 Method Not Allowed
export async function Post() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
