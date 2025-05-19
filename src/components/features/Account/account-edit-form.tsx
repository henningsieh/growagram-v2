"use client";

// src/components/features/Account/edit-form.tsx:
import * as React from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import {
  AtSign,
  CheckIcon,
  Edit,
  Mail,
  RotateCcw,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import SpinningLoader from "~/components/atom/spinning-loader";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
import { Separator } from "~/components/ui/separator";
import { useIsMobile } from "~/hooks/use-mobile";
import { useRouter } from "~/lib/i18n/routing";
import { useTRPC } from "~/lib/trpc/react";
import type { EditUserInput, OwnUserDataType } from "~/server/api/root";
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

export default function AccountEditForm({ user }: { user: OwnUserDataType }) {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const router = useRouter();
  const t = useTranslations("Account");

  const { status, update } = useSession();

  const [typingTimeout, setTypingTimeout] =
    React.useState<NodeJS.Timeout | null>(null);
  const [username, setUsername] = React.useState(user?.username || "");
  const [usernameModified, setUsernameModified] = React.useState(false);

  const form = useForm<EditUserInput>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      id: user.id,
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      image: user.image,
    },
  });

  const editUserMutation = useMutation(
    trpc.users.editUser.mutationOptions({
      onSuccess: async (updatedUser) => {
        // 1. Update session
        await update({
          name: updatedUser.name,
          username: updatedUser.username,
        });

        // 2. Show success message
        toast(t("form-save-success-title"), {
          description: t("form-save-success-message"),
        });

        // 3. Redirect to account page
        router.push("/account");
      },
      onError: (error) => {
        toast.error(t("toast-error-save.title"), {
          description: t("toast-error-save.description"),
        });
        console.error("Error updating user:", error);
      },
    }),
  );

  const onSubmit = async (values: EditUserInput) => {
    await editUserMutation.mutateAsync(values);
  };

  // Check username uniqueness
  const usernameCheck = useQuery(
    trpc.users.isUsernameAvailable.queryOptions(
      { username: username, excludeOwn: true },
      {
        enabled: form.formState.dirtyFields.username,
        refetchOnWindowFocus: false,
      },
    ),
  );

  // Wait for the user stopps typing
  const debouncedUsernameCheck = debounce(async () => {
    await usernameCheck.refetch();
  }, 500);

  // Handle username change, debounce the API call
  const handleUsernameChange = (newUsername: string) => {
    setUsernameModified(true); // Mark that username has been modified

    setUsername(newUsername);

    if (typingTimeout) clearTimeout(typingTimeout);

    setTypingTimeout(
      setTimeout(() => {
        void debouncedUsernameCheck();
      }, 500),
    );

    form.setValue("username", newUsername);
    void form.trigger("username");
  };

  console.debug("form.formState.errors:", form.formState.errors);
  console.debug("usernameCheck.data:", usernameCheck.data);

  return (
    status === "authenticated" && (
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
          className="mx-auto w-full max-w-2xl"
        >
          {!user.username && (
            <Alert className="border-secondary bg-secondary/80 mb-4 border-2">
              <AlertTitle className="text-accent-foreground text-lg">
                {t("welcome-message-title")}
              </AlertTitle>
              <AlertDescription className="text-accent-foreground text-base">
                {t("welcome-message-description")}
              </AlertDescription>
            </Alert>
          )}
          <FormContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Form {...form}>
                <Card className="bg-card/95 overflow-hidden border-2 backdrop-blur">
                  <CardHeader className="relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="from-primary/10 absolute inset-0 bg-linear-to-br to-transparent"
                    />
                    <AvatarCardHeader
                      user={{ ...form.watch(), role: user.role }}
                    />
                  </CardHeader>
                  <Separator className="opacity-50" />
                  <CardContent className="p-2 sm:p-8">
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
                            <FormItem className="bg-muted/50 hover:bg-muted/70 overflow-hidden rounded-sm p-4 transition-colors">
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
                                  <UserIcon className="text-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                                  <Input
                                    className="bg-background/50 focus:bg-background pl-10 font-medium transition-colors"
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
                            <FormItem className="bg-muted/50 hover:bg-muted/70 overflow-hidden rounded-sm p-4 transition-colors">
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
                                    <div className="text-muted-foreground text-sm">
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
                                    <div className="text-destructive text-sm font-medium">
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
                                  <AtSign className="text-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                  <Input
                                    className="bg-background/50 focus:bg-background pr-10 pl-10 font-medium transition-colors"
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
                                        // check if username is unique in the database
                                        usernameCheck.data?.isUnique &&
                                        // check for formfield username has no error
                                        !form.formState.errors.username ? (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                          >
                                            <CheckIcon className="h-5 w-5 text-green-600" />
                                          </motion.div>
                                        ) : (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                          >
                                            <XIcon className="text-destructive h-6 w-6" />
                                          </motion.div>
                                        )
                                      ) : (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                          <SpinningLoader className="h-6 w-6" />
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
                            <FormItem className="bg-muted/50 hover:bg-muted/70 overflow-hidden rounded-sm p-4 transition-colors">
                              <FormLabel className="text-muted-foreground text-base">
                                {t("form-email-label")}
                              </FormLabel>
                              <FormDescription>
                                {t("form-email-description")}
                              </FormDescription>
                              <FormControl>
                                <div className="relative mt-2">
                                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                                  <Input
                                    readOnly={!!user.email} // Disable input if email is set
                                    disabled={!!user.email} // Disable input if email is set
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

                  <CardFooter className="flex gap-2 p-2 sm:p-8">
                    <Button
                      size={isMobile ? "sm" : "default"}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        setUsername(user?.username || "");
                        setUsernameModified(false);
                      }}
                      className="group relative flex-1 overflow-hidden"
                    >
                      {/* <div className="from-background/0 via-background/40 to-background/0 absolute inset-0 translate-x-[-100%] bg-linear-to-r transition-transform duration-500 group-hover:translate-x-[100%]" /> */}
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {t("form-reset-button")}
                    </Button>
                    <Button
                      size={isMobile ? "sm" : "default"}
                      type="submit"
                      disabled={
                        editUserMutation.isPending ||
                        (usernameModified &&
                          (!usernameCheck.data?.isUnique || !username.trim()))
                      }
                      className="group relative flex-1 overflow-hidden"
                    >
                      {/* <div className="from-primary-foreground/0 via-primary-foreground/20 to-primary-foreground/0 absolute inset-0 translate-x-[-100%] bg-linear-to-r transition-transform duration-500 group-hover:translate-x-[100%]" /> */}
                      {editUserMutation.isPending ? (
                        <SpinningLoader className="mr-2 h-4 w-4 animate-spin" />
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
