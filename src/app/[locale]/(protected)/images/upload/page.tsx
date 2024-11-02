"use client";

// src/app/[locale]/(protected)/images/upload/page.tsx:
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "~/app/actions/upload";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";

export default function ImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function action(formData: FormData) {
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
      // Clean up previous preview if it exists
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Upload Image</h1>
      <form ref={formRef} action={action} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Select Image</label>
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full rounded border p-2"
          />
        </div>

        {preview && (
          <div className="mt-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 rounded object-contain"
            />
          </div>
        )}

        <Button type="submit" disabled={uploading} className="px-4 py-2">
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
}
