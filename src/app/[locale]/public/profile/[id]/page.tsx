import { notFound } from "next/navigation";
import ProfileTabs from "~/components/features/PublicProfile/PofileTabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/lib/trpc/server";
import type { GetPublicUserProfileInput } from "~/server/api/root";

export default async function ProfilePage({
  params,
}: {
  params: Promise<GetPublicUserProfileInput>;
}) {
  const userId = (await params).id;

  // const { data: profile, isLoading } = api.users.getPublicUserProfile.useQuery({
  //   id: userId,
  // });

  const profile = await api.users.getPublicUserProfile({
    id: userId,
  } satisfies GetPublicUserProfileInput);

  if (!profile) notFound();

  return (
    <>
      <div className="mb-5 mt-3 flex items-center gap-4 px-2">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.image ?? ""} />
          <AvatarFallback>
            {profile.name?.substring(0, 2).toUpperCase() ?? "??"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          {profile.username && (
            <p className="text-muted-foreground">@{profile.username}</p>
          )}
        </div>
      </div>
      <ProfileTabs profile={profile} />
    </>
  );
}
