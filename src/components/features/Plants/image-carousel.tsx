import { CameraIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect } from "react";
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

  useEffect(() => {
    plantImages.forEach((plantImage) => {
      const imageLoader = new window.Image();
      imageLoader.src = plantImage.image.imageUrl;
    });
  }, [plantImages]);

  const locale = useLocale();

  if (!plantImages.length)
    return (
      <div className="relative aspect-video w-full">
        <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
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
        className="object-cover"
        loading={isPriority ? undefined : "eager"}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-accent/50 p-2 text-accent-foreground">
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
