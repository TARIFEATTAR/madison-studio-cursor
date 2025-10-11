import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Archive, Calendar as CalendarIcon, LogOut, Repeat, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      path: "/library", 
      label: "Library", 
      icon: Archive,
      description: "Browse and manage your content library"
    },
    { 
      path: "/templates", 
      label: "Templates", 
      icon: BookOpen,
      description: "Your collection of saved templates"
    },
    { 
      path: "/create", 
      label: "Create", 
      icon: Sparkles,
      description: "Generate new content with AI assistance"
    },
    { 
      path: "/multiply", 
      label: "Multiply", 
      icon: Repeat,
      description: "Repurpose content for different platforms"
    },
    { 
      path: "/schedule", 
      label: "Schedule", 
      icon: CalendarIcon,
      description: "Schedule and plan your content calendar"
    },
    { 
      path: "/settings", 
      label: "Settings", 
      icon: Settings,
      description: "Manage your brand guidelines and preferences"
    },
  ];

  return (
    <nav className="border-b border-aged-brass/15 bg-[hsl(var(--ink-black))] sticky top-0 z-50 shadow-level-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/logo.png" 
              alt="Scriptora - Editorial Intelligence" 
              className="h-24 md:h-32 w-auto transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:drop-shadow-lg"
              onError={(e) => {
                console.error('Logo failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
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
                <span>Sign Out</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          {user && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden text-parchment-white hover:text-aged-brass"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[280px] sm:w-[320px] bg-[hsl(var(--ink-black))] border-l border-aged-brass/20"
              >
                <div className="flex flex-col h-full py-6">
                  <nav className="flex flex-col gap-2 flex-1" role="navigation" aria-label="Mobile navigation">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-label={`Navigate to ${item.label}`}
                          aria-current={isActive ? "page" : undefined}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                            ${
                              isActive
                                ? "bg-aged-brass/12 text-parchment-white font-medium border-l-4 border-aged-brass"
                                : "text-parchment-white/70 hover:text-aged-brass hover:bg-aged-brass/8"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                          <div className="flex flex-col">
                            <span className="text-base">{item.label}</span>
                            <span className="text-xs text-parchment-white/50">{item.description}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </nav>

                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    variant="outline"
                    className="w-full gap-2 mt-4 border-aged-brass/30 text-parchment-white hover:bg-aged-brass/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
