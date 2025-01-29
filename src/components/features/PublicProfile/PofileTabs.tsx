"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { PublicUserProfileType } from "~/server/api/root";

import { GrowCard } from "../Grows/grow-card";
import PlantCard from "../Plants/plant-card";

interface ProfileTabsProps {
  profile: PublicUserProfileType;
}

export const ProfileTabs = ({ profile }: ProfileTabsProps) => {
  const t = useTranslations();
  return (
    <Tabs defaultValue="grows" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-muted font-extrabold text-muted-foreground">
        <TabsTrigger value="timeline" disabled>
          {t("Profile.tabs.timeline")}
          <span
            className="ml-2 text-xs text-muted-foreground"
            // eslint-disable-next-line react/jsx-no-literals
          >
            (
            {
              t("Platform.coming-soon")
              // eslint-disable-next-line react/jsx-no-literals
            }
            )
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="grows"
          className="font-semibold data-[state=active]:bg-primary data-[state=active]:font-bold data-[state=active]:text-primary-foreground"
        >
          {t("Profile.tabs.grows")}
          {
            // eslint-disable-next-line react/jsx-no-literals
            " ("
          }
          {
            profile.grows?.length ?? 0
            // eslint-disable-next-line react/jsx-no-literals
          }
          {
            // eslint-disable-next-line react/jsx-no-literals
            ")"
          }
        </TabsTrigger>
        <TabsTrigger
          value="plants"
          className="font-semibold data-[state=active]:bg-primary data-[state=active]:font-bold data-[state=active]:text-primary-foreground"
        >
          {
            t("Profile.tabs.plants")
            // eslint-disable-next-line react/jsx-no-literals
          }
          {
            // eslint-disable-next-line react/jsx-no-literals
            " ("
          }
          {
            profile.plants?.length ?? 0
            // eslint-disable-next-line react/jsx-no-literals
          }
          {
            // eslint-disable-next-line react/jsx-no-literals
            ")"
          }
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
