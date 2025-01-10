import { CardHeader } from "~/components/ui/card";
import { UserType } from "~/server/api/root";

import CustomAvatar from "./custom-avatar";

interface SocialHeaderProps {
  user: UserType;
}

function AvatarCardHeader({ user }: SocialHeaderProps) {
  return (
    <CardHeader className="space-y-0 p-1">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CustomAvatar
            size={44}
            src={user.image ?? undefined}
            alt={user.username ?? "User avatar"}
            fallback={user.name?.[0] || "?"}
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">
              {
                // eslint-disable-next-line react/jsx-no-literals
                `@${user.username}`
              }
            </p>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}

export default AvatarCardHeader;
