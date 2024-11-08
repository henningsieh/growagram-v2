"use client";

import { useLocale } from "next-intl";
import Image from "next/image";
import React from "react";
import { formatDate, formatTime } from "~/lib/utils";
import { UserImage } from "~/server/api/root";

export default function ImageCard({ image }: { image: UserImage }) {
  const locale = useLocale();
  return (
    <div key={image.id} className="overflow-hidden rounded-lg border shadow-sm">
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
          Captured at:{" "}
          {formatDate(image.captureDate, locale, {
            includeYear: true,
          })}
          {locale === "en" ? " at " : " um "}
          {formatTime(image.captureDate, locale, {
            includeSeconds: true,
          })}
        </p>
      </div>
    </div>
  );
}
