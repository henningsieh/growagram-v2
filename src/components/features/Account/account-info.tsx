"use client";

// src/components/features/Account/account-info.tsx:
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, Mail, Shield, User } from "lucide-react";
import { useTranslations } from "next-intl";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import SocialHeader from "~/components/atom/social-header";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useIsMobile } from "~/hooks/use-mobile";
import { Link } from "~/lib/i18n/routing";
import { UserType } from "~/server/api/root";

export default function AccountInfo({ user }: { user: UserType }) {
  const isMobile = useIsMobile();
  const t = useTranslations("Account");

  const infoItems = [
    { icon: User, label: "name", value: user.name },
    { icon: AtSign, label: "username", value: user.username },
    { icon: Mail, label: "email", value: user.email },
    { icon: Shield, label: "role", value: user.role },
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
        >
          <FormContent>
            <Card className="overflow-hidden">
              <CardHeader>
                <SocialHeader user={user} />
              </CardHeader>
              <Separator />
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col items-center space-y-6 sm:items-start sm:space-y-8">
                  <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:gap-8">
                    <Avatar className="h-24 w-24 shrink-0">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name || "User"}
                      />
                      <AvatarFallback>
                        {user.name?.[0] || user.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                      <div className="grid w-full gap-4 sm:grid-cols-2">
                        {infoItems.map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-2 rounded-md bg-muted p-3"
                          >
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <item.icon className="h-4 w-4" />
                              <span>{t(`info-${item.label}`)}</span>
                            </div>
                            <div className="rounded-sm bg-accent px-3 py-1.5 font-medium text-accent-foreground">
                              {item.value || t("not-provided")}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex w-full justify-end"
                  >
                    <Button
                      size={isMobile ? "sm" : "default"}
                      className="bg-primary hover:bg-primary/90"
                      asChild
                    >
                      <Link href="/account/edit">
                        {t("edit-profile-button")}
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </FormContent>
        </PageHeader>
      </motion.div>
    </AnimatePresence>
  );
}
