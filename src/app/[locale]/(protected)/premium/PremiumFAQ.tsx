"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const faqItems = [
  {
    question: "How does the premium subscription work?",
    answer:
      "Our premium subscription is managed through Steady. Once you connect your Steady account, you'll have immediate access to all premium features.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time through your Steady account. Your premium access will continue until the end of your current billing period.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "Steady supports various payment methods including credit cards, PayPal, and SEPA direct debit. You can choose your preferred method during the subscription process.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "We currently don't offer a free trial, but you can check our free content to get a taste of what we offer before subscribing.",
  },
];

export function PremiumFAQ() {
  return (
    <section className="my-16">
      <h2 className="mb-8 text-center text-3xl font-semibold">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="mx-auto w-full max-w-2xl">
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
