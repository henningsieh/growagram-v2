"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { formatDate, formatTime } from "~/lib/utils";
import type { AppRouter } from "~/server/api/root";

import { Button } from "../ui/button";

export function ImageGrid() {
  type RouterOutput = inferRouterOutputs<AppRouter>;
  type GetUserImagesOutput = RouterOutput["image"]["getUserImages"];
  type UserImage = GetUserImagesOutput["images"][number];

  const locale = useLocale();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    api.image.getUserImages.useInfiniteQuery(
      {
        limit: 2,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Flatten all pages of images into a single array
  const userImages = data?.pages.flatMap((page) => page.images) ?? [];

  return (
    <div className="space-y-4">
      <Button asChild variant="secondary">
        <Link href="/images/upload">Upload New Image</Link>
      </Button>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userImages.map((image: UserImage) => (
          <div
            key={image.id}
            className="overflow-hidden rounded-lg border shadow-sm"
          >
            <div className="relative aspect-video">
              <Image
                src={image.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-500">
                Uploaded:{" "}
                {formatDate(image.createdAt, locale, {
                  includeYear: true,
                })}
                {" at "}
                {formatTime(image.createdAt, locale, {
                  includeSeconds: true,
                })}
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

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
