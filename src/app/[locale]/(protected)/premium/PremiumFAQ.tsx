"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export function PremiumFAQ() {
  const t = useTranslations("Premium");
  const faqItems = [
    {
      question: t("faq.how-subscription-works.question"),
      answer: t("faq.how-subscription-works.answer"),
    },
    {
      question: t("faq.cancel-subscription.question"),
      answer: t("faq.cancel-subscription.answer"),
    },
    {
      question: t("faq.payment-methods.question"),
      answer: t("faq.payment-methods.answer"),
    },
    {
      question: t("faq.free-trial.question"),
      answer: t("faq.free-trial.answer"),
    },
  ];

  return (
    <section className="my-16">
      <h2 className="mb-8 text-center text-3xl font-semibold">
        {t("faq.title")}
      </h2>
      <Accordion type="single" collapsible className="mx-auto w-[520]">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
