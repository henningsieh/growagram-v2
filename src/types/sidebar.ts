// types/sidebar.ts:
import * as Icons from "lucide-react";

// import { User } from "next-auth";

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

export interface SidebarItems {
  // user: User; // User is not needed anymore within the sidebar data
  teams: Team[];
  navMain: NavItem[];
  projects: Project[];
}

// Define the complete processed sidebar items type
export interface ProcessedSidebarItems
  extends Omit<SidebarItems, "teams" | "navMain" | "projects"> {
  teams: Array<{
    name: string;
    logo: IconComponent;
    plan: string;
  }>;
  navMain: ProcessedNavItem[];
  projects: Array<{
    name: string;
    url: string;
    icon: IconComponent;
  }>;
}
