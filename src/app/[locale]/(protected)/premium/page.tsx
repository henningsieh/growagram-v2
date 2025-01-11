"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import ConnectSteadyHQButton from "~/components/atom/steady-connect-button";
import { Card, CardContent } from "~/components/ui/card";

import { PremiumBenefits } from "./PremiumBenefits";
import { PremiumFAQ } from "./PremiumFAQ";

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

export default function PremiumPage() {
  const t = useTranslations("Premium");

  return (
    <PageHeader title={t("premium-title")} subtitle={t("premium-subtitle")}>
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
              <CardContent className="p-6 sm:p-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col items-center space-y-8"
                >
                  <motion.div variants={itemVariants} className="text-center">
                    <h1 className="mb-4 text-4xl font-bold">
                      {t("unlock-premium-content")}
                    </h1>
                    <p className="mb-8 text-xl text-muted-foreground">
                      {t("get-exclusive-access")}
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <ConnectSteadyHQButton />
                  </motion.div>

                  <PremiumBenefits />

                  <motion.div
                    variants={itemVariants}
                    className="my-16 text-center"
                  >
                    <h2 className="mb-8 text-3xl font-semibold">
                      {t("ready-to-go-premium")}
                    </h2>
                    <ConnectSteadyHQButton />
                  </motion.div>

                  <PremiumFAQ />
                </motion.div>
              </CardContent>
            </Card>
          </FormContent>
        </motion.div>
      </AnimatePresence>
    </PageHeader>
  );
}
