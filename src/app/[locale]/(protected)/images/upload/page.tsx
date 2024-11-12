"use client";

import { CloudUpload, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import PageHeader from "~/components/Layouts/page-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { cn } from "~/lib/utils";
import { uploadImages } from "~/server/actions/uploadImages";

interface FilePreview {
  file: File;
  preview: string;
}

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const { toast } = useToast();

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formRef.current || previews.length === 0) return;

    const formData = new FormData();

    // Add each file to FormData
    previews.forEach((preview) => {
      // 'index' is declared but its value is never read.ts(6133)
      formData.append("files", preview.file);
      formData.append("originalFilenames", preview.file.name);
    });

    try {
      setUploading(true);
      const result = await uploadImages(formData);

      if (result.success) {
        toast({
          title: "Success",
          description: `${result.images.length} image(s) uploaded successfully!`,
        });

        formRef.current?.reset();
        setPreviews([]);
        // Invalidate the images query to refresh the list
        utils.image.getOwnImages.invalidate();
        router.push("/images");
        // router.refresh();
      } else {
        throw new Error("Upload failed");
      }
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
      const isValid = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
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
    <PageHeader title="Image Upload" subtitle="Upload new images">
      <Card className="mx-auto max-w-xl">
        {/* <form ref={formRef} action={handleSubmit}> */}
        <form ref={formRef} onSubmit={onSubmit}>
          {" "}
          {/* Changed from action={handleSubmit} to onSubmit={onSubmit} */}
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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Images (PNG, JPG, GIF up to 10MB)
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={(e) => {
                    // Handle file selection logic here
                    if (e.target.files && e.target.files.length > 0) {
                      console.log(e.target.files);
                    }
                  }}
                  accept="image/png, image/jpeg, image/gif"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                name="files"
                accept="image/*"
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
                  Upload
                  {previews.length > 0 ? ` (${previews.length} files)` : ""}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageHeader>
  );
}
