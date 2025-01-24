// src/components/features/Images/image-details-card.tsx:
import { Camera, FileIcon, UploadCloud } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatDate, formatTime } from "~/lib/utils";
import type { GetOwnPhotoType } from "~/server/api/root";

interface ImageDetailsProps {
  image: GetOwnPhotoType;
  locale: string;
}

export function ImageDetailsCard({ image, locale }: ImageDetailsProps) {
  const detailItems = [
    {
      icon: <FileIcon className="h-5 w-5" />,
      title: "Original Filename",
      content: image.originalFilename,
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: "Capture Date",
      content: `${formatDate(image.captureDate, locale)} ${locale !== "en" ? "um" : "at"} ${formatTime(image.captureDate, locale)}${locale !== "en" ? " Uhr" : ""}`,
    },
    {
      icon: <UploadCloud className="h-5 w-5" />,
      title: "Upload Date",
      content: `${formatDate(image.createdAt, locale)} ${locale !== "en" ? "um" : "at"} ${formatTime(image.createdAt, locale)}${locale !== "en" ? " Uhr" : ""}`,
    },
  ];

  return (
    // <div className="overflow-hidden bg-card">
    //   <div className="bg-muted p-0">
    <Card className="flex flex-col bg-muted md:flex-row">
      <div className="relative aspect-square w-full md:w-2/5">
        <Image
          priority
          alt={image.originalFilename}
          src={image.imageUrl}
          fill
          sizes="(min-width: 768px) min(300px, 40vw), min(720px, 100vw)"
          className="object-cover"
        />
      </div>
      <div className="w-full p-0 md:w-3/5 md:px-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Image Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {detailItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center space-x-2 text-muted-foreground">
                {item.icon}
                <h3 className="font-medium">{item.title}</h3>
              </div>
              <p className="break-all pl-7 font-mono tracking-tighter md:text-lg">
                {item.content}
              </p>
            </div>
          ))}
        </CardContent>
      </div>
    </Card>
    //   </div>
    // </div>
  );
}
