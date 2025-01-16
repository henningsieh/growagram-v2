"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShareIcon } from "lucide-react";
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
import { Modal } from "~/components/ui/modal";
import { Textarea } from "~/components/ui/textarea";
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
      <Card className="p1 xs:p2 w-full max-w-6xl space-y-4 rounded-md shadow-lg sm:p-4">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle as="h2" className="text-xl">
              {t("createNewPost-title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          <CardFooter>
            <Button type="submit" className="w-full font-semibold">
              <ShareIcon className="mr-0 h-6 w-6" />
              {t("buttonLabel-createNewPost")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
}
