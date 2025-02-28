import { ArrowRight, ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { modulePaths } from "~/assets/constants";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Link } from "~/lib/i18n/routing";

interface RecentPhotosWidgetProps {
  photos?: {
    id: string;
    imageUrl: string;
    createdAt: Date;
    originalFilename?: string | null;
  }[];
  isLoading: boolean;
}

export function RecentPhotosWidget({
  photos,
  isLoading,
}: RecentPhotosWidgetProps) {
  const t = useTranslations("Platform");

  // Show loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
      </div>
    );
  }

  // No photos
  if (!photos?.length) {
    return (
      <div className="py-8 text-center">
        <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
        <h3 className="mt-2 font-medium">{t("no-photos-yet")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("upload-photos-description")}
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/photos/upload">{t("upload-photos")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.slice(0, photos.length).map((photo) => (
          <Link
            href={`/photos/${photo.id}/form`}
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-md"
          >
            <Image
              src={photo.imageUrl}
              alt={photo.originalFilename || "Plant photo"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              /**
               * By default, the image will take up 50% of the viewport width (50vw)
               * When the viewport is at least 640px wide, the image will take up 33% of the viewport width (33vw)
               * When the viewport is at least 960px wide, the image will be displayed at a fixed width of 200px
               */
              sizes="50vw, (min-width: 640px) 33vw, (min-width: 960px) 200px"
            />
          </Link>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="link" asChild size="sm" className="px-0">
          <Link href={modulePaths.PHOTOS.path}>
            {t("view-all-photos")}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
