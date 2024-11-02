// src/app/[locale]/(protected)/images/page.tsx
import { eq } from "drizzle-orm";
import Image from "next/image";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { images } from "~/lib/db/schema";
import { Link } from "~/lib/i18n/routing";

export default async function ImagesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userImages = await db.query.images.findMany({
    where: eq(images.ownerId, session.user.id),
    orderBy: (images, { desc }) => [desc(images.createdAt)],
  });

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Images</h1>
        <Link
          href="/images/upload"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Upload New Image
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userImages.map((image) => (
          <div
            key={image.id}
            className="overflow-hidden rounded-lg border shadow-sm"
          >
            <div className="relative h-48">
              <Image
                src={image.imageUrl}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-500">
                Uploaded on {new Date(image.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {userImages.length === 0 && (
        <p className="mt-8 text-center text-gray-500">
          You haven&apos;t uploaded any images yet.
        </p>
      )}
    </div>
  );
}
