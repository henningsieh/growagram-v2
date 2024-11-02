"use client";

// src/app/[locale]/(protected)/images/upload.tsx
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "~/lib/i18n/routing";

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);

      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append("file", file);

      // Make a POST request to the server-side API route
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { imageUrl } = await uploadResponse.json();

      // Optionally: Save the image record in your database
      // (This can be moved to a separate API route if needed)

      // Redirect to another page or refresh
      router.push("/images");
      router.refresh();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Upload Image</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Select Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded border p-2"
          />
        </div>
        <Button
          type="submit"
          disabled={!file || uploading}
          className="px-4 py-2"
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </form>
    </div>
  );
}
