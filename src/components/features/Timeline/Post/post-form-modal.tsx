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
import { getSignedUrlForUpload } from "~/lib/utils";
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
  progress: number;
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

  const connectToPlantMutation = useMutation(
    trpc.photos.connectToPlant.mutationOptions(),
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

  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [newFileUploads, setNewFileUploads] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragCounter = React.useRef(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const createPhotoMutation = useMutation(
    trpc.photos.createPhoto.mutationOptions(),
  );

  const createPostMutation = useMutation(
    trpc.updates.create.mutationOptions({
      onSuccess: () => {
        toast.success(t("post-created-successfully"));
        router.push(modulePaths.PUBLICTIMELINE.path);
        onClose();
      },
      onError: (error, post) => {
        toast.error(t("toast-errors.update-submission-error"));
        console.error("Error:", error, "Post object:", post);
      },
    }),
  );

  // Function to update progress for a specific file
  const updateProgress = React.useCallback((file: File, progress: number) => {
    setNewFileUploads((prevUploads) =>
      prevUploads.map((upload) =>
        upload.file === file ? { ...upload, progress } : upload,
      ),
    );
  }, []);

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
          progress: 0,
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

  // Handle form submission with parallel uploads
  const onSubmit = async (values: PostFormValues) => {
    try {
      setIsUploading(true);

      // Handle new file uploads in parallel
      let newlyUploadedImageIds: string[] = [];
      if (newFileUploads.length > 0) {
        // Upload all new files in parallel
        const uploadResults = await Promise.all(
          newFileUploads.map(async (filePreview) => {
            try {
              // Get signed URL for each file
              const uploadUrl = await getSignedUrlForUpload(filePreview.file);

              // Upload to S3 with progress tracking
              const { url } = await uploadToS3(
                filePreview.file,
                uploadUrl,
                (progress) => {
                  updateProgress(filePreview.file, progress);
                },
              );

              // Create photo record in database
              const [photo] = await createPhotoMutation.mutateAsync({
                imageUrl: url,
                originalFilename: filePreview.file.name,
                captureDate: filePreview.exifData?.captureDate,
              });

              // If this post is for a plant, connect the image to the plant
              if (entityType === PostableEntityType.PLANT && photo?.id) {
                await connectToPlantMutation.mutateAsync({
                  imageId: photo.id,
                  plantId: entity.id,
                });
              }

              return photo?.id;
            } catch (error) {
              console.error("Error uploading file:", error);
              toast.error(t("toast-errors.upload-failed"));
              return null;
            }
          }),
        );

        // Store the new image IDs
        newlyUploadedImageIds = uploadResults.filter(
          (id): id is string => id !== null,
        );

        // Show success toast for image uploads
        if (newlyUploadedImageIds.length > 0) {
          toast.success(t("image-upload-success"), {
            description: t("multiple-images-uploaded-successfully", {
              count: newlyUploadedImageIds.length,
            }),
          });
        }
      }

      // Combine newly uploaded image IDs with selected photo IDs
      const finalPhotoIds = [
        ...selectedPhotos.map((p) => p.id),
        ...newlyUploadedImageIds,
      ];

      // Create the post with all photo IDs
      await createPostMutation.mutateAsync({
        ...values,
        photoIds: finalPhotoIds.length > 0 ? finalPhotoIds : undefined,
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("toast-errors.unknown-error"));
      throw error;
    } finally {
      setIsUploading(false);
      setNewFileUploads((current) =>
        current.map((p) => ({ ...p, progress: 0 })),
      );
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
                    className="group relative aspect-square overflow-hidden rounded-md border"
                  >
                    <Image
                      src={file.preview}
                      alt={`Upload preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Trash2Icon size={14} />
                      </Button>
                    )}
                    {file.progress > 0 && file.progress < 100 && (
                      <div className="bg-background/80 absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 transition-all">
                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-sm font-medium">
                          {`${t("uploading")} ${file.progress}%`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Selected existing photos */}
                {selectedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square overflow-hidden rounded-md border"
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
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
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
