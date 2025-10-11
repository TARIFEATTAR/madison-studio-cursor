import { Home, Archive, Pencil, Share2, Calendar, FileText, Video, Settings, ChevronLeft, LogOut, User } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const navItems = [
  { 
    title: "Dashboard", 
    subtitle: "Overview & Actions",
    url: "/", 
    icon: Home 
  },
  { 
    title: "The Archives", 
    subtitle: "Content Library",
    url: "/library", 
    icon: Archive 
  },
  { 
    title: "Create", 
    subtitle: "Content Creation",
    url: "/create", 
    icon: Pencil 
  },
  { 
    title: "Multiply", 
    subtitle: "Repurpose Content",
    url: "/multiply", 
    icon: Share2 
  },
  { 
    title: "Schedule", 
    subtitle: "Content Calendar",
    url: "/schedule", 
    icon: Calendar 
  },
  { 
    title: "Templates", 
    subtitle: "Prompt Library",
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
  const { open, toggleSidebar } = useSidebar();
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
    <Sidebar 
      collapsible="icon"
      className="border-r-0"
      style={{
        background: "linear-gradient(180deg, hsl(var(--ink-black)), hsl(var(--charcoal)))"
      }}
    >
      {/* Header */}
      <SidebarHeader className="border-b border-white/10 p-0">
        <div className="flex items-center gap-3 px-4 py-6">
          <img 
            src="/logo.png" 
            alt="Scriptora" 
            className={`${open ? 'w-10 h-10' : 'w-8 h-8'} shrink-0 object-contain transition-all duration-200`}
          />
          {open && (
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-xl font-semibold font-serif tracking-tight">
                Scriptora
              </h1>
              <p className="text-aged-brass text-[10px] font-sans uppercase tracking-wider">
                EDITORIAL INTELLIGENCE
              </p>
            </div>
          )}
        </div>
        
        {open && (
          <div className="px-4 pb-4">
            <button 
              onClick={toggleSidebar}
              className="w-full bg-aged-brass hover:bg-antique-gold transition-colors text-ink-black font-semibold py-2.5 px-4 rounded-lg text-sm"
            >
              <span className="flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </span>
            </button>
          </div>
        )}
        
        {!open && (
          <div className="px-2 pb-4">
            <SidebarTrigger className="w-full h-10 hover:bg-white/5" />
          </div>
        )}
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <div className="px-2 py-4">
          <SidebarMenu>
            {navItems.map((item) => {
              const isActiveRoute = isActive(item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`
                      ${isActiveRoute 
                        ? 'border-l-4 border-aged-brass bg-white/5 text-white' 
                        : 'text-white/60 hover:text-aged-brass hover:bg-white/5'
                      }
                      ${open ? 'h-auto py-3' : 'h-12'}
                      transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]
                    `}
                  >
                    <NavLink to={item.url}>
                      <item.icon className={`w-5 h-5 shrink-0 ${isActiveRoute ? 'text-aged-brass' : ''}`} />
                      {open && (
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-sm">{item.title}</span>
                          <span className="text-xs text-white/60">{item.subtitle}</span>
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
                  text-white/60 hover:text-aged-brass hover:bg-white/5
                  ${open ? 'h-auto py-3' : 'h-12'}
                  transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]
                `}
              >
                <Video className="w-5 h-5 shrink-0" />
                {open && (
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-sm">Video Tutorials</span>
                    <span className="text-xs text-white/60">Learn & Get Help</span>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-white/10 p-4">
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
          <button 
            onClick={() => navigate('/settings')}
            className="text-white/60 hover:text-aged-brass p-2 rounded-lg hover:bg-white/5 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          {open && (
            <button 
              onClick={handleSignOut}
              className="text-white/60 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
