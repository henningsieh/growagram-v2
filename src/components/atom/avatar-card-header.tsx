"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal, ShieldIcon } from "lucide-react";
import * as React from "react";
import { Button, type ButtonProps } from "~/components/ui/button";
import { CardHeader } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Link } from "~/lib/i18n/routing";
import type { OwnUserDataType } from "~/server/api/root";

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
  dateElement?: React.JSX.Element;
  showActions?: boolean;
  actions?: ActionItem[];
}

function AvatarCardHeader({
  user,
  dateElement,
  showActions,
  actions,
}: SocialHeaderProps) {
  return (
    <CardHeader className="space-y-0 py-0 pl-1 pr-1">
      <div className="flex items-start justify-between py-1">
        <div className="flex items-center gap-1">
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
              <div className="flex items-center gap-2 whitespace-nowrap">
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
            {dateElement && dateElement}
          </div>
        </div>
        {showActions && actions && actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-6" align="end">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    className="px-0 py-0.5 focus:bg-transparent"
                    key={`${action.label}-${index}`}
                  >
                    <Button
                      size={"sm"}
                      className="flex w-full items-center justify-start"
                      variant={action.variant}
                      disabled={action.disabled}
                      onClick={action.onClick}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Button>
                  </DropdownMenuItem>
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
