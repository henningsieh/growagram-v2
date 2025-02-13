import { notFound } from "next/navigation";
import { FollowButton } from "~/components/atom/follow-button";
import ProfileTabs from "~/components/features/PublicProfile/PofileTabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { auth } from "~/lib/auth";
import { api } from "~/lib/trpc/server";
import type { GetPublicUserProfileInput } from "~/server/api/root";

export default async function ProfilePage({
  params,
}: {
  params: Promise<GetPublicUserProfileInput>;
}) {
  const userId = (await params).id;
  const session = await auth();

  const profile = await api.users.getPublicUserProfile({
    id: userId,
  } satisfies GetPublicUserProfileInput);

  if (!profile) notFound();

  const isFollowing = profile.followers.some((follow) => {
    return follow.follower.id === session?.user.id;
  });

  return (
    <>
      <div className="mb-5 mt-3 flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.image ?? ""} />
          <AvatarFallback>
            {profile.name?.substring(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-col gap-2 px-0">
          <div className="flex justify-between gap-4">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <FollowButton
              className="w-36 p-4"
              userId={profile.id}
              initialIsFollowing={isFollowing}
            />
          </div>
          {profile.username && (
            <p
              className="text-muted-foreground"
              // eslint-disable-next-line react/jsx-no-literals
            >
              @{profile.username}
            </p>
          )}
        </div>
      </div>
      <ProfileTabs profile={profile} />
    </>
  );
}
