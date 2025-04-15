"use client";

// src/app/[locale]/(protected)/premium/PremiumFAQ.tsx:
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
    <section className="mx-auto my-16 w-full max-w-3xl">
      <h2 className="mb-8 text-center text-3xl font-semibold">
        {t("faq.title")}
      </h2>
      <div className="mb-4">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="py-4 text-left hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
