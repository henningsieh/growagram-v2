"use client";

// src/components/features/Account/edit-form.tsx:
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import {
  AtSign,
  CheckIcon,
  Edit,
  Loader2,
  Mail,
  RotateCcw,
  UserIcon,
} from "lucide-react";
import type { Session } from "next-auth";
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
import { useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { GetUserEditInput, UserType } from "~/server/api/root";
import { userEditSchema } from "~/types/zodSchema";

const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AccountEditForm({ user }: { user: UserType }) {
  const router = useRouter();
  const t = useTranslations("Account");
  const { toast } = useToast();
  const { data: session, status, update } = useSession();

  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [sessionHasBenUpdated, setSessionHasBenUpdated] =
    useState<Session | null>(null);
  const [username, setUsername] = useState(user.username || "");
  const [usernameModified, setUsernameModified] = useState(false);

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
      // Update session immediately
      setSessionHasBenUpdated(await update(updatedUser));
      toast({
        title: "Success",
        description: t("form-save-success-message"),
      });
      router.push("/account");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit the form
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

  // Wait for the user stopps typing
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
    form.trigger("username");
  };

  return (
    status === "authenticated" &&
    !sessionHasBenUpdated && (
      <PageHeader
        title={t("form-edit-profile-title")}
        subtitle={t("form-edit-profile-subtitle")}
        buttonLabel={t("form-back-button")}
        buttonLink="/account"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-4xl"
        >
          <FormContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Form {...form}>
                <Card className="overflow-hidden border-2 bg-card/95 backdrop-blur-sm">
                  <CardHeader className="relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
                    />
                    <div className="relative z-10">
                      <CardTitle className="text-2xl">
                        {t("form-profile-details")}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {t("form-profile-details-description")}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8">
                    <motion.div
                      variants={formVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-6"
                    >
                      {/* Name Field */}
                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="overflow-hidden rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                              <FormLabel className="text-base">
                                {t("form-name-label")}
                              </FormLabel>
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
                                <div className="relative mt-2">
                                  <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    className="bg-background/50 pl-10 font-medium transition-colors focus:bg-background"
                                    placeholder={t("form-name-placeholder")}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Username Field */}
                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem className="overflow-hidden rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                              <FormLabel
                                className={`text-base ${
                                  usernameCheck.data &&
                                  !usernameCheck.data.isUnique
                                    ? `text-destructive`
                                    : ``
                                }`}
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
                                    <div className="text-sm font-medium text-destructive">
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
                                <div className="relative mt-2 flex items-center">
                                  <AtSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    className="bg-background/50 pl-10 pr-10 font-medium transition-colors focus:bg-background"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    placeholder={t("form-username-placeholder")}
                                    {...field}
                                    onChange={(e) =>
                                      handleUsernameChange(e.target.value)
                                    }
                                  />
                                  <div className="absolute right-3 flex h-6 w-6 items-center justify-center">
                                    <AnimatePresence mode="wait">
                                      {!usernameCheck.isFetching ? (
                                        usernameCheck.data?.isUnique && (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                          >
                                            <CheckIcon className="h-5 w-5 text-green-600" />
                                          </motion.div>
                                        )
                                      ) : (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      {/* Email Field */}
                      <motion.div variants={itemVariants}>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="overflow-hidden rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted/70">
                              <FormLabel className="text-base">
                                {t("form-email-label")}
                              </FormLabel>
                              <FormDescription>
                                {t("form-email-description")}
                              </FormDescription>
                              <FormControl>
                                <div className="relative mt-2">
                                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    readOnly
                                    disabled
                                    type="email"
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    className="bg-background/50 pl-10 font-medium opacity-60"
                                    placeholder={t("form-email-placeholder")}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    </motion.div>
                  </CardContent>

                  <CardFooter className="flex gap-4 p-6 sm:p-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        setUsername(user.username || "");
                        setUsernameModified(false);
                      }}
                      className="group relative w-full overflow-hidden"
                    >
                      <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-background/0 via-background/40 to-background/0 transition-transform duration-500 group-hover:translate-x-[100%]" />
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {t("form-reset-button")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        editUserMutation.isPending ||
                        (usernameModified &&
                          (!usernameCheck.data?.isUnique || !username.trim()))
                      }
                      className="group relative w-full overflow-hidden bg-primary hover:bg-primary/90"
                    >
                      <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/20 to-primary-foreground/0 transition-transform duration-500 group-hover:translate-x-[100%]" />
                      {editUserMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Edit className="mr-2 h-4 w-4" />
                      )}
                      {t("form-save-button")}
                    </Button>
                  </CardFooter>
                </Card>
              </Form>
            </form>
          </FormContent>
        </motion.div>
      </PageHeader>
    )
  );
}
