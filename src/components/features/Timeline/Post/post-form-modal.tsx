"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ShareIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmbeddedGrowCard } from "~/components/features/Grows/embedded-grow-card";
import { EnhancedPlantCard } from "~/components/features/Plants/enhanced-plant-card.tsx";
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
import { useTRPC } from "~/lib/trpc/client";
import type {
  GetOwnGrowType,
  GetOwnPhotoType,
  GetOwnPlantType,
} from "~/server/api/root";
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

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      entityId: entity.id,
      entityType,
    },
  });

  const createPostMutation = useMutation(
    trpc.posts.create.mutationOptions({
      onSuccess: () => {
        toast("Success", {
          description: t("post-created-successfully"),
        });
        router.push("/public/timeline");
        onClose();
      },
      onError: () => {
        toast.error("Error", {
          description: t("toast-errors.update-submission-error"),
        });
      },
    }),
  );

  const onSubmit = (values: PostFormValues) => {
    createPostMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
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
                          className="focus-visible:ring-primary/50"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>

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
              disabled={createPostMutation.isPending}
            >
              <ShareIcon className="h-5 w-5" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {createPostMutation.isPending
                  ? t("buttonLabel-posting")
                  : t("buttonLabel-createNewPost")}
              </motion.span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
