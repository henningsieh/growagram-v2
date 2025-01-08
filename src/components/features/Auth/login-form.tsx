"use client";

import { Loader2, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Link } from "~/lib/i18n/routing";
import { useRouter } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";
import { signInWithProvider } from "~/server/actions/authActions";

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
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              {t("email.label")}
            </Label>
            <Input
              id="email"
              placeholder={t("email.label")}
              type="email"
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
              placeholder={t("password.label")}
              type="password"
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
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("social-identity-oauth-providers")}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => signInWithProvider("google", callbackUrl)}
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
          onClick={() => signInWithProvider("discord", callbackUrl)}
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
          onClick={() => signInWithProvider("twitter", callbackUrl)}
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
    </div>
  );
}
