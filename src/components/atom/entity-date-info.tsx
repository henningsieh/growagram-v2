"use client";

import { useLocale, useTranslations } from "next-intl";
import { Calendar1Icon, EditIcon } from "lucide-react";
import { CardDescription } from "~/components/ui/card";
import { formatDate, formatTime } from "~/lib/utils";
import { Locale } from "~/types/locale";

interface EntityDateInfoProps {
  createdAt: Date;
  updatedAt?: Date;
  className?: string;
}

/**
 * A reusable component to display entity creation and update dates
 * Used in various card components to maintain consistent UI
 */
export function EntityDateInfo({
  createdAt,
  updatedAt,
  className = "",
}: EntityDateInfoProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Platform");

  return (
    <CardDescription
      className={`flex h-6 flex-row items-center justify-between pr-1 text-xs tracking-tighter ${className}`}
    >
      {/* Updated At Date */}
      {updatedAt && (
        <div title={t("updated-at")} className="flex items-center gap-1">
          <EditIcon size={13} className="shrink-0" />
          <span className="block">
            {formatDate(updatedAt, locale, { includeYear: false })}{" "}
            {formatTime(updatedAt, locale)}
          </span>
        </div>
      )}

      {/* Created At Date */}
      <div title={t("created-at")} className="flex items-center gap-1">
        <Calendar1Icon size={13} className="shrink-0" />
        <span className="block">
          {formatDate(createdAt, locale, { includeYear: false })}{" "}
          {formatTime(createdAt, locale)}
        </span>
      </div>
    </CardDescription>
  );
}
