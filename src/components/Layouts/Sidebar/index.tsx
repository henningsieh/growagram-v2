"use client";

// src/components/Layouts/Sidebar/index.tsx:
import * as React from "react";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  BellIcon,
  ChevronRight,
  ChevronsUpDown,
  CircleGaugeIcon,
  LogOutIcon,
  PlusIcon,
  SparklesIcon,
  UserPenIcon,
} from "lucide-react";
import { modulePaths } from "~/assets/constants";
import { NavigationBreadcrumb } from "~/components/Layouts/Breadcrumbs";
import { CustomAvatar } from "~/components/atom/custom-avatar";
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
import { useSignOut } from "~/hooks/use-auth";
import { Link } from "~/lib/i18n/routing";
import { sidebarItems, translateSidebar } from "~/lib/sidebar";

/**
 * ProtectedSidebar: Main sidebar component for authenticated users
 * Provides navigation, team switching, and user profile management
 */
export default function ProtectedSidebar({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();

  return (
    <SidebarProvider className="relative min-h-[calc(100svh-7rem)]">
      {/* Main sidebar with floating, collapsible design */}
      <ProtectedSidebarContent session={session}>
        {children}
      </ProtectedSidebarContent>
    </SidebarProvider>
  );
}

function ProtectedSidebarContent({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const handleSignOut = useSignOut();
  const { isMobile, toggleSidebar, open } = useSidebar();

  const translatedSidebarItems = translateSidebar(t, sidebarItems);

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="floating"
        className="sticky top-14 h-[calc(100svh-4rem)] shrink-0"
      >
        {/* Sidebar Header: Team Switcher */}
        <SidebarHeader>
          <TeamSwitcher teams={translatedSidebarItems.teams} />
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
                    <Link href={modulePaths.DASHBOARD.path}>
                      <SidebarMenuButton
                        tooltip={t("Platform.Dashboard-title")}
                      >
                        <CircleGaugeIcon />
                        <span>{t("Platform.Dashboard-title")}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200" />
                      </SidebarMenuButton>
                    </Link>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
              </Collapsible>
              {translatedSidebarItems.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger
                      asChild
                      onClick={() => {
                        if (!open) toggleSidebar();
                      }}
                    >
                      {/* <Link href={item.url}> */}
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                      {/* </Link> */}
                    </CollapsibleTrigger>
                    <CollapsibleContent
                      onClick={() => {
                        if (isMobile) toggleSidebar();
                      }}
                    >
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

          {/* Coming Soon */}
          <SidebarGroup className="text-muted-foreground group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>{t("Platform.coming-soon")}</SidebarGroupLabel>
            <SidebarMenu>
              {/* Project Items with Dropdown Actions */}
              {translatedSidebarItems.coming_soon.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    // className="hover:cursor-default hover:bg-transparent"
                  >
                    <div>
                      {/* <Link href={item.url}> */}
                      <item.icon />
                      <span>{item.name}</span>
                      {/* </Link> */}
                    </div>
                  </SidebarMenuButton>
                  {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal />
                          <span className="sr-only">{t("Platform.more")}</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-48 rounded-sm"
                        side="bottom"
                        align="end"
                      > */}
                  {/* Project Action Items */}
                  {/* <DropdownMenuItem>
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
                    </DropdownMenu> */}
                </SidebarMenuItem>
              ))}

              {/* Additional Projects Option */}
              {/* <SidebarMenuItem>
                  <SidebarMenuButton className="text-sidebar-foreground/70">
                    <MoreHorizontal className="text-sidebar-foreground/70" />
                    <span>More</span>
                  </SidebarMenuButton>
                </SidebarMenuItem> */}
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
                    <CustomAvatar
                      size={32}
                      src={session?.user.image ?? undefined}
                      alt={session?.user.username ?? "User avatar"}
                      fallback={session?.user.name?.[0] || "?"}
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user.name as string}
                      </span>
                      <span
                        className="truncate text-xs"
                        // eslint-disable-next-line react/jsx-no-literals
                      >
                        @{session?.user.username as string}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                {/* User Profile Dropdown Content */}
                <DropdownMenuContent
                  onClick={function () {
                    if (isMobile) toggleSidebar();
                  }}
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-sm"
                  // side="right"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  {/* Repeated User Profile Header */}
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <CustomAvatar
                        size={32}
                        src={session?.user.image ?? undefined}
                        alt={session?.user.username ?? "User avatar"}
                        fallback={session?.user.name?.[0] || "?"}
                      />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {session?.user.name as string}
                        </span>
                        <span className="truncate text-xs">
                          {
                            // eslint-disable-next-line react/jsx-no-literals
                            `@${session?.user.username as string}`
                          }
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  {/* User Account Actions */}
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link href={modulePaths.PREMIUM.path}>
                      <DropdownMenuItem className="cursor-pointer text-yellow-500 focus:bg-yellow-600/50 focus:text-white">
                        <SparklesIcon />
                        {t("Premium.navigation.label")}
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link href={modulePaths.ACCOUNT.path}>
                      <DropdownMenuItem className="cursor-pointer">
                        <UserPenIcon />
                        {t("Account.navigation.label")}
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuItem>
                      <BellIcon />
                      {t("Notifications.ActivityFeed.label-all")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* Sign Out Action */}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOutIcon />
                    {t("Platform.SignOut.buttonLabel")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Sidebar Rail for Additional Navigation */}
        <SidebarRail className="inset-y-2" />
      </Sidebar>

      {/* Sidebar Inset: Content Area */}
      <SidebarInset className="min-h-[calc(100svh-5rem)]">
        {/* Sticky Header with Sidebar Toggle and Breadcrumbs */}
        <header className="bg-background/90 sticky top-14 flex h-14 shrink-0 items-center justify-between gap-2 backdrop-blur-xs">
          <div className="flex items-center gap-2 pl-2 md:pl-1 lg:pl-3 xl:pl-5">
            <SidebarTrigger className="text-primary" />
            <Separator orientation="vertical" className="h-5" />
            <NavigationBreadcrumb />
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-col gap-2 pt-0">
          <div className="rounded-sm">{children}</div>
        </div>
      </SidebarInset>
    </>
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
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

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
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm">
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
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-sm"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
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
              <div className="bg-background flex size-6 items-center justify-center rounded-sm border">
                <PlusIcon className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
