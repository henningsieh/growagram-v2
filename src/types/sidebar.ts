// types/sidebar.ts:

export interface UserInfo {
  name: string;
  username: string;
  email: string;
  avatar: string;
}

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

export interface SidebarItems {
  user: UserInfo;
  teams: Team[];
  navMain: NavItem[];
  projects: Project[];
}
