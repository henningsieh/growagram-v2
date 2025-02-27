import { Users } from "lucide-react";
import { type Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import CustomAvatar from "~/components/atom/custom-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/trpc/react";

interface UserStatsCardProps {
  userId: string;
}

export function UserStatsCard({ userId }: UserStatsCardProps) {
  const t = useTranslations("Platform");
  const { data: session, status } = useSession();

  if (session === null) {
    return null;
  }

  const { data: userProfile, isPending } =
    api.users.getPublicUserProfile.useQuery(
      { id: userId },
      { enabled: status === "authenticated" },
    );

  const followerCount = userProfile?.followers.length || 0;
  const followingCount = userProfile?.following.length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{t("comunity")}</CardTitle>
        <Users className="h-4 w-4 text-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
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
        <div className="flex space-x-8 text-2xl">
          <div className="space-y-2">
            <div className="font-bold">
              {isPending ? <Skeleton className="h-8 w-11" /> : followerCount}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("Followers")}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-bold">
              {isPending ? <Skeleton className="h-8 w-11" /> : followingCount}
            </div>
            <div className="whitespace-nowrap text-xs text-muted-foreground">
              {t("Following")}
            </div>
          </div>
        </div>
        {/*  */}
      </CardContent>
    </Card>
  );
}
