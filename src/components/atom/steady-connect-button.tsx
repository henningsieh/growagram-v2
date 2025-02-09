"use client";

// eslint-disable-next-line no-restricted-imports
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { connectToSteady } from "~/server/actions/connectToSteady";

export default function ConnectSteadyHQButton() {
  const t = useTranslations("Premium");
  return (
    <form action={connectToSteady}>
      <Button size="lg" type="submit">
        {t("connect-with-steady")}
      </Button>
    </form>
  );
}
