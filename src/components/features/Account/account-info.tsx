"use client";

// src/components/features/Account/account-info.tsx:
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, Edit, Mail, Shield, User } from "lucide-react";
import { useTranslations } from "next-intl";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import AvatarCardHeader from "~/components/atom/avatar-card-header";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useIsMobile } from "~/hooks/use-mobile";
import { Link } from "~/lib/i18n/routing";
import { UserType } from "~/server/api/root";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
    <PageHeader
      title={t("account-info-title")}
      subtitle={t("account-info-subtitle")}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto w-full max-w-4xl"
        >
          <FormContent>
            <Card className="overflow-hidden border-2 bg-card/95 backdrop-blur-sm">
              <CardHeader className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"
                />
                <AvatarCardHeader user={user} />
              </CardHeader>
              <Separator className="opacity-50" />
              <CardContent className="p-6 sm:p-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col items-center space-y-8 sm:items-start"
                >
                  <div className="flex w-full flex-col items-center gap-8 sm:flex-row sm:gap-12">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative"
                    >
                      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary to-primary-foreground/50 opacity-75 blur" />
                      <Avatar className="relative h-32 w-32 shrink-0 border-2 border-background">
                        <AvatarImage
                          src={user.image || undefined}
                          alt={user.name || "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl">
                          {user.name?.[0] || user.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="w-full">
                      <div className="grid w-full gap-4 sm:grid-cols-2">
                        {infoItems.map((item, index) => (
                          <motion.div
                            key={item.label}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="group relative overflow-hidden rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            <div className="relative space-y-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <item.icon className="h-4 w-4" />
                                <span className="capitalize">
                                  {t(`info-${item.label}`)}
                                </span>
                              </div>
                              <div className="rounded-md bg-background/50 px-4 py-2 font-medium text-foreground shadow-sm">
                                {item.value || t("not-provided")}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    variants={itemVariants}
                    className="flex w-full justify-end"
                  >
                    <Button
                      size={isMobile ? "sm" : "default"}
                      className="group relative overflow-hidden bg-primary hover:bg-primary/90"
                      asChild
                    >
                      <Link
                        href="/account/edit"
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>{t("edit-profile-button")}</span>
                        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/10 to-primary-foreground/0 transition-transform duration-500 group-hover:translate-x-[100%]" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </FormContent>
        </motion.div>
      </AnimatePresence>
    </PageHeader>
  );
}
