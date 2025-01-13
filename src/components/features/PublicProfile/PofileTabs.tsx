"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type GetPublicUserProfileType } from "~/server/api/root";

import { GrowCard } from "../Grows/grow-card";
import PlantCard from "../Plants/plant-card";

interface ProfileTabsProps {
  profile: NonNullable<GetPublicUserProfileType>;
}

export const ProfileTabs = ({ profile }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="grows" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-muted font-extrabold text-muted-foreground">
        <TabsTrigger value="timeline" disabled>
          Timeline
          <span className="ml-2 text-xs text-muted-foreground">(Soon)</span>
        </TabsTrigger>
        <TabsTrigger
          value="grows"
          className="font-semibold data-[state=active]:bg-primary data-[state=active]:font-bold data-[state=active]:text-primary-foreground"
        >
          Grows ({profile.grows?.length ?? 0})
        </TabsTrigger>
        <TabsTrigger
          value="plants"
          className="font-semibold data-[state=active]:bg-primary data-[state=active]:font-bold data-[state=active]:text-primary-foreground"
        >
          Plants ({profile.plants?.length ?? 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="grows">
        <div className="grid grid-cols-1 gap-4">
          {profile.grows?.map((grow) => <GrowCard key={grow.id} grow={grow} />)}
        </div>
      </TabsContent>

      <TabsContent value="plants">
        <div className="grid grid-cols-1 gap-4">
          {profile.plants?.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
