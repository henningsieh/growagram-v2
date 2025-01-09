"use client";

import { Loader2, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Link } from "~/lib/i18n/routing";
import { useRouter } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  callbackUrl: string;
}

export function LoginForm({
  className,
  callbackUrl,
  ...props
}: LoginFormProps) {
  const t = useTranslations("LoginPage");
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target as HTMLFormElement);

    const result = await signIn("credentials", {
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
      callbackUrl,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      router.push(`/api/auth/error?error=${result.error}`);
    }
  }

  return (
    <Card className="mx-4 my-auto h-max max-w-md xs:mx-auto">
      <CardHeader className="space-y-3">
        <CardTitle className="flex justify-center text-2xl">
          {t("title")}
        </CardTitle>
        <CardDescription className="flex justify-center text-base">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-6", className)} {...props}>
          {/* Social Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FcGoogle className="mr-2 h-4 w-4" />
              )}{" "}
              {t("login-with-google")}
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => signIn("discord", { callbackUrl })}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FaDiscord className="mr-2 h-4 w-4 text-[#7289da]" />
              )}{" "}
              {t("login-with-discord")}
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => signIn("twitter", { callbackUrl })}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FaTwitter className="mr-2 h-4 w-4 text-[#1DA1F2]" />
              )}{" "}
              {t("login-with-twitter")}
            </Button>
          </div>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">
                {t("continue-with-email")}
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  {t("email.label")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("email.label")}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="password">
                  {t("password.label")}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t("password.label")}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect="off"
                  disabled={isLoading}
                />
              </div>
              <Button disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {t("submit")}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
      <CardFooter className="justify-center text-sm">
        {t("signUp.text")}
        &nbsp;
        <Link href="/signup" className="underline underline-offset-4">
          {t("signUp.link")}{" "}
        </Link>
      </CardFooter>
    </Card>
  );
}
