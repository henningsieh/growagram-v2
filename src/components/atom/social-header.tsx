import { User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { CardHeader } from "~/components/ui/card";

interface SocialHeaderProps {
  userName: string;
  userUserName?: string;
  userAvatarUrl: string | null;
}

function SocialHeader({
  userName,
  userUserName,
  userAvatarUrl,
}: SocialHeaderProps) {
  return (
    <CardHeader className="space-y-0 p-2">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatarUrl ? userAvatarUrl : undefined} />
            <AvatarFallback>
              <User2 className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-sm text-muted-foreground">
              {`@${userUserName ? userUserName : userName}`}
            </p>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}

export default SocialHeader;
