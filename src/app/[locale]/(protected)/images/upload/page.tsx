"use client";

import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import PageHeader from "~/components/Layouts/page-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { uploadImages } from "~/server/actions/uploadImages";

interface FilePreview {
  file: File;
  preview: string;
}

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(formData: FormData) {
    try {
      setUploading(true);

      const result = await uploadImages(formData);

      if (result.success) {
        toast({
          title: "Success",
          description: `${result.images.length} image(s) uploaded successfully!`,
        });

        // Reset form and previews
        formRef.current?.reset();
        setPreviews([]);

        // Navigate to images page
        router.push("/images");
        router.refresh();
      } else {
        // TypeScript should prevent this case based on the server action return type,
        // but it's good practice to handle it
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
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    // Revoke existing preview URLs
    previews.forEach((preview) => URL.revokeObjectURL(preview.preview));

    // Create new previews
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);
  }

  function handleRemoveFile(index: number) {
    setPreviews((current) => {
      const updated = [...current];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  useEffect(() => {
    return () => {
      // Cleanup preview URLs on unmount
      previews.forEach((preview) => URL.revokeObjectURL(preview.preview));
    };
  }, []);

  return (
    <PageHeader title="Image Upload" subtitle="Upload new images">
      <Card className="mx-auto max-w-xl">
        <form ref={formRef} action={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="files">Select Images</Label>
              <Input
                id="files"
                ref={fileInputRef}
                type="file"
                name="files"
                accept="image/*"
                onChange={handleFileChange}
                multiple
              />
            </div>
            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {previews.map((preview, index) => (
                  <div key={preview.preview} className="relative">
                    <img
                      src={preview.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-40 w-full rounded-md object-cover"
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
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload{" "}
                  {previews.length > 0 ? `(${previews.length} files)` : ""}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageHeader>
  );
}
