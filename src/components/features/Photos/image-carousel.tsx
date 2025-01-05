import { CameraIcon } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { formatDate, formatTime } from "~/lib/utils";
import { ImageType, PlantImagesType } from "~/server/api/root";

export const ImageCarousel = ({
  plantImages,
}: {
  plantImages: PlantImagesType;
}) => {
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
          no images yet
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
    <div className="relative aspect-video w-full md:aspect-video">
      <Image
        fill
        sizes="640px"
        priority={isPriority}
        src={image.imageUrl}
        alt={`Plant image captured on ${image.captureDate.toLocaleDateString()}`}
        className="object-cover"
        loading={isPriority ? undefined : "eager"}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-background/60 p-2 text-accent-foreground">
        <div className="flex items-center gap-2 text-sm">
          <CameraIcon size={16} />
          <span>
            {formatDate(image.captureDate, locale)}
            {locale !== "en" ? " um " : " at "}
            {formatTime(image.captureDate, locale)}
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
