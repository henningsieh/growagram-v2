"use client";

// src/app/[locale]/(auth)/signin/page.tsx:
import * as React from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2, LogInIcon, MailCheckIcon } from "lucide-react";
import { FaDiscord, FaFacebook, FaGithub, FaTwitter } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { modulePaths } from "~/assets/constants";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
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
import { Link, useRouter } from "~/lib/i18n/routing";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("LoginPage");

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const emailVerified = searchParams.get("emailVerified") === "true";
  const callbackUrl =
    searchParams.get("callbackUrl") || modulePaths.DASHBOARD.path;

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target as HTMLFormElement);

    const result = await signIn("credentials", {
      email: formData.get("email") ?? "",
      password: formData.get("password") ?? "",
      callbackUrl,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      toast("Login successful", {
        description: "You have been logged in successfully",
      });
      router.push(callbackUrl);
    }
  }

  React.useEffect(() => {
    if (emailVerified) {
      toast(t("Email-verified-title"), {
        description: t("Email-verified-description"),
      });
    }
  }, [emailVerified, t]);

  return (
    <Card className="xs:mx-auto mx-2 my-auto w-full max-w-md">
      <div className="flex min-h-[680px] flex-col justify-between">
        <div className="w-full">
          <CardHeader className="space-y-3">
            <CardTitle className="xs:text-2xl flex justify-center text-xl">
              {t("title")}
            </CardTitle>
            <CardDescription className="xs:text-lg flex justify-center text-base">
              {t("description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={"grid gap-6"}>
              {/* Social Buttons */}
              <div className="space-y-3">
                {/* Google Button */}
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => signIn("google", { callbackUrl })}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 size-5 animate-spin" />
                  ) : (
                    <FcGoogle className="mr-2 size-5" />
                  )}{" "}
                  {t("login-with-google")}
                </Button>

                {/* Discord Button */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => signIn("discord", { callbackUrl })}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 size-5 animate-spin" />
                  ) : (
                    <FaDiscord className="mr-2 size-5 text-[#7289da]" />
                  )}{" "}
                  {t("login-with-discord")}
                </Button>

                {/* Facebook Button */}
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => signIn("facebook", { callbackUrl })}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 size-5 animate-spin" />
                  ) : (
                    <FaFacebook className="mr-2 size-5 text-[#1877F2]" />
                  )}{" "}
                  {t("login-with-facebook")}
                </Button>

                {/* Twitter Button */}
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => signIn("twitter", { callbackUrl })}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 size-5 animate-spin" />
                  ) : (
                    <FaTwitter className="mr-2 size-5 text-[#1DA1F2]" />
                  )}{" "}
                  {t("login-with-twitter")}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => signIn("github", { callbackUrl })}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <FaGithub className="mr-2 h-4 w-4 text-[#fafafa]" />
                  )}{" "}
                  {t("login-with-github")}
                </Button>
              </div>

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card text-muted-foreground px-2">
                    {t("continue-with-email")}
                  </span>
                </div>
              </div>
              {emailVerified && (
                <Alert
                  className="bg-accent text-primary-foreground mx-auto max-w-lg"
                  variant={"default"}
                >
                  <MailCheckIcon className="size-5" />
                  <AlertTitle>{t("Email-verified-title")}</AlertTitle>
                  <AlertDescription>
                    {t("Email-verified-description")}
                  </AlertDescription>
                </Alert>
              )}

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
                  {error && <p className="text-red-500">{error}</p>}
                  <Button
                    variant={"primary"}
                    size="lg"
                    className="w-full p-0 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 size-5 animate-spin" />
                    ) : (
                      <LogInIcon className="mr-2 size-5" />
                    )}
                    {t("submit")}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </div>
        <CardFooter className="justify-center text-sm font-semibold">
          {t("signUp.text")}
          &nbsp;
          <Link href="/signup" className="underline underline-offset-4">
            {t("signUp.link")}{" "}
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
