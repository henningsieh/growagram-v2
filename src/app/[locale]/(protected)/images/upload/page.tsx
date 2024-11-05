"use client";

// src/app/[locale]/(protected)/images/upload/page.tsx:
import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import PageHeader from "~/components/Layouts/page-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { uploadImage } from "~/server/actions/imageUpload";

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(formData: FormData) {
    try {
      setUploading(true);

      const result = await uploadImage(formData);

      if (result.success) {
        toast({
          title: "Success",
          description: `Image uploaded successfully! ID: ${result.image.id}`,
        });

        // Reset form and preview
        formRef.current?.reset();
        setPreview(null);

        // Navigate to images page
        router.push("/images");
        router.refresh();
      } else {
        // TypeScript should prevent this case based on the server action return type,
        // but it's good practice to handle it
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleRemoveFile() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <PageHeader title="Image Upload" subtitle="Upload a new image">
      <Card className="mx-auto max-w-xl">
        <form ref={formRef} action={handleSubmit}>
          {/* <CardHeader>
            <CardTitle>Image Upload</CardTitle>
          </CardHeader> */}
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select Image</Label>
              <Input
                id="file"
                ref={fileInputRef}
                type="file"
                name="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {preview && (
              <div className="relative mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 w-full rounded-md object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={uploading || !preview}
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
                  Upload
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageHeader>
  );
}
