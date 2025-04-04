import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";

const benefits = [
  "Exclusive premium content",
  "Ad-free experience",
  "Early access to new features",
  "Priority support",
  "Community forums access",
];

export function PremiumBenefits() {
  const t = useTranslations("Premium");
  return (
    <section className="my-16">
      <h2 className="mb-8 text-center text-3xl font-semibold">
        {t("benefits.title")}
      </h2>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit, index) => (
          <li
            key={index}
            className="bg-secondary flex items-center space-x-2 rounded-lg p-4"
          >
            <CheckCircle className="text-primary" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
