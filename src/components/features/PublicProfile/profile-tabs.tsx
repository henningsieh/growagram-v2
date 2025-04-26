import { useTranslations } from "next-intl";
import { GrowCard } from "~/components/features/Grows/grow-card";
import PlantCard from "~/components/features/Plants/plant-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { PublicUserProfileType } from "~/server/api/root";

interface ProfileTabsProps {
  profile: PublicUserProfileType;
}

export const ProfileTabs = ({ profile }: ProfileTabsProps) => {
  const t = useTranslations();
  return (
    <Tabs defaultValue="grows" className="w-full">
      <TabsList className="bg-muted text-muted-foreground grid w-full grid-cols-3 p-0 font-extrabold">
        <TabsTrigger value="timeline" disabled>
          {t("Profile.tabs.timeline")}
          <span className="text-muted-foreground ml-2 text-xs">
            {"("}
            {t("Platform.coming-soon")}
            {")"}
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="grows"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold data-[state=active]:font-bold"
        >
          {t("Profile.tabs.grows")}
          {" ("}
          {profile.grows?.length ?? 0}
          {")"}
        </TabsTrigger>
        <TabsTrigger
          value="plants"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold data-[state=active]:font-bold"
        >
          {t("Profile.tabs.plants")}
          {" ("}
          {profile.plants?.length ?? 0}
          {")"}
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
