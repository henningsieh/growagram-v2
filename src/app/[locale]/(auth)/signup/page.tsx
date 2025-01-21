"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { modulePaths } from "~/assets/constants";
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

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");
  const router = useRouter();
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
    const formData = new FormData(e.currentTarget);

    registerUserMutation.mutate({
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
      username: formData.get("username")?.toString() || "",
      name: formData.get("name")?.toString() || "",
    });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="my-4 space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email.label")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">{t("username.label")}</Label>
                <Input id="username" name="username" type="text" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">{t("name.label")}</Label>
                <Input id="name" name="name" type="text" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t("password.label")}</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button
              variant={"primary"}
              type="submit"
              className="relative w-full"
              size="lg"
            >
              {t("submit")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm">
          {t("login.text")}
          &nbsp;
          <Link
            href={modulePaths.SIGNIN.path}
            className="underline underline-offset-4"
          >
            {t("login.link")}{" "}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
