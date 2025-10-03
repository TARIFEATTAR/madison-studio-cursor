import { Link, useLocation } from "react-router-dom";
import { BookOpen, Sparkles, Archive, Calendar as CalendarIcon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: "/", label: "The Reservoir", icon: BookOpen },
    { path: "/forge", label: "The Forge", icon: Sparkles },
    { path: "/archive", label: "The Archive", icon: Archive },
    { path: "/calendar", label: "The Calendar", icon: CalendarIcon },
  ];

  return (
    <nav className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md bg-saffron-gold/20 flex items-center justify-center border border-saffron-gold/30 group-hover:bg-saffron-gold/30 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5">
              <BookOpen className="w-5 h-5 text-saffron-gold transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="font-serif text-2xl text-foreground tracking-wide">
              The Codex
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300
                        ${
                          isActive
                            ? "bg-saffron-gold/20 text-saffron-gold font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm hover:-translate-y-0.5"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden md:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {user && (
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="gap-2 ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Depart</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
