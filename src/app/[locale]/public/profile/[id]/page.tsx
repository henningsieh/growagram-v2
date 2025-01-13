"use client";

import { useParams } from "next/navigation";
import ProfileTabs from "~/components/features/PublicProfile/PofileTabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/lib/trpc/react";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const { data: profile, isLoading } = api.users.getPublicUserProfile.useQuery({
    id: userId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Profile not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center gap-4">
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
    </div>
  );
}
