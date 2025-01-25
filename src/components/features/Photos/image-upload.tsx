"use client";

// src/components/features/Photos/image-upload.tsx:
import { CloudUpload, Upload, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_FILE_SIZE,
  modulePaths,
} from "~/assets/constants";
import SpinningLoader from "~/components/Layouts/loader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Progress as ProgressBar } from "~/components/ui/progress";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { cn, formatDate, formatTime } from "~/lib/utils";
import { readExif } from "~/lib/utils/readExif";
import { uploadToS3 } from "~/lib/utils/uploadToS3";
import type { CreatePhotoInput } from "~/server/api/root";
import { Locale } from "~/types/locale";

interface FilePreview {
  file: File;
  preview: string;
  progress: number;
  exifData: {
    make?: string;
    model?: string;
    captureDate?: Date;
    gpsLocation?: {
      latitude: number;
      longitude: number;
      altitude?: number;
    };
  } | null;
}

const getSignedUrlForUpload = async (file: File) => {
  const response = await fetch("/api/getSignedURL", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get signed URL");
  }

  const { uploadUrl } = await response.json();
  return uploadUrl;
};

export default function PhotoUpload() {
  const locale = useLocale();
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveImageMutation = api.photos.createPhoto.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!previews.length) return;

    try {
      setUploading(true);

      const uploadedImages = await Promise.all(
        previews.map(async (preview) => {
          const buffer = await preview.file.arrayBuffer();
          const exifData = await readExif(Buffer.from(buffer));

          const uploadUrl = await getSignedUrlForUpload(preview.file);
          const { url: s3Url, eTag } = await uploadToS3(
            preview.file,
            uploadUrl,
          );

          const savedImage = await saveImageMutation.mutateAsync({
            imageUrl: s3Url,
            // s3Key: s3Url.split("/").pop(), // Extract the key from the URL
            s3Key: `photos/${preview.file.name}`, // Store complete path
            s3ETag: eTag, // Use the extracted ETag
            captureDate: exifData?.captureDate || new Date(),
            originalFilename: preview.file.name,
          } satisfies CreatePhotoInput);

          return savedImage;
        }),
      );

      toast({
        title: "Success",
        description: `${uploadedImages.length} image(s) uploaded successfully!`,
      });

      formRef.current?.reset();
      setPreviews([]);
      utils.photos.getOwnPhotos.invalidate();
      router.push(modulePaths.PHOTOS.path);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const dragCounter = useRef(0);

  const handleDragIn = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setPreviews((current) => {
      const updated = [...current];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValid = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const isValidSize = file.size <= MAX_UPLOAD_FILE_SIZE;

      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an accepted image type`,
          variant: "destructive",
        });
      }
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${MAX_UPLOAD_FILE_SIZE / 1000000} MB limit`,
          variant: "destructive",
        });
      }

      return isValid && isValidSize;
    });

    const newPreviews = await Promise.all(
      validFiles.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const exifData = await readExif(Buffer.from(buffer));
        // console.debug({ exifData });
        return {
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          exifData,
        };
      }),
    );

    setPreviews((current) => [...current, ...newPreviews]);
  };

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.preview));
    };
  }, [previews]);

  const t = useTranslations("Photos");

  return (
    <Card>
      <form ref={formRef} onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="sr-only" htmlFor="files">
              {t("Photos.upload.dropzone-title")}
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDrag}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDrop={handleDrop}
              className={cn(
                "cursor-pointer rounded-sm border-2 border-dashed bg-muted/20 p-8 text-center transition-colors duration-200",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25",
                "hover:border-primary hover:bg-primary/5",
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <CloudUpload className="h-10 w-10 text-muted-foreground" />

                <div className="text-lg text-muted-foreground">
                  <span className="font-semibold">
                    {" "}
                    {t("Photos.upload.dropzone-title")}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  {t("Photos.upload.dropzone-description")}
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              id="files"
              name="files"
              accept={ACCEPTED_IMAGE_TYPES.join(", ")}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {previews.map((preview, index) => (
                <div key={preview.preview}>
                  <div className="relative">
                    <Image
                      src={preview.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-40 w-full rounded-md object-cover"
                      width={320}
                      height={160}
                    />
                    <div className="absolute bottom-1 left-1 right-1 mt-2 flex flex-col rounded-sm bg-accent p-1 text-xs font-semibold text-foreground">
                      <div className="flex justify-between gap-2">
                        <span>{t("Photos.upload.preview.filename-label")}</span>
                        <span className="overflow-x-hidden whitespace-nowrap">
                          {preview.file.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("Photos.upload.preview.filesize-label")}</span>
                        <span className="overflow-hidden">
                          {(preview.file.size / 1024 / 1024).toFixed(2)}
                          {t("Photos.upload.preview.filesize-unit")}
                        </span>
                      </div>
                      {/* EXIF Data Display */}
                      {preview.exifData?.captureDate && (
                        <div className="flex justify-between">
                          <span>
                            {t("Photos.upload.preview.capturedate-label")}
                          </span>
                          <span>
                            {formatDate(
                              preview.exifData.captureDate,
                              locale as Locale,
                            )}
                            {
                              // eslint-disable-next-line react/jsx-no-literals
                              ", "
                            }
                            {formatTime(
                              preview.exifData.captureDate,
                              locale as Locale,
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-3 left-0 right-0">
                      <ProgressBar value={preview.progress} />
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      disabled={uploading}
                      variant="destructive"
                      className="absolute right-2 top-2"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={uploading || previews.length === 0}
            className="w-full"
          >
            {uploading ? (
              <SpinningLoader className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Upload className="mr-2 h-5 w-5" />
            )}
            {
              // eslint-disable-next-line react/jsx-no-literals
              `${t("Photos.upload.buttonLabel-upload")} (`
            }
            {previews.length}
            {
              // eslint-disable-next-line react/jsx-no-literals
              ` ${t("Photos.upload.buttonLabel-files")})`
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
