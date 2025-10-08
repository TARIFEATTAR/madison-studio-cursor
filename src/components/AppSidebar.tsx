import { Link, useLocation } from "react-router-dom";
import { Archive, BookOpen, Sparkles, Calendar as CalendarIcon, Repeat, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const AppSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const navItems = [
    { 
      path: "/library", 
      label: "Library", 
      icon: Archive,
      description: "Browse and manage your content library"
    },
    { 
      path: "/prompt-library", 
      label: "Prompts", 
      icon: BookOpen,
      description: "Your collection of proven prompts"
    },
    { 
      path: "/forge", 
      label: "Composer", 
      icon: Sparkles,
      description: "Generate new content with AI assistance"
    },
    { 
      path: "/repurpose", 
      label: "Amplify", 
      icon: Repeat,
      description: "Repurpose content for different platforms"
    },
    { 
      path: "/calendar", 
      label: "Planner", 
      icon: CalendarIcon,
      description: "Schedule and plan your content calendar"
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      className={cn(
        "border-r border-border/40 bg-soft-ivory transition-all duration-200",
        collapsed ? "w-14" : "w-60"
      )}
      collapsible="icon"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/40">
        <Link to="/" className="flex items-center group">
          <img 
            src="/logo.png" 
            alt="Scriptora" 
            className={cn(
              "transition-all duration-300 group-hover:scale-105",
              collapsed ? "h-8 w-auto" : "h-12 w-auto"
            )}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>
      </div>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "min-h-10 px-3 py-2 rounded-md transition-all hover:bg-stone-beige/50",
                            active && "bg-saffron-gold/20 border-l-3 border-saffron-gold font-medium text-foreground"
                          )}
                        >
                          <Link to={item.path} className="flex items-center gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="flex-1 text-sm leading-tight">{item.label}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Settings and Sign Out */}
      <SidebarFooter className="border-t border-border/40 p-4 bg-soft-ivory">
        <SidebarMenu>
          <div className="flex gap-2">
            <SidebarMenuItem className="flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    className="h-9 px-2 py-2 rounded-md hover:bg-stone-beige/50 transition-all"
                  >
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span className="flex-1 text-sm leading-tight">Settings</span>}
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Manage your settings</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>

            <SidebarMenuItem className="flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={signOut}
                    className="h-9 px-2 py-2 rounded-md hover:bg-stone-beige/50 transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="flex-1 text-sm leading-tight">Sign Out</span>}
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Sign out of your account</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
