"use client";

import type React from "react";

import { useTranslations } from "next-intl";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart2,
  LightbulbIcon,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function FeatureSection() {
  const t = useTranslations("LandingPage");

  return (
    <section className="relative w-full py-20 md:py-24 lg:py-32">
      {/* Subtle background pattern */}
      <div className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-[0.03]"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl space-y-8 text-center md:mb-16">
          <div className="bg-primary/10 border-primary/50 text-primary inline-flex items-center self-start rounded-full border px-4 py-1.5 text-base font-medium">
            <span className="mr-3 inline-block animate-pulse">{"✨"}</span>
            {t("FeaturesSection.badge")}
            <span className="ml-3 inline-block animate-pulse">{"⚙️"}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t("FeaturesSection.title")}
          </h2>
          <p className="text-muted-foreground md:text-xl/relaxed">
            {t("FeaturesSection.description")}
          </p>
        </div>

        {/* Primary Feature Cards */}
        <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={
              <div className="bg-primary/10 rounded-lg p-3">
                <LightbulbIcon className="text-primary h-6 w-6" />
              </div>
            }
            title={t("FeaturesSection.cards.growDiary.title")}
            description={t("FeaturesSection.cards.growDiary.description")}
            color="primary"
          />

          <FeatureCard
            icon={
              <div className="bg-secondary/10 rounded-lg p-3">
                <LightbulbIcon className="text-secondary h-6 w-6" />
              </div>
            }
            title={t("FeaturesSection.cards.connections.title")}
            description={t("FeaturesSection.cards.connections.description")}
            color="secondary"
          />

          <FeatureCard
            icon={
              <div className="bg-curing/10 rounded-lg p-3">
                <Users className="text-curing h-6 w-6" />
              </div>
            }
            title={t("FeaturesSection.cards.community.title")}
            description={t("FeaturesSection.cards.community.description")}
            color="curing"
          />

          <FeatureCard
            icon={
              <div className="bg-flowering/10 rounded-lg p-3">
                <BarChart2 className="text-flowering h-6 w-6" />
              </div>
            }
            title={t("FeaturesSection.cards.growStats.title")}
            description={t("FeaturesSection.cards.growStats.description")}
            color="flowering"
          />
        </div>

        {/* Secondary Feature Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SecondaryFeatureCard
            icon={<ShieldCheck className="text-harvest h-6 w-6" />}
            iconBgClass="bg-harvest/10"
            title={t("AdditionalFeatures.privacyFeature.title")}
            description={t("AdditionalFeatures.privacyFeature.description")}
            color="harvest"
          />

          <SecondaryFeatureCard
            icon={<BarChart2 className="text-flowering h-6 w-6" />}
            iconBgClass="bg-flowering/10"
            title={t("AdditionalFeatures.analyticsFeature.title")}
            description={t("AdditionalFeatures.analyticsFeature.description")}
            color="flowering"
          />

          <SecondaryFeatureCard
            icon={<Users className="text-curing h-6 w-6" />}
            iconBgClass="bg-curing/10"
            title={t("AdditionalFeatures.communityFeature.title")}
            description={t("AdditionalFeatures.communityFeature.description")}
            color="curing"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const t = useTranslations("LandingPage");

  return (
    <div className="h-full">
      <motion.div
        className="h-full"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card
          className={`border-l-2 border-${color} bg-card/50 flex h-full flex-col border-t-0 border-r-0 border-b-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
              <CardTitle className="text-xl">{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-grow flex-col justify-between">
            <CardDescription className="mb-4 text-base">
              {description}
            </CardDescription>
            <div
              className={`text-${color} group mt-auto flex items-center gap-1 text-sm font-medium`}
            >
              {t("AdditionalFeatures.learnMore")}{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function SecondaryFeatureCard({
  icon,
  iconBgClass,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  description: string;
  color: string;
}) {
  const t = useTranslations("LandingPage");

  return (
    <div className="h-full">
      <motion.div
        className="h-full"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="border-border/40 bg-card/50 flex h-full flex-col border shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <motion.div
              className={`${iconBgClass} mb-3 flex h-12 w-12 items-center justify-center rounded-lg`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-grow flex-col justify-between">
            <CardDescription className="mb-4 text-base">
              {description}
            </CardDescription>
            <div
              className={`text-${color} group mt-auto flex items-center gap-1 text-sm font-medium`}
            >
              {t("AdditionalFeatures.learnMore")}{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
