import { Home, Archive, Pencil, Share2, Calendar, FileText, Video, Settings, ChevronLeft, ChevronRight, LogOut, User, Menu } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import madisonLogo from "@/assets/madison-logo-icon.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: Home 
  },
  { 
    title: "The Archives", 
    url: "/library", 
    icon: Archive 
  },
  { 
    title: "Create", 
    url: "/create", 
    icon: Pencil 
  },
  { 
    title: "Multiply", 
    url: "/multiply", 
    icon: Share2 
  },
  { 
    title: "Schedule", 
    url: "/schedule", 
    icon: Calendar 
  },
  { 
    title: "Prompt Library", 
    url: "/templates", 
    icon: FileText 
  },
  { 
    title: "Meet Madison", 
    subtitle: "Editorial Director",
    url: "/meet-madison", 
    icon: User
  },
];

export function AppSidebar() {
  const { open, toggleSidebar, isMobile, openMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get user display info
  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserDisplay = () => {
    if (!user?.email) return "User";
    // Get the part before @ in email
    const emailName = user.email.split("@")[0];
    // Capitalize first letter
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-gradient-to-r from-ink-black to-charcoal border-b border-aged-brass/20 flex items-center px-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu strokeWidth={1} className="w-6 h-6 text-parchment-white" />
          </button>
        </header>
      )}

      <Sidebar
        collapsible="icon"
        className="border-r-0"
        style={{
          backgroundColor: "#0A0A0A"
        }}
      >
        {/* Header */}
        <SidebarHeader className="border-b border-white/10 p-0">
          {open && (
            <div className="px-4 pt-6 pb-4 flex items-center justify-between">
              <NavLink to="/dashboard" className="flex items-center gap-3 group">
                <img 
                  src={madisonLogo} 
                  alt="Madison Script" 
                  className="w-10 h-10 shrink-0 transition-transform duration-200 group-hover:scale-105"
                />
                <span className="font-serif text-xl text-white tracking-wide">Madison Script</span>
              </NavLink>
              <button 
                onClick={toggleSidebar}
                className="relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(38,33%,56%)]/50 rounded-lg"
                aria-label="Collapse sidebar"
              >
                <div className="relative w-8 h-8 rounded-lg border border-[hsl(38,33%,56%)]/30 bg-white/5 flex items-center justify-center transition-all duration-200 group-hover:border-[hsl(38,33%,56%)] group-hover:bg-white/10 group-hover:shadow-[0_0_12px_rgba(184,149,106,0.3)]">
                  <ChevronLeft className="w-4 h-4 text-[hsl(38,33%,56%)] transition-transform duration-200 group-hover:scale-110" />
                </div>
              </button>
            </div>
          )}
          
          {!open && (
            <div className="px-2 pt-6 pb-4 flex flex-col items-center gap-3">
              <NavLink to="/dashboard" className="group">
                <img 
                  src={madisonLogo} 
                  alt="Madison Script" 
                  className="w-10 h-10 transition-transform duration-200 group-hover:scale-105"
                />
              </NavLink>
              <button
                onClick={toggleSidebar}
                className="group w-full h-10 rounded-lg transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(38,33%,56%)]/50 border border-[hsl(38,33%,56%)]/30 bg-white/5 hover:border-[hsl(38,33%,56%)] hover:bg-white/10 hover:shadow-[0_0_12px_rgba(184,149,106,0.3)]"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4 text-[hsl(38,33%,56%)] transition-transform duration-200 group-hover:scale-110" />
              </button>
            </div>
          )}
        </SidebarHeader>

        {/* Main Navigation */}
        <SidebarContent>
          <div className="px-2 py-4 space-y-1.5">
            <SidebarMenu>
              {navItems.map((item) => {
                const isActiveRoute = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        group
                        ${isActiveRoute 
                          ? 'border-l-2 border-[hsl(38,33%,56%)] bg-white/8 text-white shadow-[inset_4px_0_8px_rgba(184,149,106,0.1)]' 
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5 hover:border-l-2 hover:border-[hsl(38,33%,56%)]/40'
                        }
                        ${open ? 'py-2.5 px-3' : 'h-12 justify-center'}
                        transition-all duration-200
                      `}
                    >
                      <NavLink to={item.url} onClick={() => isMobile && toggleSidebar()}>
                        <item.icon 
                          strokeWidth={1}
                          className={`w-6 h-6 shrink-0 transition-all duration-200 ${
                            isActiveRoute
                              ? 'text-[hsl(38,33%,56%)] drop-shadow-[0_0_6px_rgba(184,149,106,0.4)]'
                              : 'text-white/50 group-hover:text-white/70 group-hover:drop-shadow-[0_0_4px_rgba(184,149,106,0.2)] group-hover:scale-105'
                          }`} 
                        />
                        {open && (
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="font-semibold text-sm tracking-wide">{item.title}</span>
                            {item.subtitle && <span className="text-xs text-white/50">{item.subtitle}</span>}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>

          <Separator className="mx-4 bg-white/10" />

          {/* Video Tutorials */}
          <div className="px-2 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className={`
                    group text-white/50 hover:text-white/80 hover:bg-white/5 hover:border-l-2 hover:border-[hsl(38,33%,56%)]/40
                    ${open ? 'py-2.5 px-3' : 'h-12 justify-center'}
                    transition-all duration-200
                  `}
                >
                  <Video 
                    strokeWidth={1}
                    className="w-6 h-6 shrink-0 transition-all duration-200 text-white/50 group-hover:text-white/70 group-hover:drop-shadow-[0_0_4px_rgba(184,149,106,0.2)] group-hover:scale-105" 
                  />
                  {open && (
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-semibold text-sm tracking-wide">Video Tutorials</span>
                      <span className="text-xs text-white/60">Learn & Get Help</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="border-t border-white/5 p-4">
          <TooltipProvider>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-aged-brass rounded-full flex items-center justify-center text-ink-black font-bold text-sm shrink-0">
                {getUserInitials()}
              </div>
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{getUserDisplay()}</p>
                  <p className="text-white/60 text-xs truncate">{user?.email}</p>
                </div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="group text-white/50 hover:text-[hsl(38,33%,56%)] p-2 rounded-lg hover:bg-white/5 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]"
                    aria-label="Settings"
                  >
                    <Settings strokeWidth={1} className="w-5 h-5 transition-all duration-200 group-hover:scale-105" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
              {open && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleSignOut}
                      className="group text-white/50 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                      aria-label="Sign Out"
                    >
                      <LogOut strokeWidth={1} className="w-5 h-5 transition-all duration-200 group-hover:scale-105" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
