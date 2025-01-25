"use client";

import { DotIcon, MoreHorizontal, ShieldIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { CardHeader } from "~/components/ui/card";
import { Link } from "~/lib/i18n/routing";
import { formatDate, formatTime } from "~/lib/utils";
import type { OwnUserDataType } from "~/server/api/root";
import { Locale } from "~/types/locale";

import CustomAvatar from "./custom-avatar";

interface SocialHeaderProps {
  user: OwnUserDataType;
  date?: Date;
}

function AvatarCardHeader({ user, date }: SocialHeaderProps) {
  const locale = useLocale();

  return (
    <CardHeader className="space-y-0 p-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1">
          <CustomAvatar
            size={38}
            src={user.image ?? undefined}
            alt={user.username ?? "User avatar"}
            fallback={user.name?.[0] || "?"}
          />
          <div className="flex flex-row gap-1">
            <Link
              href={`/public/profile/${user.id}`}
              className="flex items-center text-sm text-muted-foreground"
              // eslint-disable-next-line react/jsx-no-literals
            >
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold text-foreground underline-offset-4 hover:underline">
                  {user.name}
                </p>
                {user.role === "admin" && (
                  <ShieldIcon
                    fill="hsl(var(--planted))"
                    className="h-4 w-4 text-yellow-500"
                  />
                )}
                <span className="text-muted-foreground">@{user.username}</span>
              </div>
            </Link>
            {date && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DotIcon size={24} className="-mx-2" />
                {formatDate(date, locale as Locale)}{" "}
                {formatTime(date, locale as Locale)}
              </div>
            )}
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </CardHeader>
  );
}

export default AvatarCardHeader;
