// src/components/images/image-grid.tsx
"use client";

import Image from "next/image";
import { api } from "~/lib/trpc/react";
import { formatDate, formatTime } from "~/lib/utils";

// src/components/images/image-grid.tsx

export function ImageGrid({ locale }: { locale: string }) {
  const { data, isLoading } = api.image.getUserImages.useQuery({
    cursor: null,
    limit: 9,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const userImages = data?.images ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {userImages.map((image) => (
        <div
          key={image.id}
          className="overflow-hidden rounded-lg border shadow-sm"
        >
          <div className="relative h-48">
            <Image src={image.imageUrl} alt="" fill className="object-cover" />
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
      {userImages.length === 0 && (
        <p className="mt-8 text-center text-gray-500">
          You haven&apos;t uploaded any images yet.
        </p>
      )}
    </div>
  );
}
