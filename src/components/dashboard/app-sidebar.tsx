"use client";
import {
  DashboardCircleIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  Folder,
  HelpCircle,
  LayoutDashboard,
  Library,
  Link as LinkIcon,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserPenIcon,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";

// Types
type LucideIcon = typeof Calendar;
type MenuItem = {
  title: string;
  icon: LucideIcon | IconSvgElement;
  iconType: "lucide" | "hugeicons";
  url?: string;
  isActive?: boolean;
};

// Lawyer Menu Items
const lawyerMainMenuItems: Array<MenuItem> = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    iconType: "lucide",
    url: "/dashboard",
  },
  {
    title: "Inquiries",
    icon: Bell,
    iconType: "lucide",
    url: "/dashboard/inquiries",
  },
  {
    title: "Cases",
    icon: Folder,
    iconType: "lucide",
    url: "/dashboard/cases",
  },
  {
    title: "Calendar",
    icon: Calendar,
    iconType: "lucide",
    url: "/dashboard/calendar",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    iconType: "lucide",
    url: "/dashboard/messages",
  },
  {
    title: "Earnings",
    icon: Sparkles,
    iconType: "lucide",
    url: "/dashboard/earnings",
  },
  {
    title: "Clients",
    icon: Users,
    iconType: "lucide",
    url: "/dashboard/clients",
  },
];

const lawyerFavoriteItems: Array<MenuItem> = [
  {
    title: "Profile",
    icon: UserPenIcon,
    iconType: "lucide",
    url: "/dashboard/profile",
  },
  {
    title: "Reviews",
    icon: Sparkles,
    iconType: "lucide",
    url: "/dashboard/reviews",
  },
  {
    title: "Documents",
    icon: Folder,
    iconType: "lucide",
    url: "/dashboard/documents",
  },
];

// Client Menu Items
const clientMainMenuItems: Array<MenuItem> = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    iconType: "lucide",
    url: "/dashboard",
  },
  {
    title: "Search Lawyers",
    icon: Search,
    iconType: "lucide",
    url: "/dashboard/search-lawyer",
  },
  {
    title: "My Cases",
    icon: Folder,
    iconType: "lucide",
    url: "/dashboard/my-cases",
  },
  {
    title: "Appointments",
    icon: Calendar,
    iconType: "lucide",
    url: "/dashboard/appointments",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    iconType: "lucide",
    url: "/dashboard/messages",
  },
  {
    title: "My Lawyers",
    icon: Users,
    iconType: "lucide",
    url: "/dashboard/my-lawyers",
  },
];

const clientFavoriteItems: Array<MenuItem> = [
  {
    title: "Profile",
    icon: UserPenIcon,
    iconType: "lucide",
    url: "/dashboard/profile",
  },
  {
    title: "Saved Lawyers",
    icon: Sparkles,
    iconType: "lucide",
    url: "/dashboard/saved",
  },
  {
    title: "Documents",
    icon: Folder,
    iconType: "lucide",
    url: "/dashboard/documents",
  },
];

const footerMenuItems: Array<MenuItem> = [
  {
    title: "Feedback",
    icon: MessageSquare,
    iconType: "lucide",
  },
  {
    title: "Settings",
    icon: Settings02Icon,
    iconType: "hugeicons",
    url: "/dashboard/settings",
  },
  {
    title: "Help Center",
    icon: HelpCircle,
    iconType: "lucide",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const location = useLocation();
  const { data: session } = authClient.useSession();

  // Determine which menu items to show based on user role
  const isLawyer = session?.user?.role === 'lawyer';
  const mainMenuItems = isLawyer ? lawyerMainMenuItems : clientMainMenuItems;
  const favoriteItems = isLawyer ? lawyerFavoriteItems : clientFavoriteItems;

  const renderIcon = (item: MenuItem) => {
    if (item.iconType === "hugeicons") {
      return <HugeiconsIcon icon={item.icon as IconSvgElement} />;
    }
    const LucideIcon = item.icon as LucideIcon;
    return <LucideIcon className="size-4" />;
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.url) {
      return (
        <SidebarMenuButton
          className="h-7 text-muted-foreground text-sm"
          isActive={item.url === location.pathname}
          render={
            <Link to={item.url}>
              {renderIcon(item)}
              <span>{item.title}</span>
            </Link>
          }
        ></SidebarMenuButton>
      );
    }

    return (
      <SidebarMenuButton className="h-7 text-muted-foreground text-sm">
        {renderIcon(item)}
        <span>{item.title}</span>
      </SidebarMenuButton>
    );
  };

  return (
    <Sidebar className="lg:border-r-0!" collapsible="icon" {...props}>
      <SidebarHeader className="pb-0">
        <div className="px-2 py-3">
          <div className="flex justify-between items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex justify-between items-center gap-3 hover:bg-accent/50 p-0 rounded-md w-full h-auto text-left transition-colors">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center rounded-sm size-6 font-semibold text-white text-xs">
                    <Logo />
                  </div>
                  <span className="font-semibold">GetaLawyer</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronDown className="size-3 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex justify-center items-center bg-linear-to-br from-purple-500 to-pink-600 shadow rounded-sm size-6 font-semibold text-white text-xs">
                      SU
                    </div>
                    <span className="font-semibold">Square UI</span>
                    <Check className="ml-auto size-4" />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex justify-center items-center bg-linear-to-br from-blue-500 to-cyan-600 shadow rounded-sm size-6 font-semibold text-white text-xs">
                      CI
                    </div>
                    <span>Circle</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex justify-center items-center bg-linear-to-br from-orange-500 to-red-600 shadow rounded-sm size-6 font-semibold text-white text-xs">
                      LN
                    </div>
                    <span>lndev-ui</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="size-4" />
                  <span>Add new team</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* <div className="relative mt-4"> */}
          {/*   <Search className="top-1/2 left-2.5 z-10 absolute size-4 text-muted-foreground -translate-y-1/2" /> */}
          {/*   <Input */}
          {/*     type="search" */}
          {/*     placeholder="Search..." */}
          {/*     className="bg-background pr-8 pl-8 h-8 text-muted-foreground placeholder:text-muted-foreground text-sm tracking-[-0.42px]" */}
          {/*   /> */}
          {/*   <div className="top-1/2 right-2 absolute flex items-center gap-0.5 bg-sidebar px-1.5 py-0.5 border border-border rounded -translate-y-1/2 shrink-0"> */}
          {/*     <span className="font-medium text-[10px] text-muted-foreground leading-none tracking-[-0.1px]"> */}
          {/*       ⌘ */}
          {/*     </span> */}
          {/*     <Kbd className="bg-transparent px-0 py-0 border-0 min-w-0 h-auto text-[10px] leading-none tracking-[-0.1px]"> */}
          {/*       K */}
          {/*     </Kbd> */}
          {/*   </div> */}
          {/* </div> */}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {renderMenuItem(item)}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <Collapsible open={favoritesOpen} onOpenChange={setFavoritesOpen}>
            <CollapsibleTrigger>
              <SidebarGroupLabel className="hover:bg-transparent pt-2 pb-4 h-4 text-muted-foreground hover:text-foreground text-xs cursor-pointer">
                <span>Favorites</span>
                <ChevronDown
                  className={cn(
                    "ml-auto size-3 transition-transform",
                    favoritesOpen && "rotate-180",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {favoriteItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {renderMenuItem(item)}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-1 mb-4">
          <SidebarMenu>
            {footerMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                {renderMenuItem(item)}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
