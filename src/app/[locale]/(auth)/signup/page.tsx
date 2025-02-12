"use client";

import { ClipboardPenLineIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Link, useRouter } from "~/lib/i18n/routing";
import { api } from "~/lib/trpc/react";
import type { Locale } from "~/types/locale";

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");
  const router = useRouter();
  const locale = useLocale() as Locale;
  const [error, setError] = useState<string | null>(null);

  const registerUserMutation = api.users.registerUser.useMutation({
    onSuccess: () => {
      router.push(modulePaths.SIGNIN.path);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    registerUserMutation.mutate({
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
      username: formData.get("username")?.toString() || "",
      name: formData.get("name")?.toString() || "",
      locale: locale,
    });
  };

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
            <form onSubmit={handleSubmit} className="grid w-full gap-4">
              <div className="my-4 space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("email.label")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="weedwarrior@gmail.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">{t("username.label")}</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="weedwarrior"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("name.label")}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Weed Warrior"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t("password.label")}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="********"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-500">{error}</p>}
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
            </form>
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
