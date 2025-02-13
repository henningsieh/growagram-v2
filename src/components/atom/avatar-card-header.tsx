"use client";

import type { LucideIcon } from "lucide-react";
import { DotIcon, MoreHorizontal, ShieldIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { Button, type ButtonProps } from "~/components/ui/button";
import { CardHeader } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Link } from "~/lib/i18n/routing";
import { formatDate, formatTime } from "~/lib/utils";
import type { OwnUserDataType } from "~/server/api/root";
import { Locale } from "~/types/locale";

import CustomAvatar from "./custom-avatar";

export interface ActionItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: ButtonProps["variant"];
  disabled?: boolean;
}

interface SocialHeaderProps {
  user: OwnUserDataType;
  date?: Date;
  showActions?: boolean;
  actions?: ActionItem[];
}

function AvatarCardHeader({
  user,
  date,
  showActions,
  actions,
}: SocialHeaderProps) {
  const locale = useLocale();

  return (
    <CardHeader className="space-y-0 py-0 pl-1 pr-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <CustomAvatar
            size={38}
            src={user.image ?? undefined}
            alt={user.username ?? "User avatar"}
            fallback={user.name?.[0] || "?"}
          />
          <div className="flex flex-col gap-0 xs:flex-row xs:gap-1">
            <Link
              href={`/public/profile/${user.id}`}
              className="flex items-center text-sm text-muted-foreground"
              // eslint-disable-next-line react/jsx-no-literals
            >
              <div className="flex items-center gap-1 whitespace-nowrap">
                <p className="text-sm font-bold text-foreground underline-offset-4 hover:underline">
                  {user.name}
                </p>
                {user.role === "admin" && (
                  <ShieldIcon
                    fill="hsl(var(--planted))"
                    className="h-4 w-4 text-yellow-500"
                  />
                )}
                <span
                  className="text-muted-foreground"
                  // eslint-disable-next-line react/jsx-no-literals
                >
                  @{user.username}
                </span>
              </div>
            </Link>
            {date && (
              <div className="flex items-center gap-1 whitespace-nowrap text-sm text-muted-foreground">
                {<DotIcon size={24} className="-mx-2 hidden xs:block" />}
                {formatDate(date, locale as Locale)}{" "}
                {formatTime(date, locale as Locale)}
              </div>
            )}
          </div>
        </div>
        {showActions && actions && actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-6" align="end">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  // <DropdownMenuItem
                  //   className="focus:bg-transparent"
                  //   asChild
                  //   >
                  <Button
                    key={`${action.label}-${index}`}
                    size={"sm"}
                    className="w-full"
                    variant={action.variant}
                    disabled={action.disabled}
                    onClick={action.onClick}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </Button>
                  // </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </CardHeader>
  );
}

export default AvatarCardHeader;
