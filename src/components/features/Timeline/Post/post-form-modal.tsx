"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShareIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Modal } from "~/components/ui/modal";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import type {
  GetOwnGrowType,
  GetOwnPhotoType,
  GetOwnPlantType,
} from "~/server/api/root";
import { PostableEntityType } from "~/types/post";
import { postSchema } from "~/types/zodSchema";

import { EmbeddedGrowCard } from "../../Grows/embedded-grow-card";
import { EmbeddedPlantCard } from "../../Plants/embedded-plant-card";

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: GetOwnPhotoType | GetOwnPlantType | GetOwnGrowType;
  entityType: PostableEntityType;
}

/**
 * A modal component for creating a new post. This modal is connected to a specific entity,
 * which will be associated with the new post upon creation. The modal includes a form
 * for entering post content and handles form submission with appropriate success and error
 * notifications.
 *
 * @param {boolean} isOpen - Indicates whether the modal is open.
 * @param {() => void} onClose - Function to call when the modal is closed.
 * @param {object} entity - The entity to which the new post will be connected.
 * @param {PostableEntityType} entityType - The type of the entity.
 */
export default function PostFormModal({
  isOpen,
  onClose,
  entity,
  entityType,
}: PostFormModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("Posts");

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      entityId: entity.id,
      entityType,
    },
  });

  const createPostMutation = api.updates.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      router.push("/public/timeline");
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PostFormValues) => {
    createPostMutation.mutate(values);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="xs:p2 w-full max-w-6xl space-y-4 rounded-md p-1 shadow-lg sm:p-4">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="px-4">
            <CardTitle as="h2" className="text-xl">
              {t("createNewPost-title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <Form {...form}>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="sr-only"
                      // eslint-disable-next-line react/jsx-no-literals
                    >
                      Content
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </CardContent>
          <CardFooter className="px-4">
            <Button type="submit" className="w-full font-semibold">
              <ShareIcon className="mr-0 h-6 w-6" />
              {t("buttonLabel-createNewPost")}
            </Button>
          </CardFooter>
          <CardDescription className="space-y-4 p-4">
            <strong>
              {
                // eslint-disable-next-line react/jsx-no-literals
                `${t("linkedInThisPost")}:`
              }
            </strong>
            {entityType === PostableEntityType.GROW && (
              <EmbeddedGrowCard grow={entity as GetOwnGrowType} />
            )}
            {entityType === PostableEntityType.PLANT && (
              <EmbeddedPlantCard plant={entity as GetOwnPlantType} />
            )}
            {entityType === PostableEntityType.PHOTO && (
              <div className="flex items-center space-x-4 overflow-hidden">
                <Image
                  src={(entity as GetOwnPhotoType).imageUrl}
                  alt={(entity as GetOwnPhotoType).originalFilename}
                  width={120}
                  height={120}
                />
                <span>{(entity as GetOwnPhotoType).originalFilename}</span>
              </div>
            )}
          </CardDescription>
        </form>
      </Card>
    </Modal>
  );
}
