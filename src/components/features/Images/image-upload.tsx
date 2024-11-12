"use client";

// src/app/[locale]/(protected)/images/upload/page.tsx:
import { UploadApiResponse } from "cloudinary";
import { CloudUpload, Loader2, Upload, X } from "lucide-react";
import { type Session, User } from "next-auth";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import { CreateImageInput } from "~/server/api/root";

interface FilePreview {
  file: File;
  preview: string;
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
): Promise<UploadApiResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.api_key);
  formData.append("timestamp", signature.timestamp.toString());
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);
  formData.append("transformation", signature.transformation);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

const MAX_FILE_SIZE = 10000000; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function ImageUpload({ user }: { user: User }) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();
  const saveImageMutation = api.image.createImage.useMutation();

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
                folder: user.name,
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
          );

          // Save to your database using your tRPC mutation
          const savedImage = await saveImageMutation.mutateAsync({
            imageUrl: cloudinaryResponse.secure_url,
            cloudinaryAssetId: cloudinaryResponse.asset_id,
            cloudinaryPublicId: cloudinaryResponse.public_id,
            captureDate: new Date(),
            originalFilename: cloudinaryResponse.original_filename,
          } satisfies CreateImageInput);

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
      utils.image.getOwnImages.invalidate();
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

  const handleFiles = (files: File[]) => {
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

    const newPreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviews((current) => [...current, ...newPreviews]);
  };

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.preview));
    };
  }, [previews]);

  return (
    <Card className="mx-auto max-w-xl">
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
                "cursor-pointer rounded-lg border-2 border-dashed bg-muted p-8 text-center transition-colors duration-200",
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
                  Images (JPG, PNG, WebP up to 10MB)
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              name="files"
              accept={ACCEPTED_IMAGE_TYPES.join(", ")}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {previews.map((preview, index) => (
                <div key={preview.preview} className="relative">
                  <Image
                    src={preview.preview}
                    alt={`Preview ${index + 1}`}
                    className="h-40 w-full rounded-md object-cover"
                    width={320}
                    height={160}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload{" "}
                {previews.length > 0 ? ` (${previews.length} files)` : ""}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
