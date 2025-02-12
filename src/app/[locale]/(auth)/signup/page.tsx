"use client";

// src/app/[locale]/(auth)/signup/page.tsx:
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import { motion } from "framer-motion";
import { AtSign, ClipboardPenLineIcon, Mail, UserIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { modulePaths } from "~/assets/constants";
import SpinningLoader from "~/components/Layouts/loader";
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
import { Input } from "~/components/ui/input";
import { Link, useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import { RegisterUserInput } from "~/server/api/root";
import type { Locale } from "~/types/locale";
import { createRegisterSchema, registerSchema } from "~/types/zodSchema";

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

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");
  const router = useRouter();
  const locale = useLocale() as Locale;

  const form = useForm<RegisterUserInput>({
    mode: "onBlur",
    resolver: zodResolver(useMemo(() => createRegisterSchema(t), [t])),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      name: "",
      locale,
    },
  });

  const registerUserMutation = api.users.registerUser.useMutation({
    onSuccess: () => {
      router.push(modulePaths.SIGNIN.path);
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        if (error.message === "BOTH_TAKEN") {
          form.setError("email", {
            type: "manual",
            message: t("errors.emailTaken"),
          });
          form.setError("username", {
            type: "manual",
            message: t("errors.usernameTaken"),
          });
        } else if (error.message === "EMAIL_TAKEN") {
          form.setError("email", {
            type: "manual",
            message: t("errors.emailTaken"),
          });
        } else if (error.message === "USERNAME_TAKEN") {
          form.setError("username", {
            type: "manual",
            message: t("errors.usernameTaken"),
          });
        }
      }
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await registerUserMutation.mutateAsync(values);
      console.debug("Registered user: ", user);
    } catch (error) {
      console.warn("Failed to register user: ", error);
      return false;
    }
  });

  return (
    <Card className="mx-2 my-auto w-full max-w-md xs:mx-auto">
      <div className="flex min-h-[680px] flex-col justify-between">
        <div className="w-full">
          <CardHeader className="space-y-3">
            <CardTitle className="flex justify-center text-xl xs:text-2xl">
              {t("title")}
            </CardTitle>
            <CardDescription className="flex justify-center text-base xs:text-lg">
              {t("description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={onSubmit} className="grid w-full gap-4">
                <motion.div
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {/* Email Field */}
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email.label")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
                              <Input
                                className="pl-10"
                                placeholder="weedwarrior@gmail.com"
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
                        <FormItem>
                          <FormLabel>{t("username.label")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
                              <Input
                                className="pl-10"
                                placeholder="weedwarrior"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Name Field */}
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("name.label")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
                              <Input
                                className="pl-10"
                                placeholder="Weed Warrior"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {/* Password Field */}
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password.label")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="********"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <Button
                    type="submit"
                    disabled={registerUserMutation.isPending}
                    variant={"primary"}
                    size="lg"
                    className="w-full"
                  >
                    {registerUserMutation.isPending ? (
                      <SpinningLoader className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <ClipboardPenLineIcon className="mr-2 h-5 w-5" />
                    )}
                    {t("submit")}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </div>
        <CardFooter className="justify-center text-sm font-semibold">
          {t("login.text")}
          &nbsp;
          <Link
            href={modulePaths.SIGNIN.path}
            className="underline underline-offset-4"
          >
            {t("login.link")}{" "}
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
