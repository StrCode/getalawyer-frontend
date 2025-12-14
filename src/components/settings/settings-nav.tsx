import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  NotificationBlock01Icon,
  ShieldUserIcon,
  UserCircleIcon,
  UserEdit01Icon
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type Item = {
  title: string;
  icon: IconSvgElement;
  url: string;
};

const sidebarNavItems: Array<Item> = [
  {
    title: "Profile",
    icon: UserCircleIcon,
    url: "/dashboard/settings",
  },
];

export function AccountSidebarNav() {
  return (
    <nav className="flex flex-col border rounded-2xl shadow-xs">
      <div className="px-3 py-3 lg:px-4 lg:py-4">
        <h2 className="text-xs text-muted-foreground">
          SELECT MENU
        </h2>
      </div>

      <div className="flex flex-col gap-1 px-2 pb-2">
        {sidebarNavItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors group",
              "hover:bg-accent",
              "[&.active]:bg-primary [&.active]:text-primary-foreground"
            )}
            activeProps={{
              className: "bg-accent text-accent-foreground"
            }}
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={item.icon} size={15} />
              <span className="text-sm">{item.title}</span>
            </div>

            <div className={cn(
              "p-1 rounded-full transition-colors",
              "group-hover:bg-white group-hover:text-black",
              "[.active_&]:bg-white [.active_&]:text-black"
            )}>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={18}
              />
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
