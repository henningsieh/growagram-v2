"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Link } from "~/lib/i18n/routing";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const t = useTranslations("LandingPage");

  return (
    <div className="relative">
      <AnimatePresence mode="popLayout">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "0.5rem" }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3, ease: "easeIn" }}
          // className="hidden h-0 w-full bg-primary sm:block sm:h-2"
          className="h-2 w-full bg-primary"
        />
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="relative overflow-hidden"
      >
        <div className="flex h-[calc(100svh-9rem)] items-center bg-muted dark:bg-accent lg:overflow-hidden lg:pb-14">
          <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              <motion.div
                variants={itemVariants}
                className="mx-auto max-w-md sm:max-w-2xl sm:text-center lg:flex lg:items-center lg:text-left"
              >
                <div className="lg:py-24">
                  <h1 className="mt-4 space-y-4 font-bold tracking-tight text-foreground sm:mt-5 lg:mt-6">
                    <span className="block text-4xl sm:text-6xl xl:text-6xl">
                      {t("HeroSection.title")}
                    </span>
                    <span className="block pb-3 text-3xl text-primary sm:pb-5 sm:text-5xl xl:text-5xl">
                      {t("HeroSection.subtitle")}
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-muted-foreground dark:text-accent-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    {t("HeroSection.description")}
                  </p>
                  <div className="mt-10 sm:mt-12">
                    <div className="flex w-full flex-col justify-center gap-4 xs:flex-row">
                      <Button asChild size="lg" variant="primary">
                        <Link href="/dashboard">
                          {t("HeroSection.cta-button-start")}
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline">
                        <Link
                          href="#pricing"
                          shallow={true}
                          scroll={true}
                          replace
                        >
                          {t("HeroSection.cta-button-pricing")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="mt-12 hidden lg:block"
              >
                <div className="relative h-[699px] w-[955px]">
                  <Image
                    src="/images/growagram-saas-preview.png"
                    alt="GrowAGram App Preview"
                    className="rounded-md shadow-xl"
                    fill
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="relative mx-auto flex flex-col items-center justify-center gap-32 py-0"
      >
        <svg
          viewBox="0 0 1440 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-0 w-full text-accent"
        >
          <path
            d="M-100 58C-100 58 218.416 36.3297 693.5 36.3297C1168.58 36.3297 1487 58 1487 58V-3.8147e-06H-100V58Z"
            fill="currentColor"
          />
        </svg>

        <div className="mx-auto my-12 max-w-7xl p-6 lg:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold tracking-tight text-primary sm:text-5xl"
            >
              {t("FeaturesSection.title")}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg leading-8 text-accent-foreground"
            >
              {t("FeaturesSection.description")}
            </motion.p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:max-w-none lg:grid-cols-4">
              {/* Feature Cards */}
              <FeatureCard
                title={t("FeaturesSection.cards.growDiary.title")}
                description={t("FeaturesSection.cards.growDiary.description")}
                icon="📝"
              />
              <FeatureCard
                title={t("FeaturesSection.cards.connections.title")}
                description={t("FeaturesSection.cards.connections.description")}
                icon="🔗"
              />
              <FeatureCard
                title={t("FeaturesSection.cards.community.title")}
                description={t("FeaturesSection.cards.community.description")}
                icon="👥"
              />
              <FeatureCard
                title={t("FeaturesSection.cards.growStats.title")}
                description={t("FeaturesSection.cards.growStats.description")}
                icon="📊"
              />
            </dl>
          </div>
        </div>
      </motion.div>

      {/* Pricing Section */}
      {/* <motion.div
        id="pricing"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="bg-white py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl p-6 lg:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            >
              {t("PricingSection.title")}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg leading-8 text-gray-600"
            >
              {t("PricingSection.description")}
            </motion.p>
          </div>
        </div>
      </motion.div> */}
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="flex flex-col bg-accent p-6">
        <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-foreground">
          <span className="text-3xl">{icon}</span>
          {title}
        </dt>
        <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-accent-foreground">
          <p className="flex-auto">{description}</p>
        </dd>
      </Card>
    </motion.div>
  );
}
