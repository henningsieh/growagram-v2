// src/app/[locale]/(protected)/images/page.tsx
import { eq } from "drizzle-orm";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { auth } from "~/lib/auth";
import { db } from "~/lib/db";
import { images } from "~/lib/db/schema";
import { Link } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { HydrateClient } from "~/lib/trpc/server";
import { formatDate, formatTime } from "~/lib/utils";

import PageHeader from "../../../../components/layouts/page-header";

export default async function ImagesPage(props: {
  params: { locale: string };
}) {
  // Await params before accessing locale
  const { locale } = await (props.params as unknown as Promise<
    typeof props.params
  >);
  const session = await auth();
  if (!session?.user?.id) return null;

  const hello = api.image.getUserImages;

  const userImages = await db.query.images.findMany({
    where: eq(images.ownerId, session.user.id),
    orderBy: (images, { desc }) => [desc(images.createdAt)],
  });

  return (
    <PageHeader
      title="My Images"
      subtitle="View and manage your current images"
    >
      <Button asChild variant={"secondary"}>
        <Link href="/images/upload">Upload New Image</Link>
      </Button>

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
                Uploaded:{" "}
                {formatDate(image.createdAt, locale, {
                  includeYear: true,
                })}
                {" at "}
                {formatTime(image.createdAt, locale, { includeSeconds: true })}
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
    </PageHeader>
  );
}
