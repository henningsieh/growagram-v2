"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
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
import { Input } from "~/components/ui/input";
import { Modal } from "~/components/ui/modal";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { PostableEntityType } from "~/types/post";
import { postSchema } from "~/types/zodSchema";

type PostFormValues = z.infer<typeof postSchema>;

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: PostableEntityType;
}

export default function PostFormModal({
  isOpen,
  onClose,
  entityId,
  entityType,
}: PostFormModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("Posts");

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      entityId,
      entityType,
    },
  });

  const createPostMutation = api.posts.create.useMutation({
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
      <Card>
        <CardHeader>
          <CardTitle>{t("createNewPost-title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter>
                <Button type="submit">Create Post</Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Modal>
  );
}
