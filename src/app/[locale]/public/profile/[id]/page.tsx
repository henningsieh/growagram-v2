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
      <div className="mb-5 mt-3 flex items-center gap-2 xs:gap-3 sm:gap-4">
        <Avatar className="h-14 w-14 xs:h-16 xs:w-16 sm:h-24 sm:w-24">
          <AvatarImage src={profile.image ?? ""} />
          <AvatarFallback>
            {profile.name?.substring(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-col gap-0.5 px-0 xs:gap-1 sm:gap-2">
          <div className="flex justify-between gap-4">
            <h1 className="whitespace-nowrap text-base font-bold xs:text-xl sm:text-2xl">
              {profile.name}
            </h1>
            <FollowButton
              className="w-28 p-4"
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
