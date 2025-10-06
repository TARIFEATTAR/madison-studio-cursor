import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Archive, Calendar as CalendarIcon, LogOut, Repeat, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { 
      path: "/library", 
      label: "Library", 
      icon: BookOpen,
      description: "Browse and manage your content library"
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
      path: "/archive", 
      label: "Portfolio", 
      icon: Archive,
      description: "View your archived content portfolio"
    },
    { 
      path: "/calendar", 
      label: "Planner", 
      icon: CalendarIcon,
      description: "Schedule and plan your content calendar"
    },
    { 
      path: "/settings", 
      label: "Settings", 
      icon: Settings,
      description: "Manage collections, week names, and brand preferences"
    },
  ];

  return (
    <nav className="border-b border-aged-brass/15 bg-[hsl(var(--ink-black))] sticky top-0 z-50 shadow-level-2">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/logo.png" 
              alt="Scriptora - Brand Intelligence" 
              className="h-16 w-auto transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:drop-shadow-lg"
              onError={(e) => {
                console.error('Logo failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {user && (
              <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          aria-label={`Navigate to ${item.label}`}
                          aria-current={isActive ? "page" : undefined}
                          className={`
                            inline-flex items-center gap-2 px-3 md:px-5 py-3 md:py-4 rounded-md transition-all duration-300
                            ${
                              isActive
                                ? "bg-aged-brass/12 text-parchment-white font-medium shadow-sm border-b-2 border-aged-brass"
                                : "text-parchment-white/70 hover:text-aged-brass hover:bg-aged-brass/8 hover:shadow-sm hover:-translate-y-0.5"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                          <span className="text-sm md:text-base">{item.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </nav>
            )}
            
            {user && (
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="gap-2 ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
