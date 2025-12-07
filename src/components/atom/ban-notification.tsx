"use client";

import { useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

import { toast } from "sonner";

import type { Locale } from "~/types/locale";

import { formatAbsoluteDate, formatAbsoluteTime } from "~/lib/utils";

export function BanNotification() {
  const searchParams = useSearchParams();
  const locale = useLocale() as Locale;
  const t = useTranslations("Authentication.ban");

  useEffect(() => {
    // Check if the user was redirected due to a ban
    const error = searchParams.get("error");
    const bannedUntil = searchParams.get("bannedUntil");
    const banReason = searchParams.get("banReason");

    if (error === "banned" && bannedUntil) {
      const bannedUntilDate = new Date(bannedUntil);
      const formattedDate = formatAbsoluteDate(bannedUntilDate, locale, {
        force: true,
        month: "long",
      });
      const formattedTime = formatAbsoluteTime(bannedUntilDate, locale);

      // Create the toast message with the formatted date using translations
      toast.error(t("account_banned"), {
        description:
          t("account_banned_until", {
            date: formattedDate || "",
            time: formattedTime,
          }) +
          " " +
          t("ban_reason", {
            reason: banReason || t("no_reason_provided"),
          }),
        duration: 10000,
      });

      // No URL manipulation - keep it simple and avoid routing issues
    }
  }, [searchParams, locale, t]);

  return null;
}
