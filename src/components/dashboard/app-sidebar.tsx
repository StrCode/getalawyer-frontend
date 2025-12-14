"use client";
import { useState } from "react";
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
import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { Logo } from "../logo";
import type { IconSvgElement } from "@hugeicons/react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

// Types
type LucideIcon = typeof Calendar;
type MenuItem = {
  title: string;
  icon: LucideIcon | IconSvgElement;
  iconType: "lucide" | "hugeicons";
  url?: string;
  isActive?: boolean;
};

// Menu Items Data
const mainMenuItems: Array<MenuItem> = [
  {
    title: "Dashboard",
    icon: DashboardCircleIcon,
    iconType: "hugeicons",
    url: "/dashboard",
  },
  {
    title: "Search",
    icon: Calendar,
    iconType: "lucide",
  },
  {
    title: "Bookings",
    icon: Library,
    iconType: "lucide",
  },
  {
    title: "Case Management",
    icon: Users,
    iconType: "lucide",
  },
  {
    title: "Messages",
    icon: Settings02Icon,
    iconType: "hugeicons",
  },
  {
    title: "Reviews",
    icon: UserPenIcon,
    iconType: "lucide",
  },
];

const favoriteItems: Array<MenuItem> = [
  {
    title: "Contracts",
    icon: Folder,
    iconType: "lucide",
  },
  {
    title: "Content",
    icon: Folder,
    iconType: "lucide",
  },
  {
    title: "Summaries",
    icon: Folder,
    iconType: "lucide",
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

  const renderIcon = (item: MenuItem) => {
    if (item.iconType === "hugeicons") {
      return <HugeiconsIcon icon={item.icon as IconSvgElement} />;
    }
    const LucideIcon = item.icon as LucideIcon;
    return <LucideIcon className="size-4" />;
  };

  const renderMenuItem = (item: MenuItem) => {
    console.log(location);
    if (item.url) {
      return (
        <SidebarMenuButton
          className="h-7 text-sm text-muted-foreground"
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
      <SidebarMenuButton className="h-7 text-sm text-muted-foreground">
        {renderIcon(item)}
        <span>{item.title}</span>
      </SidebarMenuButton>
    );
  };

  return (
    <Sidebar className="lg:border-r-0!" collapsible="icon" {...props}>
      <SidebarHeader className="pb-0">
        <div className="px-2 py-3">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  className="flex items-center justify-between gap-3 h-auto p-0 hover:bg-transparent w-full"
                >
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-sm flex items-center justify-center text-white text-xs font-semibold">
                      <Logo />
                    </div>
                    <span className="font-semibold">GetaLawyer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="size-6 bg-linear-to-br from-purple-500 to-pink-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
                      SU
                    </div>
                    <span className="font-semibold">Square UI</span>
                    <Check className="size-4 ml-auto" />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="size-6 bg-linear-to-br from-blue-500 to-cyan-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
                      CI
                    </div>
                    <span>Circle</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-3 w-full">
                    <div className="size-6 bg-linear-to-br from-orange-500 to-red-600 rounded-sm shadow flex items-center justify-center text-white text-xs font-semibold">
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

          {/* <div className="mt-4 relative"> */}
          {/*   <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10" /> */}
          {/*   <Input */}
          {/*     type="search" */}
          {/*     placeholder="Search..." */}
          {/*     className="pl-8 pr-8 h-8 text-sm text-muted-foreground placeholder:text-muted-foreground tracking-[-0.42px] bg-background" */}
          {/*   /> */}
          {/*   <div className="flex items-center gap-0.5 rounded border border-border bg-sidebar px-1.5 py-0.5 shrink-0 absolute right-2 top-1/2 -translate-y-1/2"> */}
          {/*     <span className="text-[10px] font-medium text-muted-foreground leading-none tracking-[-0.1px]"> */}
          {/*       ⌘ */}
          {/*     </span> */}
          {/*     <Kbd className="h-auto min-w-0 px-0 py-0 text-[10px] leading-none tracking-[-0.1px] bg-transparent border-0"> */}
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
              <SidebarGroupLabel className="h-4 pb-4 pt-2 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer">
                <span>Favorites</span>
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform ml-auto",
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
