"use client";

import * as React from "react";

import { ShieldIcon } from "lucide-react";

import { CardHeader } from "~/components/ui/card";

import { ActionItem, ActionsMenu } from "~/components/atom/actions-menu";
import { CustomAvatar } from "~/components/atom/custom-avatar";

import type { OwnUserDataType } from "~/server/api/root";

import { UserRoles } from "~/types/user";

import { Link } from "~/lib/i18n/routing";

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
    <CardHeader className="flex items-center justify-between space-y-0 p-1">
      <div className="flex items-center gap-2">
        <CustomAvatar
          size={36}
          src={user.image ?? undefined}
          alt={user.username ?? "User avatar"}
          fallback={user.name?.[0] || "?"}
          className="ring-muted-foreground ring-1 transition-colors duration-200 ease-in-out hover:ring-2"
        />
        <div className="flex flex-col gap-0 sm:flex-row sm:gap-1">
          <Link
            href={`/public/profile/${user.id}`}
            className="text-muted-foreground flex items-center text-sm"
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              <p className="text-foreground text-sm font-bold underline-offset-4 hover:underline">
                {user.name}
              </p>
              {(user.role as UserRoles) === UserRoles.ADMIN && (
                <div title="Administrator">
                  <ShieldIcon
                    fill="var(--color-yellow-500)"
                    className="h-4 w-4 text-yellow-700"
                  />
                </div>
              )}
              <span className="text-muted-foreground">
                {`@${user.username}`}
              </span>
            </div>
          </Link>
          {dateElement && dateElement}
        </div>
      </div>
      {showActions && actions && actions.length > 0 && (
        <ActionsMenu actions={actions} />
      )}
    </CardHeader>
  );
}

export default AvatarCardHeader;
