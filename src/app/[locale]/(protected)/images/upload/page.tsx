"use client";

import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import PageHeader from "~/components/Layouts/page-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
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
  const { toast } = useToast();

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

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
        router.push("/images");
        router.refresh();
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

  const handleFiles = useCallback(
    (files: File[]) => {
      // Revoke existing preview URLs
      previews.forEach((preview) => URL.revokeObjectURL(preview.preview));

      // Create new previews
      const newPreviews = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setPreviews(newPreviews);
    },
    [previews],
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }

  function handleRemoveFile(index: number) {
    setPreviews((current) => {
      const updated = [...current];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

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
                onDrop={handleDrop}
                onDragOver={handleDrag}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={cn(
                  "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-200",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25",
                  "hover:border-primary hover:bg-primary/5",
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Images (PNG, JPG, GIF up to 10MB)
                  </div>
                </div>
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
                    <input
                      type="hidden"
                      name="originalFilenames"
                      value={preview.file.name}
                    />
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
