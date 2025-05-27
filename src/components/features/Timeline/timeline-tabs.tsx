"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import FollowingTimeline from "./following-timeline";
import PublicTimeline from "./public-timeline";

interface TimelineTabsProps {
  defaultTab?: "public" | "following";
  className?: string;
}

export default function TimelineTabs({
  defaultTab = "public",
  className,
}: TimelineTabsProps) {
  const t = useTranslations("Timeline");

  return (
    <div className={cn("w-full", className)}>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public" className="text-sm">
            {t("tabs.public")}
          </TabsTrigger>
          <TabsTrigger value="following" className="text-sm">
            {t("tabs.following")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="mt-6">
          <PublicTimeline />
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <FollowingTimeline />
        </TabsContent>
      </Tabs>
    </div>
  );
}
