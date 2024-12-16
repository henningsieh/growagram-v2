"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Image, Mail, User as UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import {
  GetUserEditInput,
  GetUserEditType,
  GetUserType,
} from "~/server/api/root";
import { userEditSchema } from "~/types/zodSchema";

// type FormValues = z.infer<typeof userEditSchema>;

export default function UserEditForm({
  user,
}: {
  user: NonNullable<GetUserType>;
}) {
  const { data: session, status, update } = useSession();
  const utils = api.useUtils();
  const router = useRouter();
  const { toast } = useToast();

  const t = useTranslations("Users");

  const form = useForm<GetUserEditInput>({
    mode: "onBlur",
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      id: user.id,
      name: user.name || undefined,
      email: user.email || undefined,
      image: user.image || undefined,
    },
  });

  const editUserMutation = api.users.editUser.useMutation({
    onSuccess: async (updatedUser) => {
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });

      // Invalidate and refetch user data
      await utils.users.getById.refetch({ id: updatedUser.id });

      // Navigate back to user profile or dashboard
      console.debug("updatedUser.name: ", updatedUser.name);
      await update(updatedUser satisfies GetUserEditType);
      // router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: GetUserEditInput) {
    alert("aspdb");
    await editUserMutation.mutateAsync(values satisfies GetUserEditInput);
  }

  return (
    status === "authenticated" && (
      <PageHeader
        title={t("form-edit-profile-title")}
        subtitle={t("form-edit-profile-subtitle")}
        buttonLabel={t("form-back-button")}
        buttonLink="/profile"
      >
        <FormContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Form {...form}>
              <Card>
                <CardHeader>
                  <CardTitle>{t("form-profile-details")}</CardTitle>
                  <CardDescription>
                    {t("form-profile-details-description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form-name-label")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-10"
                              placeholder={t("form-name-placeholder")}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("form-name-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form-email-label")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              className="pl-10"
                              placeholder={t("form-email-placeholder")}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("form-email-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Profile Image Field */}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form-profile-image-label")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Image className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="url"
                              className="pl-10"
                              placeholder={t("form-profile-image-placeholder")}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("form-profile-image-description")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardFooter className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="w-full"
                  >
                    {t("form-reset-button")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={editUserMutation.isPending}
                    className="w-full"
                  >
                    <Edit
                      className={`mr-2 h-4 w-4 ${editUserMutation.isPending && `animate-spin`} `}
                    />
                    {t("form-save-button")}
                  </Button>
                </CardFooter>
              </Card>
            </Form>
          </form>
        </FormContent>
      </PageHeader>
    )
  );
}
