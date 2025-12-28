import { Link } from '@tanstack/react-router';
import { 
  BarChart3, 
  FileText, 
  LayoutDashboard, 
  MessageSquare,
  Settings,
  UserCheck, 
  Users 
} from 'lucide-react';
import type React from 'react';
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
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface AdminSidebarProps {
  currentPath: string;
  userRole: 'reviewer' | 'admin' | 'super_admin';
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<'reviewer' | 'admin' | 'super_admin'>;
}

const menuItems: Array<MenuItem> = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['reviewer', 'admin', 'super_admin']
  },
  {
    title: 'Applications',
    href: '/admin/applications',
    icon: FileText,
    roles: ['reviewer', 'admin', 'super_admin']
  },
  {
    title: 'Lawyers',
    href: '/admin/lawyers',
    icon: UserCheck,
    roles: ['admin', 'super_admin']
  },
  {
    title: 'Clients',
    href: '/admin/clients',
    icon: Users,
    roles: ['admin', 'super_admin']
  },
  {
    title: 'Statistics',
    href: '/admin/statistics',
    icon: BarChart3,
    roles: ['admin', 'super_admin']
  },
  {
    title: 'Communications',
    href: '/admin/communications',
    icon: MessageSquare,
    roles: ['admin', 'super_admin']
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['super_admin']
  }
];

export function AdminSidebar({ currentPath, userRole }: AdminSidebarProps) {
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Admin Dashboard</span>
            <span className="truncate text-xs text-muted-foreground">
              {userRole.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href || 
                  (item.href !== '/admin' && currentPath.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link 
                      to={item.href}
                      className="w-full"
                    >
                      <SidebarMenuButton 
                        isActive={isActive}
                        tooltip={item.title}
                        className="w-full flex items-center gap-2"
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="p-2">
          <div className="flex items-center gap-2 rounded-md bg-muted p-2">
            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="size-3" />
            </div>
            <div className="grid flex-1 text-left text-xs leading-tight">
              <span className="truncate font-medium">Role</span>
              <span className="truncate text-muted-foreground capitalize">
                {userRole.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}