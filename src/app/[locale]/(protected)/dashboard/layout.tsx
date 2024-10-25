"use client";

import {
  BadgeCheck,
  Bell,
  CalendarCheck,
  Cannabis,
  ChevronRight,
  ChevronsUpDown,
  Clipboard,
  CreditCard,
  Folder,
  Forward,
  LogOut,
  MoreHorizontal,
  PencilRuler,
  Sparkles,
  Sprout,
  TentTree,
  Thermometer,
  Trash2,
  TreeDeciduous,
  Workflow,
} from "lucide-react";
import { TeamSwitcher } from "~/components/layouts/sidebar/team-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "grower_user", // Placeholder user
    email: "grower@example.com",
    avatar: "/avatars/grower.jpg", // Example avatar
  },
  teams: [
    {
      name: "GrowAGram Collective", // A community or team of growers
      logo: Cannabis, // Icon for cannabis
      plan: "Premium", // GrowAGram plan (could have different tiers)
    },
    {
      name: "Personal Growers", // Individual growers could have "teams"
      logo: TreeDeciduous,
      plan: "Basic",
    },
  ],
  navMain: [
    {
      title: "Grows",
      url: "/grows",
      icon: TentTree, // An icon representing plants or growth
      isActive: true,
      items: [
        {
          title: "My Grows", // View and manage their cannabis grows
          url: "#",
        },
        {
          title: "Create New Grow", // Easily add new grows
          url: "#",
        },
        {
          title: "Grow History", // Check history of completed grows
          url: "#",
        },
      ],
    },
    {
      title: "Plants",
      url: "#",
      icon: Sprout, // Icon representing individual plants
      items: [
        {
          title: "My Plants", // View and manage all plants within grows
          url: "#",
        },
        {
          title: "Add Plant", // Easily add new plants to a grow
          url: "#",
        },
        // {
        //   title: "Plant Details", // Check detailed info about plants
        //   url: "#",
        // },
      ],
    },
    {
      title: "Posts",
      url: "#",
      icon: Clipboard, // Icon for updates, posts, or activity feed
      items: [
        {
          title: "My Posts", // View and manage updates on grows
          url: "#",
        },
        {
          title: "Add Post", // Add an update (watering, pruning, etc.)
          url: "#",
        },
        {
          title: "Ask Question", // Ask the community or other growers
          url: "#",
        },
      ],
    },
    {
      title: "Inventory",
      url: "#",
      icon: PencilRuler, // Icon representing inventory or tools
      items: [
        {
          title: "My Inventory", // Manage seeds, tools, LEDs, etc.
          url: "#",
        },
        {
          title: "Add Item", // Add an item to the inventory
          url: "#",
        },
        // {
        //   title: "Item Categories", // Manage item categories (e.g., seeds, tools)
        //   url: "#",
        // },
      ],
    },
    // {
    //   title: "Community",
    //   url: "#",
    //   icon: Users, // Icon for community or collaboration
    //   items: [
    //     {
    //       title: "Discussions", // Community forum discussions
    //       url: "#",
    //     },
    //     {
    //       title: "Guides & Tips", // Guides shared by other growers
    //       url: "#",
    //     },
    //     {
    //       title: "Events", // Grow-related events and meetups
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings, // Icon for settings
    //   items: [
    //     {
    //       title: "Account Settings", // Manage user profile, billing, etc.
    //       url: "#",
    //     },
    //     {
    //       title: "Team Management", // Manage team members if part of a collective
    //       url: "#",
    //     },
    //     {
    //       title: "Notifications", // Manage notifications and alerts
    //       url: "#",
    //     },
    //     {
    //       title: "Subscription", // View or upgrade subscription
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  projects: [
    {
      name: "Grow Automation",
      url: "#",
      icon: Workflow, // Icon representing automation
    },
    {
      name: "Nutrient Scheduling",
      url: "#",
      icon: CalendarCheck, // Icon for scheduling or feeding plans
    },
    {
      name: "Climate Control",
      url: "#",
      icon: Thermometer, // Icon for temperature and climate control
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              {data.projects.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side="bottom"
                      align="end"
                    >
                      <DropdownMenuItem>
                        <Folder className="text-muted-foreground" />
                        <span>View Project</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Forward className="text-muted-foreground" />
                        <span>Share Project</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trash2 className="text-muted-foreground" />
                        <span>Delete Project</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <MoreHorizontal className="text-sidebar-foreground/70" />
                  <span>More</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={data.user.avatar}
                        alt={data.user.name}
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {data.user.name}
                      </span>
                      <span className="truncate text-xs">
                        {data.user.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={data.user.avatar}
                          alt={data.user.name}
                        />
                        <AvatarFallback className="rounded-lg">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {data.user.name}
                        </span>
                        <span className="truncate text-xs">
                          {data.user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Sparkles />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheck />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
          <div className="grid auto-rows-min gap-2 md:grid-cols-3">
            <div className="aspect-video rounded-md bg-muted/50" />
            <div className="aspect-video rounded-lg bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-lg bg-muted/50 md:min-h-min">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
