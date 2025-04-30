import * as React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileImage,
  ImagePlus,
  ShareIcon,
  Trash2Icon,
  Upload,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_FILE_SIZE,
  modulePaths,
} from "~/assets/constants";
import { EmbeddedGrowCard } from "~/components/features/Grows/embedded-grow-card";
import { EnhancedPlantCard } from "~/components/features/Plants/enhanced-plant-card.tsx";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { useRouter } from "~/lib/i18n/routing";
import { readExif } from "~/lib/utils/readExif";
import { uploadToS3 } from "~/lib/utils/uploadToS3";
import type {
  GetOwnGrowType,
  GetOwnPhotoType,
  GetOwnPlantType,
} from "~/server/api/root";
import { useTRPC } from "~/trpc/client";
import { PostableEntityType } from "~/types/post";
import { postSchema } from "~/types/zodSchema";

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: GetOwnPhotoType | GetOwnPlantType | GetOwnGrowType;
  entityType: PostableEntityType;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

interface FilePreview {
  file: File;
  preview: string;
  exifData: {
    captureDate?: Date;
  } | null;
  uploadedId?: string;
}

interface SelectedPhoto {
  id: string;
  imageUrl: string;
  originalFilename: string;
}

/**
 * A dialog component for creating a new post. This dialog is connected to a specific entity,
 * which will be associated with the new post upon creation. The dialog includes a form
 * for entering post content and handles form submission with appropriate success and error
 * notifications.
 *
 * @param {boolean} isOpen - Indicates whether the dialog is open.
 * @param {() => void} onClose - Function to call when the dialog is closed.
 * @param {object} entity - The entity to which the new post will be connected.
 * @param {PostableEntityType} entityType - The type of the entity.
 */
export function PostFormModal({
  isOpen,
  onClose,
  entity,
  entityType,
}: PostFormModalProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const t = useTranslations("Posts");

  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [newFileUploads, setNewFileUploads] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragCounter = React.useRef(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const createPhotoMutation = useMutation(
    trpc.photos.createPhoto.mutationOptions(),
  );

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      entityId: entity.id,
      entityType,
      content: "",
      photoIds: [],
    },
  });

  const createPostMutation = useMutation(
    trpc.updates.create.mutationOptions({
      onSuccess: () => {
        toast("Success", {
          description: t("post-created-successfully"),
        });
        router.push(modulePaths.PUBLICTIMELINE.path);
        onClose();
      },
      onError: (error, post) => {
        toast.error("Error", {
          description: t("toast-errors.update-submission-error"),
        });
        // console.error the error and the like object in one line
        console.error("Error:", error, "Post object:", post);
      },
    }),
  );

  // Function to handle browsing for images
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  // Handle file drops
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

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

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Process files
  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValid = ACCEPTED_IMAGE_TYPES.includes(file.type);
      const isValidSize = file.size <= MAX_UPLOAD_FILE_SIZE;

      if (!isValid) {
        toast.error(t("invalid-file-type", { filename: file.name }));
      }

      if (!isValidSize) {
        toast.error(
          t("file-too-large", {
            filename: file.name,
            maxSize: MAX_UPLOAD_FILE_SIZE / 1000000,
          }),
        );
      }

      return isValid && isValidSize;
    });

    if (validFiles.length === 0) return;

    const newPreviews = await Promise.all(
      validFiles.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const exifData = readExif(Buffer.from(buffer));

        return {
          file,
          preview: URL.createObjectURL(file),
          exifData,
        };
      }),
    );

    setNewFileUploads((prev) => [...prev, ...newPreviews]);
  };

  // Remove a file from the preview list
  const handleRemoveFile = (index: number) => {
    setNewFileUploads((current) => {
      const updated = [...current];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Remove a selected photo
  const handleRemoveSelectedPhoto = (id: string) => {
    setSelectedPhotos((photos) => photos.filter((photo) => photo.id !== id));
  };

  // Open photo library selection modal
  const openPhotoLibrary = () => {
    // This will be implemented in a later step to allow selecting from existing photos
    toast.info("Coming soon", {
      description:
        "Selecting from photo library will be available in a future update.",
    });
  };

  const onSubmit = async (values: PostFormValues) => {
    try {
      setIsUploading(true);

      // First, upload any new files
      let uploadedPhotoIds: string[] = [];

      if (newFileUploads.length > 0) {
        const uploadPromises = newFileUploads.map(async (preview) => {
          try {
            // Get a signed URL for upload
            const response = await fetch("/api/getSignedURL", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fileName: preview.file.name,
                fileType: preview.file.type,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to get upload URL");
            }

            const { uploadUrl } = (await response.json()) as {
              uploadUrl: string;
            };

            // Upload to S3
            const { url: s3Url, eTag } = await uploadToS3(
              preview.file,
              uploadUrl,
            );

            // Create image record in database
            const [newImage] = await createPhotoMutation.mutateAsync({
              id: crypto.randomUUID(),
              imageUrl: s3Url,
              s3Key: `photos/${preview.file.name}`,
              s3ETag: eTag,
              captureDate: preview.exifData?.captureDate || new Date(),
              originalFilename: preview.file.name,
            });

            return newImage.id;
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Upload failed", {
              description: "Failed to upload image. Please try again.",
            });
            return null;
          }
        });

        const uploadedIds = await Promise.all(uploadPromises);
        uploadedPhotoIds = uploadedIds.filter(Boolean) as string[];
      }

      // Add existing selected photos
      const allPhotoIds = [
        ...uploadedPhotoIds,
        ...selectedPhotos.map((photo) => photo.id),
      ];

      // Submit the post with the photo IDs
      await createPostMutation.mutateAsync({
        ...values,
        photoIds: allPhotoIds.length > 0 ? allPhotoIds : undefined,
      });

      // Clear uploads
      setNewFileUploads([]);
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Post creation error:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while creating post",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      newFileUploads.forEach((preview) => URL.revokeObjectURL(preview.preview));
    };
  }, [newFileUploads]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDrop={handleDrop}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {t("createNewPost-title")}
            </DialogTitle>
            <DialogDescription>
              {t("createNewPost-description")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Form {...form}>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("content-label")}</FormLabel>
                    <FormControl>
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                      >
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder={t("content-placeholder")}
                          className={`focus-visible:ring-primary/50 ${isDragging ? "border-primary/50 bg-primary/5" : ""}`}
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>

            {/* Photo upload section */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBrowseClick}
                className="gap-2"
              >
                <ImagePlus size={16} />
                {t("add-photos")}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openPhotoLibrary}
                className="gap-2"
              >
                <FileImage size={16} />
                {t("choose-from-library")}
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                multiple
                onChange={handleFileChange}
              />

              {isDragging && (
                <Badge variant="outline" className="bg-primary/10">
                  {t("drop-to-upload")}
                </Badge>
              )}
            </motion.div>

            {/* Photo previews */}
            {(newFileUploads.length > 0 || selectedPhotos.length > 0) && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
              >
                {/* New file uploads */}
                {newFileUploads.map((file, index) => (
                  <div
                    key={file.preview}
                    className="relative aspect-square overflow-hidden rounded-md border"
                  >
                    <Image
                      src={file.preview}
                      alt={`Upload preview ${index}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Trash2Icon size={14} />
                    </Button>
                    <Badge className="bg-secondary/70 absolute bottom-1 left-1">
                      {"New"}
                    </Badge>
                  </div>
                ))}

                {/* Selected existing photos */}
                {selectedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-md border"
                  >
                    <Image
                      src={photo.imageUrl}
                      alt={photo.originalFilename}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveSelectedPhoto(photo.id)}
                    >
                      <Trash2Icon size={14} />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}

            <AnimatePresence>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={scaleIn}
                className="mt-6 space-y-3"
              >
                <h3 className="text-muted-foreground text-sm font-semibold">
                  {t("linkedInThisPost")}
                  {":"}
                </h3>
                <div className="border-border/50 overflow-hidden rounded-md border">
                  {entityType === PostableEntityType.GROW && (
                    <EmbeddedGrowCard grow={entity as GetOwnGrowType} />
                  )}
                  {entityType === PostableEntityType.PLANT && (
                    <EnhancedPlantCard plant={entity as GetOwnPlantType} />
                  )}
                  {entityType === PostableEntityType.PHOTO && (
                    <div className="flex items-center space-x-4 overflow-hidden p-3">
                      <Image
                        src={(entity as GetOwnPhotoType).imageUrl}
                        alt={(entity as GetOwnPhotoType).originalFilename}
                        width={120}
                        height={120}
                        className="rounded-md object-cover"
                      />
                      <span>
                        {(entity as GetOwnPhotoType).originalFilename}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full transform gap-2 font-semibold transition-all hover:translate-y-[-2px] hover:shadow-md"
              disabled={createPostMutation.isPending || isUploading}
            >
              {isUploading || createPostMutation.isPending ? (
                <>
                  <Upload className="h-5 w-5 animate-pulse" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {isUploading
                      ? t("uploading-photos")
                      : t("buttonLabel-posting")}
                  </motion.span>
                </>
              ) : (
                <>
                  <ShareIcon className="h-5 w-5" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {t("buttonLabel-createNewPost")}
                  </motion.span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
