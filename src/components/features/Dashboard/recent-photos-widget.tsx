import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight, ImageIcon } from "lucide-react";
import { modulePaths } from "~/assets/constants";
import { useImageModal } from "~/components/Layouts/photo-modal-provider";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
  const t = useTranslations();
  const { openImageModal } = useImageModal();
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);

  return (
    <Card className="col-span-1 md:col-span-4">
      <CardHeader>
        <CardTitle as="h3" className="text-xl font-semibold">
          {t("Platform.recent-photos")}
        </CardTitle>
        <CardDescription>
          {t("Platform.recent-photos-description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Loading state */}
          {isLoading ? (
            <div className="xs:grid-cols-3 grid grid-cols-2 gap-2">
              {Array(12)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
            </div>
          ) : !photos?.length ? (
            /* No photos state */
            <div className="py-8 text-center">
              <ImageIcon className="text-muted-foreground mx-auto h-10 w-10 opacity-50" />
              <h3 className="mt-2 font-medium">{t("Photos.no-photos-yet")}</h3>

              <Button variant="outline" asChild className="mt-4">
                <Link href={`${modulePaths.PHOTOS.path}/upload`}>
                  {t("Photos.button-label-upload-photos")}
                </Link>
              </Button>
            </div>
          ) : (
            /* Photos grid */
            <>
              <div className="xs:grid-cols-3 grid grid-cols-2 gap-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-md"
                    onClick={() => openImageModal(photo.imageUrl)}
                    onMouseEnter={() => setHoveredPhotoId(photo.id)}
                    onMouseLeave={() => setHoveredPhotoId(null)}
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
                      style={{
                        transform:
                          hoveredPhotoId === photo.id
                            ? "scale(1.02)"
                            : "scale(1)",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button variant="link" asChild size="sm" className="px-0">
                  <Link href={modulePaths.PHOTOS.path}>
                    {t("Platform.view-all-photos")}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
