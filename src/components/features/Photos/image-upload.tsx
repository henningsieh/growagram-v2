"use client";

// src/components/features/Photos/image-upload.tsx:
import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_FILE_SIZE,
  modulePaths,
} from "~/assets/constants";
import SpinningLoader from "~/components/atom/spinning-loader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Progress as ProgressBar } from "~/components/ui/progress";
import { useRouter } from "~/lib/i18n/routing";
import { useTRPC } from "~/lib/trpc/client";
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

interface SignedUrlResponse {
  uploadUrl: string;
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

  const { uploadUrl } = (await response.json()) as SignedUrlResponse;
  return uploadUrl;
};

export default function PhotoUpload() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const [uploading, setUploading] = React.useState(false);
  const [previews, setPreviews] = React.useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const router = useRouter();

  const t = useTranslations("Photos");

  const formRef = React.useRef<HTMLFormElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const saveImageMutation = useMutation(
    trpc.photos.createPhoto.mutationOptions(),
  );

  // Function to update progress for a specific file
  const updateProgress = (index: number, progress: number) => {
    setPreviews((currentPreviews) =>
      currentPreviews.map((p, i) => (i === index ? { ...p, progress } : p)),
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!previews.length) return;

    try {
      setUploading(true);

      const uploadedImages = await Promise.all(
        previews.map(async (preview, index) => {
          const buffer = await preview.file.arrayBuffer();
          const exifData = readExif(Buffer.from(buffer));

          const uploadUrl = await getSignedUrlForUpload(preview.file);
          const { url: s3Url, eTag } = await uploadToS3(
            preview.file,
            uploadUrl,
            (progress) => updateProgress(index, progress),
          );

          const savedImage = await saveImageMutation.mutateAsync({
            imageUrl: s3Url,
            s3Key: `photos/${preview.file.name}`,
            s3ETag: eTag, // Use the extracted ETag
            captureDate: exifData?.captureDate || new Date(),
            originalFilename: preview.file.name,
          } satisfies CreatePhotoInput);

          return savedImage;
        }),
      );

      toast(t("upload.toasts.success.title"), {
        description: t("upload.toasts.success.description", {
          count: uploadedImages.length,
        }),
      });

      formRef.current?.reset();
      setPreviews([]);
      await queryClient.invalidateQueries({
        queryKey: trpc.photos.getOwnPhotos.queryKey(),
      });
      router.push(modulePaths.PHOTOS.path);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(t("upload.toasts.error.title"), {
        description:
          error instanceof Error
            ? error.message
            : t("upload.toasts.error.description"),
      });
    } finally {
      setUploading(false);
      setPreviews((current) => current.map((p) => ({ ...p, progress: 0 })));
    }
  };

  const dragCounter = React.useRef(0);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(Array.from(e.target.files));
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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValid = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const isValidSize = file.size <= MAX_UPLOAD_FILE_SIZE;

      if (!isValid) {
        toast.error(t("upload.toasts.invalid-type.title"), {
          description: t("upload.toasts.invalid-type.description", {
            filename: file.name,
          }),
        });
      }
      if (!isValidSize) {
        toast.error(t("upload.toasts.file-too-large.title"), {
          description: t("upload.toasts.file-too-large.description", {
            filename: file.name,
            maxSize: MAX_UPLOAD_FILE_SIZE / 1000000,
          }),
        });
      }

      return isValid && isValidSize;
    });

    const newPreviews = await Promise.all(
      validFiles.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const exifData = readExif(Buffer.from(buffer));

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

  React.useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.preview));
    };
  }, [previews]);

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="sr-only" htmlFor="files">
              {t("upload.dropzone-title")}
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDrag}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDrop={handleDrop}
              className={cn(
                "bg-muted/20 cursor-pointer rounded-sm border-2 border-dashed p-8 text-center transition-colors duration-200",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25",
                "hover:border-primary hover:bg-primary/5",
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <CloudUpload className="text-muted-foreground h-10 w-10" />

                <div className="text-muted-foreground text-lg">
                  <span className="font-semibold">
                    {" "}
                    {t("upload.dropzone-title")}
                  </span>
                </div>

                <div className="text-muted-foreground text-xs">
                  {t("upload.dropzone-description")}
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
                <div key={preview.preview} className="relative pt-4">
                  <div className="relative">
                    <Image
                      src={preview.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-40 w-full rounded-md object-cover"
                      width={320}
                      height={160}
                    />
                    <div className="absolute -top-4 right-0 left-0">
                      <ProgressBar value={preview.progress} className="h-2" />
                    </div>
                    <div className="bg-accent text-foreground absolute right-1 bottom-1 left-1 mt-2 flex flex-col rounded-sm p-1 text-xs font-semibold">
                      <div className="flex justify-between gap-2">
                        <span>{t("upload.preview.filename-label")}</span>
                        <span className="overflow-x-hidden whitespace-nowrap">
                          {preview.file.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("upload.preview.filesize-label")}</span>
                        <span className="overflow-hidden">
                          {(preview.file.size / 1024 / 1024).toFixed(2)}
                          {t("upload.preview.filesize-unit")}
                        </span>
                      </div>
                      {preview.exifData?.captureDate && (
                        <div className="flex justify-between">
                          <span>{t("upload.preview.capturedate-label")}</span>
                          <span>
                            {formatDate(
                              preview.exifData.captureDate,
                              locale as Locale,
                            )}{" "}
                            {formatTime(
                              preview.exifData.captureDate,
                              locale as Locale,
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      type="button"
                      disabled={uploading}
                      variant="destructive"
                      className="absolute top-2 right-2 z-10"
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
            {`${t("upload.buttonLabel-upload")} (`}
            {previews.length}
            {` ${t("upload.buttonLabel-files")})`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
