// src/components/atom/notfound-withpath.tsx

"use client";

import { useTranslations } from "next-intl";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon, HomeIcon, XCircle } from "lucide-react";

import { Button } from "~/components/ui/button";

import { Link, usePathname, useRouter } from "~/lib/i18n/routing";

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

const pathVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

export function NotFoundWithPath() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Errors");

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col items-center justify-center p-5 text-center">
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="max-w-md space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-6"
          >
            <XCircle className="text-destructive h-32 w-32" />
            <p className="text-destructive text-6xl">
              {
                // eslint-disable-next-line react/jsx-no-literals
                "404"
              }
            </p>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-foreground text-5xl font-bold tracking-tight"
          >
            {t("title")}
          </motion.h1>

          <motion.div variants={pathVariants}>
            <h2 className="text-muted-foreground flex flex-col items-center text-lg font-medium">
              <span>
                {t("path")}
                {
                  // eslint-disable-next-line react/jsx-no-literals
                  ":"
                }
              </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-muted text-foreground mt-2 inline-block rounded-sm px-3 py-1 font-mono text-sm shadow-2xs"
              >
                {pathname}
              </motion.span>
            </h2>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-muted-foreground text-lg"
          >
            {t("message")}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-between gap-4 sm:flex-row"
          >
            <Button
              variant={"outline"}
              onClick={handleGoBack}
              className="w-full px-6 py-2 sm:w-56"
            >
              <ArrowLeftIcon className="mr-1 h-4 w-4" />
              {t("goBack")}
            </Button>
            <Button
              asChild
              variant={"primary"}
              className="w-full px-6 py-2 sm:w-56"
            >
              <Link href="/">
                <HomeIcon className="mr-1 h-4 w-4" />
                {t("backToHome")}
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
