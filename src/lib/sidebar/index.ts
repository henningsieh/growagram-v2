// src/lib/sidebar/index.ts:
import * as Icons from "lucide-react";
import sidebarConfig from "~/lib/sidebar/data.json";
import { SidebarItems } from "~/types/sidebar";

// Define a type for the Lucide icon components
type IconType = keyof typeof Icons;

type IconComponent = React.ForwardRefExoticComponent<
  Omit<React.ComponentPropsWithoutRef<"svg">, keyof Icons.LucideProps> &
    Icons.LucideProps &
    React.RefAttributes<SVGSVGElement>
>;

// Helper function to convert icon strings to actual Lucide components
function getIconComponent(iconName: string): IconComponent {
  if (!(iconName in Icons)) {
    throw new Error(`Icon ${iconName} not found in Lucide icons`);
  }
  return Icons[iconName as IconType] as IconComponent;
}

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

// Process the JSON config to convert icon strings to components
function getSidebarItems(): ProcessedSidebarItems {
  return {
    ...sidebarConfig,
    teams: sidebarConfig.teams.map((team) => ({
      ...team,
      logo: getIconComponent(team.logo),
    })),
    navMain: sidebarConfig.navMain.map((item) => ({
      ...item,
      icon: item.icon ? getIconComponent(item.icon) : undefined,
    })),
    projects: sidebarConfig.projects.map((project) => ({
      ...project,
      icon: getIconComponent(project.icon),
    })),
  };
}

// Export the processed sidebar items
export const sidebarItems = getSidebarItems();

// Helper function to find the current navigation item
export function findCurrentNavItem(path: string, navItems: ProcessedNavItem[]) {
  for (const item of navItems) {
    const subItem = item.items?.find((subItem) => subItem.url === path);
    if (subItem) {
      return { main: item, sub: subItem };
    }
  }
  return null;
}

// Export the type for the nav items (replacing PlatformSidebarItems)
export type PlatformSidebarItems = ProcessedNavItem[];
