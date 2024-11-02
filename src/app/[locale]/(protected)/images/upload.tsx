"use client";

// src/app/[locale]/(protected)/images/upload.tsx
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "~/lib/i18n/routing";

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !session?.user?.id) return;

    try {
      setUploading(true);

      // First, upload to your storage (e.g., S3, Cloudinary, etc.)
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload image");

      const { imageUrl } = await uploadResponse.json();

      // Then, save the image record in your database
      const dbResponse = await fetch("/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          ownerId: session.user.id,
        }),
      });

      if (!dbResponse.ok) throw new Error("Failed to save image record");

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
        <button
          type="submit"
          disabled={!file || uploading}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
