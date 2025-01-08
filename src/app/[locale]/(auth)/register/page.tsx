"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Link, useRouter } from "~/lib/i18n/routing";

export default function RegisterPage() {
  const t = useTranslations("RegisterPage");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email")?.toString() || "",
        password: formData.get("password")?.toString() || "",
        username: formData.get("username")?.toString() || "",
        name: formData.get("name")?.toString() || "",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      router.push("/login");
    } else {
      setError(data.error);
    }
  };

  return (
    <Card className="mx-auto min-w-full">
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

        <Separator className="rounded-sm bg-muted-foreground/30" />

        <div className="mt-4 text-center text-sm">
          {t("login.text")}{" "}
          <Link href="/login" className="underline">
            {t("login.link")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
