"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  AtSign,
  Ban,
  CheckIcon,
  Edit,
  LockIcon,
  Mail,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { BAN_DURATIONS } from "~/assets/constants";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import { CustomAvatar } from "~/components/atom/custom-avatar";
import SpinningLoader from "~/components/atom/spinning-loader";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useIsMobile } from "~/hooks/use-mobile";
import { useTRPC } from "~/lib/trpc/client";
import { UserRoles } from "~/types/user";
import { adminEditUserSchema } from "~/types/zodSchema";

// Form animations
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

// Ban form schema
const banUserSchema = z.object({
  banDuration: z.string().min(1, "Ban duration is required"),
  banReason: z
    .string()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason must be less than 500 characters"),
});

type BanUserInput = z.infer<typeof banUserSchema>;

// Use the imported validation schema
type AdminEditUserInput = z.infer<typeof adminEditUserSchema>;

export default function AdminUserEditForm({ userId }: { userId: string }) {
  const trpc = useTRPC();
  const t = useTranslations("AdminArea.user-management.edit-form");
  const router = useRouter();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Force refresh user data when component mounts
  React.useEffect(() => {
    // Invalidate user-specific query to ensure fresh data
    void queryClient.invalidateQueries(
      trpc.admin.getUserById.queryFilter({ id: userId }),
    );
  }, [userId, queryClient, trpc.admin.getUserById]);

  // Get user data and always refetch
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery(
    trpc.admin.getUserById.queryOptions(
      { id: userId },
      {
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        staleTime: 0, // Consider data immediately stale to force refetch
      },
    ),
  );

  // Handle error with useEffect instead of in the query options
  React.useEffect(() => {
    if (userError) {
      toast.error(t("error-loading-user-title"), {
        description: userError.message,
      });
      router.push("/admin");
    }
  }, [userError, router, t]);

  // Ban user form and mutation
  const banForm = useForm<BanUserInput>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      banDuration: "1d",
      banReason: "",
    },
  });

  // Ban user mutation
  const banUserMutation = useMutation(
    trpc.admin.banUser.mutationOptions({
      onSuccess: async () => {
        // Invalidate queries to refetch the latest data
        await queryClient.invalidateQueries(
          trpc.admin.getUserById.queryFilter({ id: userId }),
        );
        await queryClient.invalidateQueries(
          trpc.admin.getAllUsers.pathFilter(),
        );

        toast.success("User banned successfully", {
          description:
            "The user has been banned and cannot log in until the ban expires.",
        });
        banForm.reset();
      },
      onError: (error) => {
        toast.error("Failed to ban user", {
          description: error.message || "An unexpected error occurred",
        });
      },
    }),
  );

  // Unban user mutation
  const unbanUserMutation = useMutation(
    trpc.admin.unbanUser.mutationOptions({
      onSuccess: async () => {
        // Invalidate queries to refetch the latest data
        await queryClient.invalidateQueries(
          trpc.admin.getUserById.queryFilter({ id: userId }),
        );
        await queryClient.invalidateQueries(
          trpc.admin.getAllUsers.pathFilter(),
        );

        toast.success("User unbanned successfully", {
          description:
            "The user's ban has been lifted and they can now log in.",
        });
      },
      onError: (error) => {
        toast.error("Failed to unban user", {
          description: error.message || "An unexpected error occurred",
        });
      },
    }),
  );

  // Handle ban form submission
  const onBanSubmit = async (values: BanUserInput) => {
    await banUserMutation.mutateAsync({
      userId,
      banDuration: values.banDuration,
      banReason: values.banReason,
    });
  };

  // Handle unban user
  const handleUnban = async () => {
    await unbanUserMutation.mutateAsync({ userId });
  };

  // Check if user is currently banned
  const isUserBanned = React.useMemo(() => {
    if (!user?.bannedUntil) return false;
    const bannedUntil = new Date(user.bannedUntil);
    return bannedUntil > new Date() || user.bannedUntil === null; // null means permanent ban
  }, [user?.bannedUntil]);

  // Initialize form with user data when it's loaded
  const form = useForm<AdminEditUserInput>({
    resolver: zodResolver(adminEditUserSchema),
    defaultValues: {
      id: userId,
      name: "",
      username: "",
      email: "",
      role: UserRoles.USER,
      image: null,
    },
    values: user
      ? {
          id: user.id,
          name: user.name || "",
          username: user.username || "",
          email: user.email || "",
          role: user.role as UserRoles,
          image: user.image,
        }
      : undefined,
  });

  // Update user mutation with cache invalidation
  const updateUserMutation = useMutation(
    trpc.admin.updateUserDetails.mutationOptions({
      onSuccess: async () => {
        // Invalidate queries to refetch the latest data
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.admin.getUserById.queryFilter({ id: userId }),
          ),
          queryClient.invalidateQueries(trpc.admin.getAllUsers.pathFilter()),
        ]);

        toast.success(t("success-title"), {
          description: t("success-description"),
        });
        router.push("/admin");
      },
      onError: (error) => {
        toast.error(t("error-title"), {
          description: error.message || t("error-description"),
        });
      },
    }),
  );

  // Handle form submission
  const onSubmit = async (values: AdminEditUserInput) => {
    await updateUserMutation.mutateAsync(values);
  };

  // Format date utility
  const formatDate = (date: Date | null) => {
    if (!date) return t("not-available");
    return format(new Date(date), "PPP");
  };

  return (
    <PageHeader
      title={t("title")}
      subtitle={t("subtitle")}
      buttonLink="/admin"
      buttonLabel={t("back-button")}
      buttonVariant="outline"
      buttonIcon={<ArrowLeft className="mr-2 h-4 w-4" />}
    >
      <AnimatePresence>
        {userLoading ? (
          <div className="flex h-[400px] w-full items-center justify-center">
            <SpinningLoader className="h-8 w-8" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto w-full max-w-2xl"
          >
            <FormContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Form {...form}>
                  <Card className="overflow-hidden border-2 backdrop-blur">
                    <CardHeader className="relative">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="from-primary/10 absolute inset-0 bg-linear-to-br to-transparent"
                      />
                      <div className="flex items-center gap-4">
                        <CustomAvatar
                          size={64}
                          src={user?.image || undefined}
                          alt={user?.name || "User"}
                          fallback={user?.name?.[0] || "?"}
                        />
                        <div className="flex flex-col">
                          <CardTitle className="text-xl font-bold">
                            {user?.name}
                          </CardTitle>
                          <span className="text-muted-foreground text-sm">
                            {"@"}
                            {user?.username}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <Separator className="opacity-50" />

                    {/* User metadata */}
                    <div className="bg-muted/30 grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <h3 className="text-muted-foreground text-xs font-medium">
                          {t("user-id")}
                        </h3>
                        <p className="text-sm font-medium">{user?.id}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-muted-foreground text-xs font-medium">
                          {t("email-verified")}
                        </h3>
                        <p className="text-sm font-medium">
                          {user?.emailVerified ? (
                            <span className="inline-flex items-center text-green-600">
                              <CheckIcon className="mr-1 h-4 w-4" />
                              {t("verified")}
                            </span>
                          ) : (
                            <span className="text-destructive inline-flex items-center">
                              <XIcon className="mr-1 h-4 w-4" />
                              {t("not-verified")}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-muted-foreground text-xs font-medium">
                          {t("created-at")}
                        </h3>
                        <p className="text-sm font-medium">
                          {formatDate(user?.createdAt as Date)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-muted-foreground text-xs font-medium">
                          {t("updated-at")}
                        </h3>
                        <p className="text-sm font-medium">
                          {formatDate(user?.updatedAt as Date)}
                        </p>
                      </div>
                    </div>

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
                                  {t("name-label")}
                                </FormLabel>
                                <FormDescription>
                                  {t("name-description")}
                                </FormDescription>
                                <FormControl>
                                  <div className="relative mt-2">
                                    <UserIcon className="text-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                                    <Input
                                      className="bg-background/50 focus:bg-background pl-10 font-medium transition-colors"
                                      placeholder={t("name-placeholder")}
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
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
                                <FormLabel className="text-base">
                                  {t("username-label")}
                                </FormLabel>
                                <FormDescription>
                                  {t("username-description")}
                                </FormDescription>
                                <FormControl>
                                  <div className="relative mt-2">
                                    <AtSign className="text-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                      className="bg-background/50 focus:bg-background pl-10 font-medium transition-colors"
                                      autoComplete="off"
                                      autoCorrect="off"
                                      autoCapitalize="off"
                                      spellCheck="false"
                                      placeholder={t("username-placeholder")}
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
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
                                  {t("email-label")}
                                </FormLabel>
                                <FormDescription>
                                  {t("email-description")}
                                </FormDescription>
                                <FormControl>
                                  <div className="relative mt-2">
                                    <Mail className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                                    <Input
                                      type="email"
                                      autoComplete="off"
                                      autoCapitalize="off"
                                      spellCheck="false"
                                      className="bg-background/50 pl-10 font-medium"
                                      placeholder={t("email-placeholder")}
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        {/* Role Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem className="bg-muted/50 hover:bg-muted/70 overflow-hidden rounded-sm p-4 transition-colors">
                                <FormLabel className="text-base">
                                  {t("role-label")}
                                </FormLabel>
                                <FormDescription>
                                  {t("role-description")}
                                </FormDescription>
                                <div className="relative mt-2">
                                  <ShieldCheck className="text-foreground absolute top-1/2 left-3 z-10 h-5 w-5 -translate-y-1/2" />
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-background/50 focus:bg-background pl-10 font-medium transition-colors">
                                        <SelectValue
                                          placeholder={t("role-placeholder")}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value={UserRoles.USER}>
                                        {t("role-user")}
                                      </SelectItem>
                                      <SelectItem value={UserRoles.MOD}>
                                        {t("role-moderator")}
                                      </SelectItem>
                                      <SelectItem value={UserRoles.ADMIN}>
                                        {t("role-admin")}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        {/* Image URL Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                              <FormItem className="bg-muted/50 hover:bg-muted/70 overflow-hidden rounded-sm p-4 transition-colors">
                                <FormLabel className="text-base">
                                  {t("image-label")}
                                </FormLabel>
                                <FormDescription>
                                  {t("image-description")}
                                </FormDescription>
                                <FormControl>
                                  <Input
                                    className="bg-background/50 focus:bg-background font-medium transition-colors"
                                    placeholder={t("image-placeholder")}
                                    {...field}
                                    value={field.value || ""}
                                  />
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
                        }}
                        className="group relative flex-1 overflow-hidden"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t("reset-button")}
                      </Button>
                      <Button
                        size={isMobile ? "sm" : "default"}
                        type="submit"
                        disabled={updateUserMutation.isPending}
                        className="group relative flex-1 overflow-hidden"
                      >
                        {updateUserMutation.isPending ? (
                          <SpinningLoader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Edit className="mr-2 h-4 w-4" />
                        )}
                        {t("save-button")}
                      </Button>
                    </CardFooter>
                  </Card>
                </Form>
              </form>

              {/* Ban User Form */}
              <Form {...banForm}>
                <form onSubmit={banForm.handleSubmit(onBanSubmit)}>
                  <Card className="mt-4 overflow-hidden border-2 backdrop-blur">
                    <CardHeader className="relative">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="from-destructive/10 absolute inset-0 bg-linear-to-br to-transparent"
                      />
                      <div className="flex items-center gap-4">
                        <ShieldAlert className="text-destructive h-8 w-8" />
                        <div className="flex flex-col">
                          <CardTitle className="text-xl font-bold">
                            {t("ban-title")}
                          </CardTitle>
                          <span className="text-muted-foreground text-sm">
                            {t("ban-subtitle")}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <Separator className="opacity-50" />
                    <CardContent className="p-2 sm:p-8">
                      <motion.div
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                      >
                        {/* Ban Duration Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={banForm.control}
                            name="banDuration"
                            render={({ field }) => (
                              <FormItem className="bg-muted/50 hover:bg-muted/70 overflow-hidden rounded-sm p-4 transition-colors">
                                <FormLabel className="text-base">
                                  {t("ban-duration-label")}
                                </FormLabel>
                                <FormDescription>
                                  {t("ban-duration-description")}
                                </FormDescription>
                                <div className="relative mt-2">
                                  <LockIcon className="text-foreground absolute top-1/2 left-3 z-10 h-5 w-5 -translate-y-1/2" />
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        className="pl-10"
                                        // className="bg-background/50 focus:bg-background pl-10 font-medium transition-colors"
                                      >
                                        <SelectValue
                                          placeholder={t("ban-duration")}
                                        />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {BAN_DURATIONS.map((duration) => (
                                        <SelectItem
                                          key={duration.value}
                                          value={duration.value}
                                        >
                                          {duration.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        {/* Ban Reason Field */}
                        <motion.div variants={itemVariants}>
                          <FormField
                            control={banForm.control}
                            name="banReason"
                            render={({ field }) => (
                              <FormItem className="bg-muted/50 hover:bg-muted/70 overflow-hidden rounded-sm p-4 transition-colors">
                                <FormLabel className="text-base">
                                  {t("ban-reason-label")}
                                </FormLabel>
                                <FormDescription>
                                  {t("ban-reason-description")}
                                </FormDescription>
                                <FormControl>
                                  <Textarea
                                    // className="bg-background/50 focus:bg-background font-medium transition-colors"
                                    placeholder={t("ban-reason-placeholder")}
                                    {...field}
                                  />
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
                          banForm.reset();
                        }}
                        className="group relative flex-1 overflow-hidden"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t("ban-reset-button")}
                      </Button>
                      <Button
                        size={isMobile ? "sm" : "default"}
                        type="submit"
                        disabled={banUserMutation.isPending}
                        className="group relative flex-1 overflow-hidden"
                      >
                        {banUserMutation.isPending ? (
                          <SpinningLoader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Ban className="mr-2 h-4 w-4" />
                        )}
                        {t("ban-submit-button")}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>

              {/* Unban User Button */}
              {isUserBanned && (
                <Card className="mt-4 overflow-hidden border-2 backdrop-blur">
                  <CardHeader className="relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="from-primary/10 absolute inset-0 bg-linear-to-br to-transparent"
                    />
                    <div className="flex items-center gap-4">
                      <Unlock className="text-primary h-8 w-8" />
                      <div className="flex flex-col">
                        <CardTitle className="text-xl font-bold">
                          {t("unban-title")}
                        </CardTitle>
                        <span className="text-muted-foreground text-sm">
                          {t("unban-subtitle")}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator className="opacity-50" />
                  <CardFooter className="flex p-2 sm:p-8">
                    <Button
                      size={isMobile ? "sm" : "default"}
                      type="button"
                      variant="outline"
                      onClick={handleUnban}
                      disabled={unbanUserMutation.isPending}
                      className="group relative flex-1 overflow-hidden"
                    >
                      {unbanUserMutation.isPending ? (
                        <SpinningLoader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Unlock className="mr-2 h-4 w-4" />
                      )}
                      {t("unban-button")}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </FormContent>
          </motion.div>
        )}
      </AnimatePresence>
    </PageHeader>
  );
}
