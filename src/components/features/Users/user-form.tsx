"use client";

// src/components/features/Users/user-form.tsx:
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { AtSign, Edit, Image, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
import { api } from "~/lib/trpc/react";
import { GetUserEditInput, GetUserType } from "~/server/api/root";
import { userEditSchema } from "~/types/zodSchema";

export default function UserEditForm({
  user,
}: {
  user: NonNullable<GetUserType>;
}) {
  const { status, update } = useSession();
  const utils = api.useUtils();
  const { toast } = useToast();
  const t = useTranslations("Users");

  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [username, setUsername] = useState(""); // Local state to handle username input

  const form = useForm<GetUserEditInput>({
    mode: "onBlur",
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      id: user.id,
      name: user.name || undefined,
      username: user.username || undefined,
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
      await utils.users.getById.refetch({ id: updatedUser.id });
      await update(updatedUser);
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
    await editUserMutation.mutateAsync(values);
  }

  // Check username uniqueness
  // This hook will refetch username availability after typing stops
  const usernameCheck = api.users.isUsernameAvailable.useQuery(
    { username: username || "", excludeOwn: true },
    {
      enabled: false, // Disable auto-fetching
      refetchOnWindowFocus: false,
    },
  );

  const debouncedUsernameCheck = debounce(() => {
    usernameCheck.refetch(); // Trigger refetch when debounce completes
  }, 500); // 500ms debounce

  // Handle username change, debounce the API call
  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername); // Update local state
    if (typingTimeout) clearTimeout(typingTimeout); // Clear previous timer

    // Set new timer
    setTypingTimeout(
      setTimeout(() => {
        debouncedUsernameCheck(); // Call debounced function after delay
      }, 500),
    );

    form.setValue("username", newUsername); // Update react-hook-form state
  };

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
                        <FormDescription>
                          {t("form-name-description")}
                        </FormDescription>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-10"
                              placeholder={t("form-name-placeholder")}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Username Field */}

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form-username-label")}</FormLabel>
                        <AnimatePresence>
                          {usernameCheck.isFetching ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <div className="text-sm text-muted-foreground">
                                {t("form-username-checking")}
                              </div>
                            </motion.div>
                          ) : !usernameCheck.isFetching &&
                            usernameCheck.data &&
                            !usernameCheck.data.isUnique ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <div className="text-sm text-red-500">
                                {t("form-username-taken")}
                              </div>
                            </motion.div>
                          ) : (
                            <FormDescription>
                              {t("form-username-description")}
                            </FormDescription>
                          )}
                        </AnimatePresence>
                        <FormControl>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-10"
                              placeholder={t("form-username-placeholder")}
                              value={username} // Bind the input value to the local state
                              onChange={(e) =>
                                handleUsernameChange(e.target.value)
                              } // Update local state and form value
                            />
                          </div>
                        </FormControl>
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
                        <FormDescription>
                          {t("form-email-description")}
                        </FormDescription>
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
                        <FormDescription>
                          {t("form-profile-image-description")}
                        </FormDescription>
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
                      className={`mr-2 h-4 w-4 ${
                        editUserMutation.isPending && `animate-spin`
                      } `}
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
