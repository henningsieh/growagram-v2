"use client";

// src/components/features/Account/edit-form.tsx:
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { AtSign, CheckIcon, Edit, Loader2, Mail, UserIcon } from "lucide-react";
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

export default function AccountEditForm({
  user,
}: {
  user: NonNullable<GetUserType>;
}) {
  const { data: session, status, update } = useSession();
  const utils = api.useUtils();
  const { toast } = useToast();
  const t = useTranslations("Account");

  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [username, setUsername] = useState(user.username || ""); // Initialize with existing username
  const [usernameModified, setUsernameModified] = useState(false);

  useEffect(() => {
    console.debug({ session });
  }, [session]);

  const form = useForm<GetUserEditInput>({
    mode: "onBlur",
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      id: user.id,
      name: user.name || undefined,
      username: user.username || undefined,
      email: user.email || undefined,
      // image: user.image || undefined,
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
  const usernameCheck = api.users.isUsernameAvailable.useQuery(
    { username: username || "", excludeOwn: true },
    {
      enabled: false,
      refetchOnWindowFocus: false,
    },
  );

  const debouncedUsernameCheck = debounce(() => {
    usernameCheck.refetch();
  }, 500);

  // Handle username change, debounce the API call
  const handleUsernameChange = (newUsername: string) => {
    setUsername(newUsername);
    setUsernameModified(true); // Mark that username has been modified

    if (typingTimeout) clearTimeout(typingTimeout);

    setTypingTimeout(
      setTimeout(() => {
        debouncedUsernameCheck();
      }, 500),
    );

    form.setValue("username", newUsername);
    form.trigger("username"); // Trigger validation
  };

  return (
    status === "authenticated" && (
      <PageHeader
        title={t("form-edit-profile-title")}
        subtitle={t("form-edit-profile-subtitle")}
        buttonLabel={t("form-back-button")}
        buttonLink="/account"
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
                        <AnimatePresence mode="wait">
                          {form.formState.errors.name ? (
                            <motion.div
                              key="error"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FormMessage />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="description"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FormDescription>
                                {t("form-name-description")}
                              </FormDescription>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                      </FormItem>
                    )}
                  />

                  {/* Username Field */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className={
                            usernameCheck.data && !usernameCheck.data.isUnique
                              ? `text-red-500`
                              : ``
                          }
                        >
                          {t("form-username-label")}
                        </FormLabel>
                        <AnimatePresence>
                          {usernameCheck.isFetching ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <div className="text-[0.8rem] text-muted-foreground">
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
                              <div className="text-sm font-semibold text-red-500">
                                {t("form-username-taken")}
                              </div>
                            </motion.div>
                          ) : form.formState.errors.username ? (
                            <FormMessage />
                          ) : (
                            <FormDescription>
                              {t("form-username-description")}
                            </FormDescription>
                          )}
                        </AnimatePresence>
                        <FormControl>
                          <div className="relative flex items-center">
                            <AtSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              className="pl-10 pr-10" // Add right padding to make space for icon
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              placeholder={t("form-username-placeholder")}
                              value={username}
                              onChange={(e) =>
                                handleUsernameChange(e.target.value)
                              }
                            />
                            <div className="absolute right-3 flex h-6 w-6 items-center justify-center">
                              {!usernameCheck.isFetching ? (
                                usernameCheck.data &&
                                usernameCheck.data.isUnique && (
                                  <CheckIcon className="h-6 w-6 text-green-600" />
                                )
                              ) : (
                                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                              )}
                            </div>
                          </div>
                        </FormControl>
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
                              readOnly
                              disabled
                              type="email"
                              autoComplete="off"
                              autoCapitalize="off"
                              spellCheck="false"
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
                  {/* <FormField
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
                  /> */}
                </CardContent>

                <CardFooter className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setUsername(user.username || "");
                      setUsernameModified(false);
                    }}
                    className="w-full"
                  >
                    {t("form-reset-button")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      editUserMutation.isPending ||
                      (usernameModified &&
                        (!usernameCheck.data?.isUnique || !username.trim()))
                    }
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
