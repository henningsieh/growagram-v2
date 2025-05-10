import * as React from "react";
import { DotIcon, ShieldIcon } from "lucide-react";
import { CustomAvatar } from "~/components/atom/custom-avatar";
import { CardHeader } from "~/components/ui/card";
import { Link } from "~/lib/i18n/routing";
import type { OwnUserDataType } from "~/server/api/root";
import { UserRoles } from "~/types/user";
import { type ActionItem, ActionsMenu } from "./actions-menu";

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
    <CardHeader className="flex h-12.5 w-full items-center justify-between space-y-0 p-0 px-1.5">
      {/* Avatar group */}
      <div className="flex min-w-0 flex-shrink items-center gap-0">
        {/* Create a hover group wrapper */}
        <Link
          href={`/public/profile/${user.id}`}
          className="group flex min-w-0 items-center gap-2"
        >
          <CustomAvatar
            size={36}
            src={user.image ?? undefined}
            alt={user.username ?? "User avatar"}
            fallback={user.name?.[0] || "?"}
            className="ring-muted-foreground shrink-0 ring-1 transition-colors duration-200 ease-in-out group-hover:ring-2"
          />
          <div className="flex min-w-0 items-center gap-2 text-sm whitespace-nowrap">
            <p className="text-foreground shrink-0 font-bold underline-offset-4 group-hover:underline">
              {user.name}
            </p>
            {(user.role as UserRoles) === UserRoles.ADMIN && (
              <div title="Administrator" className="shrink-0">
                <ShieldIcon
                  fill="var(--color-yellow-500)"
                  className="h-4 w-4 text-yellow-700"
                />
              </div>
            )}
            <span className="text-muted-foreground group-hover:text-foreground xs:inline hidden shrink truncate transition-colors">
              {`@${user.username}`}
            </span>
          </div>
        </Link>

        {/* Date element kept separate from the hover group */}
        {dateElement && (
          <>
            <DotIcon size={24} className="shrink-0" />
            <div className="shrink-0">{dateElement}</div>
          </>
        )}
      </div>

      {/* Actions menu */}
      {showActions && actions && actions.length > 0 && (
        <div className="shrink-0">
          <ActionsMenu actions={actions} />
        </div>
      )}
    </CardHeader>
  );
}

export default AvatarCardHeader;
