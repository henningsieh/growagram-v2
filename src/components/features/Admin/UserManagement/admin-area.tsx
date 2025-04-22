"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Shield, Users } from "lucide-react";
import { Card, CardHeader } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { UsersTable } from "./components/users-table";

export function AdminArea() {
  const t = useTranslations("AdminArea");
  const [activeTab, setActiveTab] = React.useState("users");

  return (
    <Card className="w-full rounded-lg">
      <CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("users-tab")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("settings-tab")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="w-full">
            <div
              className="max-w-full"
              style={{ overflowX: "auto", whiteSpace: "nowrap" }}
            >
              <UsersTable />
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="flex h-[300px] w-full items-center justify-center">
              <p className="text-muted-foreground">
                {t("settings-coming-soon")}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
