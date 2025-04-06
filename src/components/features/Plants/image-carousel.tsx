import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { CameraIcon, ZoomIn } from "lucide-react";
import { useImageModal } from "~/components/Layouts/photo-modal-provider";
import { RESPONSIVE_IMAGE_SIZES } from "~/components/Layouts/responsive-grid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { formatDate, formatTime } from "~/lib/utils";
import type { ImageType, PlantImagesType } from "~/server/api/root";
import type { Locale } from "~/types/locale";

export const ImageCarousel = ({
  plantImages,
}: {
  plantImages: PlantImagesType;
}) => {
  const { openImageModal } = useImageModal();
  const t = useTranslations();

  React.useEffect(() => {
    plantImages.forEach((plantImage) => {
      const imageLoader = new window.Image();
      imageLoader.src = plantImage.image.imageUrl;
    });
  }, [plantImages]);

  const locale = useLocale();

  if (!plantImages.length)
    return (
      <div className="relative aspect-video w-full">
        <div className="bg-muted text-muted-foreground flex h-full items-center justify-center">
          {t("Photos.no-photos-yet")}
        </div>
      </div>
    );

  const [firstImage, ...restImages] = plantImages;

  const ImageWithOverlay = ({
    image,
    isPriority = false,
  }: {
    image: ImageType;
    isPriority?: boolean;
  }) => (
    <div
      className="group relative aspect-video w-full cursor-zoom-in md:aspect-video"
      onClick={() => openImageModal(image.imageUrl)}
      role="button"
      tabIndex={0}
      aria-label={`View full size image from ${formatDate(image.captureDate, locale as Locale)}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          openImageModal(image.imageUrl);
          e.preventDefault();
        }
      }}
    >
      <Image
        fill
        sizes={RESPONSIVE_IMAGE_SIZES}
        priority={isPriority}
        src={image.imageUrl}
        alt={`Plant image captured on ${image.captureDate.toLocaleDateString()}`}
        className="object-cover transition-all duration-300 group-hover:brightness-105"
        loading={isPriority ? undefined : "eager"}
      />

      {/* Zoom indicator */}
      <div className="bg-background/70 absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
        <ZoomIn size={18} className="text-foreground" />
      </div>

      {/* Date overlay */}
      <div className="bg-accent/50 text-accent-foreground absolute right-0 bottom-0 left-0 p-2 backdrop-blur-[2px]">
        <div className="flex items-center gap-2 font-mono text-sm">
          <CameraIcon size={16} />
          <span>
            {formatDate(image.captureDate, locale as Locale)}
            {locale !== "en" ? " um " : " at "}
            {formatTime(image.captureDate, locale as Locale)}
            {locale !== "en" && " Uhr"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Carousel className="w-full">
      <CarouselContent>
        <CarouselItem key={firstImage.image.id}>
          <ImageWithOverlay image={firstImage.image} isPriority={true} />
        </CarouselItem>

        {restImages.map((plantImage) => (
          <CarouselItem key={plantImage.image.id}>
            <ImageWithOverlay image={plantImage.image} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious variant="secondary" className="left-2" />
      <CarouselNext variant="secondary" className="right-2" />
    </Carousel>
  );
};
