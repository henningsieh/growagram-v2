import * as Icons from "lucide-react";

export type IconType = keyof typeof Icons;

export type IconComponent = React.ForwardRefExoticComponent<
  Omit<React.ComponentPropsWithoutRef<"svg">, keyof Icons.LucideProps> &
    Icons.LucideProps &
    React.RefAttributes<SVGSVGElement>
>;
