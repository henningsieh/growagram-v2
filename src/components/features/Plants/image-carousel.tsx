import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { CameraIcon } from "lucide-react";
import { RESPONSIVE_IMAGE_SIZES } from "~/components/Layouts/responsive-grid";
import { useImageModal } from "~/components/features/Photos/modal-provider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { formatDate, formatTime } from "~/lib/utils";
import type { ImageType, PlantImagesType } from "~/server/api/root";
import { Locale } from "~/types/locale";

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
      className="relative aspect-video w-full cursor-pointer md:aspect-video"
      onClick={() => openImageModal(image.imageUrl)}
    >
      <Image
        fill
        sizes={RESPONSIVE_IMAGE_SIZES}
        priority={isPriority}
        src={image.imageUrl}
        alt={`Plant image captured on ${image.captureDate.toLocaleDateString()}`}
        className="rounded-sm object-cover"
        loading={isPriority ? undefined : "eager"}
      />
      <div className="bg-accent/50 text-accent-foreground absolute right-0 bottom-0 left-0 p-2">
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
