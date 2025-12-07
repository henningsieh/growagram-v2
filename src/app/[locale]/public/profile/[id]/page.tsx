import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import { FollowButton } from "~/components/atom/follow-button";
import ProfileTabs from "~/components/features/PublicProfile/profile-tabs";

import type { GetPublicUserProfileInput } from "~/server/api/root";

import { auth } from "~/lib/auth";
import { caller } from "~/lib/trpc/server";

export default async function ProfilePage({
  params,
}: {
  params: Promise<GetPublicUserProfileInput>;
}) {
  const userId = (await params).id;
  const session = await auth();

  const profile = await caller.users.getPublicUserProfile({
    id: userId,
  } satisfies GetPublicUserProfileInput);

  if (!profile) notFound();

  const isFollowing = profile.followers.some((follow) => {
    return follow.follower.id === session?.user.id;
  });

  return (
    <>
      <div className="xs:gap-3 mt-3 mb-5 flex items-center gap-2 sm:gap-4">
        <Avatar className="xs:h-16 xs:w-16 h-14 w-14 sm:h-24 sm:w-24">
          <AvatarImage src={profile.image ?? ""} alt={profile.name ?? ""} />
          <AvatarFallback>
            {profile.name?.substring(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
        <div className="xs:gap-1 flex w-full flex-col gap-0.5 px-0 sm:gap-2">
          <div className="flex justify-between gap-4">
            <h1 className="xs:text-xl text-base font-bold whitespace-nowrap sm:text-2xl">
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
