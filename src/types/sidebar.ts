// types/sidebar.ts:
import * as Icons from "lucide-react";

// Use string for icon names in the config
export interface Team {
  name: string;
  logo: string; // Icon name as string in config
  plan: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: string; // Icon name as string in config
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface Project {
  name: string;
  url: string;
  icon: string; // Icon name as string in config
}

// Define a type for the Lucide icon components
export type IconType = keyof typeof Icons;

export type IconComponent = React.ForwardRefExoticComponent<
  Omit<React.ComponentPropsWithoutRef<"svg">, keyof Icons.LucideProps> &
    Icons.LucideProps &
    React.RefAttributes<SVGSVGElement>
>;

// Define the processed nav item type
export interface ProcessedNavItem {
  title: string;
  url: string;
  icon?: IconComponent;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

// Updated SidebarItems without User reference
export interface SidebarItems {
  teams: Team[];
  navMain: NavItem[];
  projects: Project[];
}

// Updated ProcessedSidebarItems without User reference
export interface ProcessedSidebarItems {
  teams: Array<{
    name: string;
    logo: IconComponent;
    plan: string;
  }>;
  navMain: ProcessedNavItem[];
  coming_soon: Array<{
    name: string;
    url: string;
    icon: IconComponent;
  }>;
}
