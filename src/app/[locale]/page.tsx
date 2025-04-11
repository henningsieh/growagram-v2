"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { modulePaths } from "~/assets/constants";
import FeatureSection from "~/components/features/Landing/feature-section.tsx";
import { Button } from "~/components/ui/button";
import { Link } from "~/lib/i18n/routing";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const t = useTranslations("LandingPage");
  const { theme } = useTheme();

  return (
    <div className="relative w-full overflow-hidden">
      {/* Subtle background gradient */}
      <div className="from-primary/5 absolute top-0 right-0 left-0 h-[500px] bg-gradient-to-b to-transparent"></div>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        <div className="relative min-h-[calc(100svh-9rem)]">
          <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
              <motion.div
                variants={itemVariants}
                className="flex max-w-2xl flex-col space-y-8"
              >
                <div className="bg-primary/10 border-primary/50 text-primary inline-flex items-center self-start rounded-full border px-4 py-1.5 text-base font-medium">
                  <span className="mr-3 inline-block animate-pulse">🚀</span>
                  {t("HeroSection.badge")}
                  <span className="ml-3 inline-block animate-pulse">🪴</span>
                </div>

                <div className="flex flex-col space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    {t("HeroSection.title")}
                  </h1>

                  <p className="text-primary text-xl font-medium">
                    {t("HeroSection.subtitle")}
                  </p>
                </div>
                <p className="text-muted-foreground text-lg">
                  {t("HeroSection.description")}
                </p>

                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                  <Button asChild size="lg" variant="secondary">
                    <Link href={modulePaths.DASHBOARD.path}>
                      {t("HeroSection.cta-button-start")}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/public/grows">
                      {t("HeroSection.cta-button-pricing")}
                    </Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="relative hidden lg:block"
              >
                <div className="border-border/40 relative overflow-hidden rounded-lg border shadow-xl">
                  <Image
                    priority
                    width={600}
                    height={400}
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                    src={
                      theme === "light"
                        ? "/images/growagram-saas-preview-dark.png"
                        : "/images/growagram-saas-preview.png"
                    }
                    alt="GrowAGram App Preview"
                    className="w-full"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <FeatureSection />
    </div>
  );
}
