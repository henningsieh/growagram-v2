import { Users } from "lucide-react";
import { type Session } from "next-auth";
import { useTranslations } from "next-intl";
import CustomAvatar from "~/components/atom/custom-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/lib/trpc/react";

interface UserStatsCardProps {
  user: Session["user"];
}

export function UserStatsCard({ user }: UserStatsCardProps) {
  const t = useTranslations("Platform");
  const { data: userProfile } = api.users.getPublicUserProfile.useQuery(
    { id: user.id },
    { enabled: !!user.id },
  );

  const followerCount = userProfile?.followers.length || 0;
  const followingCount = userProfile?.following.length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{t("comunity")}</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between space-x-4 text-2xl">
          <div className="space-y-2">
            <div className="font-bold">{followerCount}</div>
            <div className="text-xs text-muted-foreground">
              {t("Followers")}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-bold">{followingCount}</div>
            <div className="whitespace-nowrap text-xs text-muted-foreground">
              {t("Following")}
            </div>
          </div>
        </div>
        {/* <div className="flex items-center space-x-3">
          <CustomAvatar
            size={36}
            src={user.image || undefined}
            alt={user.name || "User avatar"}
            fallback="User2"
          />
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-muted-foreground">
              @{user.username}
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
