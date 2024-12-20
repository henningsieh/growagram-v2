"use client";

// src/components/Layouts/Sidebar/index.tsx:
import {
  Bell,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  Folder,
  Forward,
  Gauge,
  LogOut,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
  UserPen,
} from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
  DropdownMenuShortcut,
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
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar";
import { useIsMobile } from "~/hooks/use-mobile";
import { Link } from "~/lib/i18n/routing";
import { sidebarItems } from "~/lib/sidebar";
import { handleSignOut } from "~/server/actions/authActions";

import { NavigationBreadcrumb } from "../Breadcrumbs";

/**
 * ProtectedSidebar: Main sidebar component for authenticated users
 * Provides navigation, team switching, and user profile management
 */
export default function ProtectedSidebar({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations();
  const isMobile = useIsMobile();

  const user = useSession().data?.user as User;

  return (
    <SidebarProvider className="relative">
      {/* Main sidebar with floating, collapsible design */}
      <Sidebar collapsible="icon" variant="floating" className="flex-shrink-0">
        {/* Sidebar Header: Team Switcher */}
        <SidebarHeader>
          <TeamSwitcher teams={sidebarItems.teams} />
        </SidebarHeader>
        {/* Main Navigation Content */}
        <SidebarContent>
          {/* Dashboard Group */}
          <SidebarGroup>
            {/* Main Navigation Menu with Collapsible Items */}
            <SidebarMenu>
              {/* Dashboard Button */}
              <Collapsible asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <Link href="/dashboard">
                      <SidebarMenuButton
                        tooltip={t("Platform.Dashboard-title")}
                      >
                        <Gauge />
                        <span>{t("Platform.Dashboard-title")}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200" />
                      </SidebarMenuButton>
                    </Link>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
              </Collapsible>
              {sidebarItems.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      {/* <Link href={item.url}> */}
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                      {/* </Link> */}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
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

          {/* Projects Group */}
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              {/* Project Items with Dropdown Actions */}
              {sidebarItems.projects.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-sm"
                      side="bottom"
                      align="end"
                    >
                      {/* Project Action Items */}
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

              {/* Additional Projects Option */}
              <SidebarMenuItem>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <MoreHorizontal className="text-sidebar-foreground/70" />
                  <span>More</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* User Profile Footer */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* User Profile Trigger */}
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    {/* User Avatar and Details */}
                    <Avatar className="h-8 w-8 rounded-sm">
                      <AvatarImage
                        src={user && (user.image as string)}
                        alt={user && (user.name as string)}
                      />
                      <AvatarFallback className="rounded-sm">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user && (user.name as string)}
                      </span>
                      <span className="truncate text-xs">
                        @{user && (user.username as string)}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                {/* User Profile Dropdown Content */}
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm"
                  // side="right"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  {/* Repeated User Profile Header */}
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-sm">
                        <AvatarImage
                          src={user && (user.image as string)}
                          alt={`@${user && (user.username as string)}`}
                        />
                        <AvatarFallback className="rounded-sm">
                          CN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user && (user.name as string)}
                        </span>
                        <span className="truncate text-xs">
                          {`@${user && (user.username as string)}`}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  {/* User Account Actions */}
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="text-yellow-500 focus:bg-yellow-600/50 focus:text-white">
                      <Sparkles />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link href="/account">
                      <DropdownMenuItem className="cursor-pointer">
                        <UserPen />
                        Account
                      </DropdownMenuItem>
                    </Link>
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

                  {/* Sign Out Action */}
                  <DropdownMenuItem onClick={async () => await handleSignOut()}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Sidebar Rail for Additional Navigation */}
        <SidebarRail />
      </Sidebar>

      {/* Sidebar Inset: Content Area */}
      <SidebarInset>
        {/* Sticky Header with Sidebar Toggle and Breadcrumbs */}
        <header className="sticky top-14 z-10 flex h-14 shrink-0 items-center justify-between gap-2 bg-background/90 backdrop-blur">
          <div className="flex items-center gap-2 pl-2 md:pl-1 lg:pl-3 xl:pl-5">
            <SidebarTrigger className="text-primary" />
            <Separator orientation="vertical" className="h-5" />
            <NavigationBreadcrumb />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col gap-2 pt-0">
          <div className="flex-1 rounded-sm">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * TeamSwitcher Component: Manages team selection and display
 * Renders a dropdown menu for switching between different teams
 */
function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = useState(teams[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {/* Team switcher trigger with active team information */}
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* Active team logo and details */}
              <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
                <activeTeam.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* Team selection dropdown content */}
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-sm"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>

            {/* Render team selection items */}
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <team.logo className="size-4 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            {/* Add team option */}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
