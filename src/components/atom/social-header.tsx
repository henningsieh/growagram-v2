import { User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { CardHeader } from "~/components/ui/card";
import { UserType } from "~/server/api/root";

interface SocialHeaderProps {
  user: UserType;
}

function SocialHeader({ user }: SocialHeaderProps) {
  return (
    <CardHeader className="space-y-0 p-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image ? user.image : undefined} />
            <AvatarFallback>
              <User2 className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">
              {`@${user.username}`}
            </p>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}

export default SocialHeader;
