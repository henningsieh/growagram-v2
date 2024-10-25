// src/components/login-form.tsx
import { useTranslations } from "next-intl";
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
              <Link href="#" className="ml-auto inline-block text-sm underline">
                {t("password.forgot")}
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            {t("submit")}
          </Button>
          <Button variant="outline" className="w-full">
            {t("googleLogin")}
          </Button>
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
