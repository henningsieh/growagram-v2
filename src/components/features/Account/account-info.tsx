"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, Edit, Mail, Shield, User } from "lucide-react";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import { CustomAvatar } from "~/components/atom/custom-avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useIsMobile } from "~/hooks/use-mobile";
import { Link } from "~/lib/i18n/routing";
import type { OwnUserDataType } from "~/server/api/root";

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

export default function AccountInfo({ user }: { user: OwnUserDataType }) {
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
          className="mx-auto w-full max-w-2xl"
        >
          <FormContent>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col items-center space-y-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "tween", stiffness: 100 }}
                  >
                    <CustomAvatar
                      size={96}
                      src={user.image || undefined}
                      alt={user.name || "User avatar"}
                      fallback={user.name?.[0] || "?"}
                      className="border-primary/10 border-2"
                    />
                  </motion.div>

                  <div className="w-full space-y-4">
                    {infoItems.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="space-y-1.5"
                      >
                        <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                          <item.icon className="h-4 w-4" />
                          <span className="capitalize">
                            {t(`info-${item.label}`)}
                          </span>
                        </div>
                        <div className="bg-accent/50 rounded-sm px-4 py-2.5 font-medium">
                          {item.value || t("not-provided")}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div variants={itemVariants} className="w-full">
                    <Button
                      size={isMobile ? "sm" : "default"}
                      className="w-full"
                      asChild
                    >
                      <Link
                        href="/account/edit"
                        className="flex items-center justify-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>{t("edit-profile-button")}</span>
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
