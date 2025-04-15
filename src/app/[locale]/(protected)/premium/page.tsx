"use client";

// src/app/[locale]/(protected)/premium/page.tsx:
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { PremiumBenefits } from "~/app/[locale]/(protected)/premium/PremiumBenefits";
import { PremiumFAQ } from "~/app/[locale]/(protected)/premium/PremiumFAQ";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import ConnectSteadyHQButton from "~/components/atom/steady-connect-button";
import { Card, CardContent } from "~/components/ui/card";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";

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

  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Premium.premium-title",
      path: modulePaths.PREMIUM.path,
    },
  ]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
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
              <Card className="bg-card/95 overflow-hidden border-2 backdrop-blur">
                <CardContent className="p-6 sm:p-8">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center space-y-16"
                  >
                    <motion.div variants={itemVariants} className="text-center">
                      <h2 className="mb-4 text-2xl font-bold">
                        {t("unlock-premium-content")}
                      </h2>
                      <p className="text-muted-foreground mb-4 text-xl">
                        {t("get-exclusive-access")}
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <ConnectSteadyHQButton />
                    </motion.div>

                    <PremiumBenefits />

                    <PremiumFAQ />

                    <motion.div
                      variants={itemVariants}
                      className="my-16 text-center"
                    >
                      <h2 className="mb-8 text-3xl font-semibold">
                        {t("ready-to-go-premium")}
                      </h2>
                      <ConnectSteadyHQButton />
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </FormContent>
          </motion.div>
        </AnimatePresence>
      </PageHeader>
    </>
  );
}
