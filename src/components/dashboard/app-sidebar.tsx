import {
  Settings02Icon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Calendar,
  ChevronDown,
  DollarSign,
  Folder,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
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

// Property Manager Menu Items
const lawyerMainMenuItems: Array<MenuItem> = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    iconType: "lucide",
    url: "/dashboard",
  },
  {
    title: "Listings",
    icon: Folder,
    iconType: "lucide",
    url: "/dashboard/listings",
  },
  {
    title: "Booking Management",
    icon: Calendar,
    iconType: "lucide",
    url: "/dashboard/bookings",
  },
  {
    title: "People",
    icon: Users,
    iconType: "lucide",
    url: "/dashboard/people",
  },
  {
    title: "Finance & Payments",
    icon: DollarSign,
    iconType: "lucide",
    url: "/dashboard/finance",
  },
  {
    title: "Maintenance",
    icon: Settings,
    iconType: "lucide",
    url: "/dashboard/maintenance",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    iconType: "lucide",
    url: "/dashboard/messages",
  },
  {
    title: "Analytics & Reporting",
    icon: TrendingUp,
    iconType: "lucide",
    url: "/dashboard/analytics",
  },
  {
    title: "Team Management",
    icon: Users,
    iconType: "lucide",
    url: "/dashboard/team",
  },
];

const lawyerFavoriteItems: Array<MenuItem> = [];

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
    icon: UserEdit01Icon,
    iconType: "hugeicons",
    url: "/dashboard/profile",
  },
];

const footerMenuItems: Array<MenuItem> = [
  {
    title: "Contact Support",
    icon: MessageSquare,
    iconType: "lucide",
  },
  {
    title: "Settings",
    icon: Settings02Icon,
    iconType: "hugeicons",
    url: "/dashboard/settings",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const location = useLocation();
  const { data: session } = authClient.useSession();

  // Determine which menu items to show based on user role
  const isLawyer = session?.user?.role === 'lawyer';
  // Note: "user" role is for regular clients, "lawyer" role is for lawyers
  const mainMenuItems = isLawyer ? lawyerMainMenuItems : clientMainMenuItems;
  const favoriteItems = isLawyer ? lawyerFavoriteItems : clientFavoriteItems;

  const renderIcon = (item: MenuItem) => {
    if (item.iconType === "hugeicons") {
      return <HugeiconsIcon icon={item.icon as IconSvgElement} variant="solid" />;
    }
    const LucideIcon = item.icon as LucideIcon;
    return <LucideIcon className="size-5" />;
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = item.url === location.pathname;
    
    if (item.url) {
      return (
        <SidebarMenuButton
          className={cn(
            "items-center gap-2 px-3 border rounded-lg h-9 font-medium text-sm leading-5 tracking-[-0.006em] transition-colors",
            isActive 
              ? "bg-white border-[#E1E6EB] text-[#525866] hover:bg-white" 
              : "bg-transparent border-transparent text-[#525866] hover:bg-gray-200/50"
          )}
          isActive={isActive}
          render={
            <Link to={item.url} className="flex items-center gap-2">
              <span className="flex justify-center items-center size-5 text-[#525866]">
                {renderIcon(item)}
              </span>
              <span>{item.title}</span>
            </Link>
          }
        ></SidebarMenuButton>
      );
    }

    return (
      <SidebarMenuButton 
        className="items-center gap-2 hover:bg-gray-200/50 px-3 border border-transparent rounded-lg h-9 font-medium text-[#525866] text-sm leading-5 tracking-[-0.006em] transition-colors"
      >
        <span className="flex justify-center items-center size-5 text-[#525866]">{renderIcon(item)}</span>
        <span>{item.title}</span>
      </SidebarMenuButton>
    );
  };

  return (
    <Sidebar className="bg-gray-100 lg:border-r-0!" collapsible="icon" {...props}>
      <SidebarHeader className="bg-gray-100 pb-0">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="flex justify-center items-center bg-gray-900 rounded-sm size-8 font-bold text-white text-sm">
                <Logo />
              </div>
              <span className="font-semibold text-gray-900">Smart Stay Rentals</span>
            </div>
            <ChevronDown className="size-4 text-gray-400" />
          </div>

          <div className="relative">
            <Search className="top-1/2 left-3 z-10 absolute size-4 text-gray-400 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search..."
              className="bg-white pl-10 border-gray-200 h-10 text-gray-600 placeholder:text-gray-400 text-sm"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gray-100">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 pt-4 pb-2 h-auto font-medium text-gray-500 text-xs uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
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

        <SidebarSeparator className="bg-gray-200" />

        {favoriteItems.length > 0 && (
          <SidebarGroup>
            <Collapsible open={favoritesOpen} onOpenChange={setFavoritesOpen}>
              <CollapsibleTrigger>
                <SidebarGroupLabel className="hover:bg-transparent px-4 pt-2 pb-4 h-4 text-gray-500 hover:text-gray-700 text-xs uppercase tracking-wider cursor-pointer">
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
        )}
      </SidebarContent>

      <SidebarFooter className="bg-gray-100 p-4">
        <div className="space-y-1 mb-4">
          <div className="mb-3 px-2 font-medium text-gray-500 text-xs uppercase tracking-wider">
            Help & Support
          </div>
          <SidebarMenu>
            {footerMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                {renderMenuItem(item)}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 bg-white hover:bg-gray-200/50 p-3 border border-gray-200 rounded-lg transition-colors cursor-pointer">
          <div className="flex justify-center items-center bg-linear-to-br from-purple-500 to-pink-500 rounded-full w-10 h-10 font-semibold text-white text-sm">
            {session?.user?.name?.split(' ').map(n => n[0]).join('') || 'SW'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{session?.user?.name || 'Sophia Williams'}</p>
            <p className="text-gray-500 text-xs">Admin</p>
          </div>
          <ChevronDown className="size-4 text-gray-400" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
