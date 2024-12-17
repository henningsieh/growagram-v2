"use client";

// src/components/features/Account/account-info.tsx:
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, Mail, Shield, User } from "lucide-react";
import { useTranslations } from "next-intl";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useIsMobile } from "~/hooks/use-mobile";
import { Link } from "~/lib/i18n/routing";
import { GetUserType } from "~/server/api/root";

export default function AccountInfo({
  user,
}: {
  user: NonNullable<GetUserType>;
}) {
  const isMobile = useIsMobile();
  const t = useTranslations("Account");

  const infoItems = [
    { icon: User, label: "Name", value: user.name },
    { icon: AtSign, label: "Username", value: user.username },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Shield, label: "Role", value: user.role },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader
          title={t("account-info-title")}
          subtitle={t("account-info-subtitle")}
          //   buttonLabel={t("edit-profile-button")}
          //   buttonLink="/account/edit"
        >
          <FormContent>
            <Card className="overflow-hidden">
              <CardContent className="p-2 sm:p-3 lg:p-4 xl:p-6">
                <div className="flex flex-col items-start space-y-4 md:flex-row md:space-x-6 md:space-y-0">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback>
                      {user.name?.[0] || user.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
                    {infoItems.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <item.icon className="h-4 w-4" />
                            <span>{t(`info-${item.label}`)}</span>
                          </div>
                          <div className="font-medium">
                            {item.value || t("not-provided")}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="mt-6 flex justify-end">
                    <Button size={isMobile ? "sm" : "default"} asChild>
                      <Link href="/account/edit">{t("edit-profile")}</Link>
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </FormContent>
        </PageHeader>
      </motion.div>
    </AnimatePresence>
  );
}
