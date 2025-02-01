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

  const isFollowing = profile.followers.some(
    (follow) => follow.follower.id === session?.user.id,
  );
  console.debug("profile.followers", profile.followers);
  console.debug("profile.following", profile.following);
  console.debug("session?.user.id", session?.user.id);

  return (
    <>
      <div className="mb-5 mt-3 flex items-center gap-4 px-2">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.image ?? ""} />
          <AvatarFallback>
            {profile.name?.substring(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <FollowButton
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
