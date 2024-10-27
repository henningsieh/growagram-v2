// src/components/login-form.tsx
import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { FaDiscord } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
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
import { Link } from "~/lib/i18n/routing";

export function LoginForm() {
  const t = useTranslations("LoginPage");

  return (
    <Card className="mx-auto min-w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="my-4 space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t("password.label")}</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  {t("password.forgot")}
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
          <Button type="submit" className="relative w-full" size="lg">
            <LogIn size={24} className="absolute left-4" />
            {t("submit")}
          </Button>

          <Separator className="rounded-sm bg-muted-foreground/30" />

          <div className="space-y-2">
            <Button variant="outline" className="relative w-full" size="lg">
              <FcGoogle size={24} className="absolute left-4" />
              {t("googleLogin")}
            </Button>
            <Button variant="outline" className="relative w-full" size="lg">
              <FaDiscord size={24} className="absolute left-4" />

              {t("login-with-discord")}
            </Button>
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          {t("signUp.text")}{" "}
          <Link href="#" className="underline">
            {t("signUp.link")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
