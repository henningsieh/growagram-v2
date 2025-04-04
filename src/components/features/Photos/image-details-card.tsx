// src/components/features/Images/image-details-card.tsx:
import * as React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { CameraIcon, FileIcon, UploadCloudIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDate, formatTime } from "~/lib/utils";
import type { GetOwnPhotoType } from "~/server/api/root";
import { Locale } from "~/types/locale";

interface ImageDetailsProps {
  image: GetOwnPhotoType;
  locale: string;
}

export function ImageDetailsCard({ image, locale }: ImageDetailsProps) {
  const t = useTranslations("Photos");

  const detailItems = [
    {
      icon: <FileIcon className="h-5 w-5" />,
      title: "Original Filename",
      content: image.originalFilename,
    },
    {
      icon: <CameraIcon className="h-5 w-5" />,
      title: "Capture Date",
      content: `${formatDate(image.captureDate, locale as Locale)} 
      ${formatTime(image.captureDate, locale as Locale)}`,
    },
    {
      icon: <UploadCloudIcon className="h-5 w-5" />,
      title: "Upload Date",
      content: `${formatDate(image.createdAt, locale as Locale)}
      ${formatTime(image.createdAt, locale as Locale)}`,
    },
  ];

  return (
    <Card className="bg-muted/50 flex flex-col rounded-md p-4 md:flex-row">
      <div className="relative aspect-square w-full md:w-2/5">
        <Image
          priority
          alt={image.originalFilename}
          src={image.imageUrl}
          fill
          sizes="100vw, (min-width: 768px) 300px"
          className="rounded-sm object-cover"
        />
      </div>
      <div className="w-full p-0 md:w-3/5 md:px-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {t("connectPlants.photo-details-metadata")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {detailItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="text-muted-foreground flex items-center space-x-2">
                {item.icon}
                <h3 className="font-medium">{item.title}</h3>
              </div>
              <p className="pl-7 font-mono tracking-tighter break-all md:text-lg">
                {item.content}
              </p>
            </div>
          ))}
        </CardContent>
      </div>
    </Card>
  );
}
