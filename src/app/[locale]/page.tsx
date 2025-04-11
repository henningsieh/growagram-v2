"use client";

// src/app/[locale]/page.tsx:
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightIcon,
  BarChartIcon,
  Flower2Icon,
  LightbulbIcon,
  LineChartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { modulePaths } from "~/assets/constants";
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

// Card hover animations
const cardVariants = {
  hover: {
    y: -8,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      yoyo: Infinity,
    },
  },
};

export default function LandingPage() {
  const t = useTranslations("LandingPage");
  const { theme } = useTheme();

  return (
    <div className="relative w-full overflow-hidden">
      {/* Decorative top gradients */}
      <div className="from-primary/10 absolute top-0 left-0 z-0 h-48 w-full bg-gradient-to-b to-transparent" />
      <div className="from-secondary/20 absolute top-0 right-0 z-0 h-72 w-72 rounded-full bg-gradient-to-b to-transparent blur-3xl" />
      <div className="from-primary/20 absolute top-20 left-20 z-0 h-64 w-64 rounded-full bg-gradient-to-tr to-transparent blur-3xl" />

      <AnimatePresence mode="popLayout">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "0.5rem" }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3, ease: "easeIn" }}
          className="bg-primary relative z-10 h-2"
        />
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="relative z-10 overflow-hidden"
      >
        <div className="glass-effect relative flex min-h-[calc(100svh-9rem)] lg:pb-14">
          {/* Subtle grid background */}
          <div className="bg-grid-pattern absolute inset-0 opacity-5" />

          <div className="relative z-10 mx-auto my-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              <motion.div
                variants={itemVariants}
                className="mx-auto max-w-md sm:max-w-2xl sm:text-center lg:flex lg:items-center lg:text-left"
              >
                <div className="lg:py-24">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-primary/20 text-primary ring-primary/50 mb-6 inline-block rounded-full px-4 py-1.5 text-lg leading-6 font-semibold ring-1 ring-inset"
                  >
                    <span className="mr-3 inline-block animate-pulse">🚀</span>
                    {t("HeroSection.badge")}
                    <span className="ml-3 inline-block animate-pulse">🪴</span>
                  </motion.div>

                  <div className="text-foreground mt-4 space-y-4 font-bold tracking-tight sm:mt-5 lg:mt-6">
                    <h1 className="block text-5xl drop-shadow-sm sm:text-6xl md:text-7xl">
                      {t("HeroSection.title")}
                    </h1>
                    <p className="text-primary block pb-3 text-2xl sm:pb-5 sm:text-3xl xl:text-4xl">
                      {t("HeroSection.subtitle")}
                    </p>
                  </div>
                  <p className="text-muted-foreground mt-3 text-base sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    {t("HeroSection.description")}
                  </p>
                  <div className="mt-10 sm:mt-12">
                    <div className="xs:flex-row flex w-full flex-col justify-center gap-4 lg:justify-start">
                      <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="hover:shadow-secondary/25 group font-semibold shadow-lg transition-all hover:translate-y-[-2px]"
                      >
                        <Link href={modulePaths.DASHBOARD.path}>
                          {t("HeroSection.cta-button-start")}
                          <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        // className="border-primary/20 hover:bg-primary/5 backdrop-blur transition-all"
                      >
                        <Link
                          href="/public/grows"
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
                className="relative mt-12 hidden lg:block"
              >
                <div className="sticky top-24">
                  <motion.div
                    className="frost-card relative h-[min(820px,80vh)] w-[1138px] -translate-y-12 overflow-visible"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="from-primary to-secondary absolute -inset-0.5 rounded-xl bg-gradient-to-r opacity-30 blur-xl"></div>
                    <Image
                      fill
                      priority
                      style={{
                        objectFit: "contain",
                        objectPosition: "left center",
                      }}
                      src={
                        theme === "light"
                          ? "/images/growagram-saas-preview-dark.png"
                          : "/images/growagram-saas-preview.png"
                      }
                      alt="GrowAGram App Preview"
                      className="relative rounded-md shadow-xl"
                    />
                  </motion.div>
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
        className="relative mx-auto flex flex-col items-center justify-center gap-32 py-20"
      >
        {/* Wave SVG Transition */}
        <svg
          viewBox="0 0 1440 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-muted/60 absolute top-0 w-full"
        >
          <path
            d="M-100 58C-100 58 218.416 36.3297 693.5 36.3297C1168.58 36.3297 1487 58 1487 58V-3.8147e-06H-100V58Z"
            fill="currentColor"
          />
        </svg>

        <div className="relative z-10 mx-auto max-w-7xl p-6 lg:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-flowering/20 text-flowering ring-flowering/50 mb-6 inline-block rounded-full px-4 py-1.5 text-lg leading-6 font-semibold ring-1 ring-inset"
            >
              <span className="mr-3 inline-block animate-pulse">✨</span>
              {t("FeaturesSection.badge")}
              <span className="ml-3 inline-block animate-pulse">⚙️</span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-primary text-3xl font-bold tracking-tight sm:text-5xl"
            >
              {t("FeaturesSection.title")}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-foreground mt-6 text-lg leading-8"
            >
              {t("FeaturesSection.description")}
            </motion.p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:max-w-none lg:grid-cols-4">
              {/* Feature Cards */}
              <FeatureCard
                title={t("FeaturesSection.cards.growDiary.title")}
                description={t("FeaturesSection.cards.growDiary.description")}
                icon={<Flower2Icon className="h-6 w-6" />}
                color="primary"
              />
              <FeatureCard
                title={t("FeaturesSection.cards.connections.title")}
                description={t("FeaturesSection.cards.connections.description")}
                icon={<LightbulbIcon className="h-6 w-6" />}
                color="secondary"
              />
              <FeatureCard
                title={t("FeaturesSection.cards.community.title")}
                description={t("FeaturesSection.cards.community.description")}
                icon={<UsersIcon className="h-6 w-6" />}
                color="curing"
              />
              <FeatureCard
                title={t("FeaturesSection.cards.growStats.title")}
                description={t("FeaturesSection.cards.growStats.description")}
                icon={<BarChartIcon className="h-6 w-6" />}
                color="flowering"
              />
            </dl>

            {/* Additional Features Showcase */}
            <div className="relative mt-32">
              <div className="from-primary/20 to-secondary/20 absolute -inset-x-4 -top-2 -bottom-2 rounded-3xl bg-gradient-to-r"></div>
              <motion.div
                className="glass-effect relative grid gap-8 rounded-3xl p-4 md:grid-cols-3"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="frost-card flex flex-col gap-4 p-6">
                  <div className="bg-harvest/30 flex h-14 w-14 items-center justify-center rounded-full p-3">
                    <ShieldCheckIcon className="text-harvest h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {t("AdditionalFeatures.privacyFeature.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("AdditionalFeatures.privacyFeature.description")}
                  </p>
                </div>

                <div className="frost-card xs:translate-y-0 flex translate-y-8 flex-col gap-4 p-6">
                  <div className="bg-flowering/20 flex h-14 w-14 items-center justify-center rounded-full p-3">
                    <LineChartIcon className="text-flowering h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {t("AdditionalFeatures.analyticsFeature.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("AdditionalFeatures.analyticsFeature.description")}
                  </p>
                </div>

                <div className="frost-card flex flex-col gap-4 p-6">
                  <div className="bg-curing/20 flex h-14 w-14 items-center justify-center rounded-full p-3">
                    <UsersIcon className="text-curing h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {t("AdditionalFeatures.communityFeature.title")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("AdditionalFeatures.communityFeature.description")}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}) {
  const t = useTranslations("LandingPage");

  return (
    <motion.div variants={itemVariants} whileHover="hover">
      <Card className="frost-card relative flex h-full flex-col overflow-hidden border-0">
        {/* Background gradient glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-${color}/10 to-transparent opacity-70`}
        ></div>

        {/* Highlight border */}
        <div className={`absolute top-0 left-0 h-full w-1 bg-${color}`}></div>

        <motion.div
          className="relative z-10 flex h-full flex-col p-6"
          variants={cardVariants}
        >
          <div
            className={`text-${color} mb-2 flex items-center gap-x-3 text-lg leading-7 font-semibold`}
          >
            <motion.div
              className={`size-12 rounded-xl bg-${color}/10 flex items-center justify-center`}
              variants={iconVariants}
            >
              {icon}
            </motion.div>
            <h3 className="text-foreground text-xl">{title}</h3>
          </div>

          <div className="mt-4 flex flex-auto flex-col">
            <p className="text-muted-foreground flex-auto text-base leading-7">
              {description}
            </p>

            <div
              className={`text-${color} mt-6 flex items-center gap-2 text-sm font-semibold`}
            >
              <span>{t("AdditionalFeatures.learnMore")}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
