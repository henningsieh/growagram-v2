"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { formatDate, formatTime } from "~/lib/utils";
import type { Locale } from "~/types/locale";

export function BanNotification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("Authentication.ban");

  useEffect(() => {
    // Check if the user was redirected due to a ban
    const error = searchParams.get("error");
    const bannedUntil = searchParams.get("bannedUntil");
    const banReason = searchParams.get("banReason");

    if (error === "banned" && bannedUntil) {
      const bannedUntilDate = new Date(bannedUntil);
      const formattedDate = formatDate(bannedUntilDate, locale, {
        force: true,
        month: "long",
      });
      const formattedTime = formatTime(bannedUntilDate, locale);

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

      // Clean up the URL by removing the ban parameters
      // Create a new URL without the ban parameters
      const url = new URL(window.location.href);
      url.searchParams.delete("bannedUntil");
      url.searchParams.delete("banReason");
      //   url.searchParams.delete("error");

      console.debug("removing the ban parameters");

      // Only keep other parameters if they exist, but ensure we keep 'error=banned'
      const newUrl =
        url.pathname +
        (url.searchParams.toString() ? "?" + url.searchParams.toString() : "");

      // Use router.replace to update the URL without adding to history
      router.replace(newUrl);
    }
  }, [searchParams, locale, t, router]);

  return null;
}
