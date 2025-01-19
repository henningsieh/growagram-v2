"use client";

import { motion } from "framer-motion";
import { Clock, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/lib/i18n/routing";

import { Button } from "../ui/button";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function ComingSoon() {
  const t = useTranslations("Platform");

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col items-center justify-center p-5 text-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md space-y-8"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-6"
        >
          <Clock className="h-24 w-24 text-primary" />
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            className="text-4xl font-bold text-primary"
          >
            {t("coming-soon")}
          </motion.div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-2xl font-bold tracking-tight text-foreground"
        >
          {t("feature-coming")}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg text-muted-foreground"
        >
          {t("coming-soon-description")}
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            variant="outline"
            className="w-full px-6 py-2 sm:w-auto"
          >
            <Link href="/">Back to Home</Link>
          </Button>
          <Button
            asChild
            variant="primary"
            className="w-full px-6 py-2 sm:w-auto"
          >
            <Link href="/newsletter">
              <Rocket className="mr-2 h-4 w-4" />
              Get Notified
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
