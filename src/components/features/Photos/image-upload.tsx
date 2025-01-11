"use client";

import { UploadApiResponse } from "cloudinary";
import { CloudUpload, Loader2, Upload, X } from "lucide-react";
import { type User } from "next-auth";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
import { CreatePhotoInput } from "~/server/api/root";

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

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloud_name: string;
  api_key: string;
  folder: string;
  transformation: string;
}

async function uploadToCloudinary(
  file: File,
  signature: CloudinarySignature,
  onProgress: (progress: number) => void,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.api_key);
    formData.append("timestamp", signature.timestamp.toString());
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);
    formData.append("transformation", signature.transformation);

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
      true,
    );
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => {
      reject(new Error("Upload failed"));
    };
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded * 100) / event.total);
        onProgress(progress);
      }
    };
    xhr.send(formData);
  });
}

const MAX_FILE_SIZE = 10000000; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function PhotoUpload({ user }: { user: User }) {
  const locale = useLocale();
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();
  const saveImageMutation = api.photos.createPhoto.useMutation();

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!previews.length) return;

    try {
      setUploading(true);

      // Get signature for each file
      const uploadedImages = await Promise.all(
        previews.map(async (preview) => {
          // Get signature from your API
          const signatureResponse = await fetch(
            "/api/cloudinary/getSignature",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                folder: user.username,
              }),
            },
          );

          if (!signatureResponse.ok) {
            throw new Error("Failed to get upload signature");
          }

          const signature: CloudinarySignature = await signatureResponse.json();

          // Upload to Cloudinary
          const cloudinaryResponse = await uploadToCloudinary(
            preview.file,
            signature,
            (progress) => {
              setPreviews((current) =>
                current.map((p) =>
                  p.file === preview.file ? { ...p, progress } : p,
                ),
              );
            },
          );

          // Save to your database using your tRPC mutation
          const savedImage = await saveImageMutation.mutateAsync({
            imageUrl: cloudinaryResponse.secure_url,
            cloudinaryAssetId: cloudinaryResponse.asset_id,
            cloudinaryPublicId: cloudinaryResponse.public_id,
            captureDate: preview.exifData?.captureDate || new Date(),
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
      // Invalidate the images query to refresh the list
      utils.photos.getOwnPhotos.invalidate();
      router.push("/images");
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
      const isValidSize = file.size <= MAX_FILE_SIZE;

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
          description: `${file.name} exceeds 10MB limit`,
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

  return (
    <Card>
      <form ref={formRef} onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="files">Upload Images</Label>
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
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </div>

                <div className="text-xs text-muted-foreground">
                  Imagefiles (JPG, PNG, WebP up to 10MB)
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
                        <span>Filename: </span>
                        <span className="overflow-x-hidden whitespace-nowrap">
                          {" "}
                          {preview.file.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Filesize: </span>
                        <span className="overflow-hidden">
                          {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      {/* EXIF Data Display */}
                      {preview.exifData?.captureDate && (
                        <div className="flex justify-between">
                          {/* <div>
                            Camera: {preview.exifData.make}{" "}
                            {preview.exifData.model}
                          </div> */}
                          <span>Capture date: </span>
                          <span>
                            {formatDate(preview.exifData.captureDate, locale)}
                            {", "}
                            {formatTime(preview.exifData.captureDate, locale)}
                          </span>
                          {/* {preview.exifData.gpsLocation && (
                            <div>
                              GPS: {preview.exifData.gpsLocation.latitude},{" "}
                              {preview.exifData.gpsLocation.longitude}
                            </div>
                          )} */}
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
            Upload ({previews.length} files)
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
