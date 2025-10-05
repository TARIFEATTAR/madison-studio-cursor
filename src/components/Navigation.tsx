import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Archive, Calendar as CalendarIcon, LogOut, Repeat } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: "/", label: "Library", icon: BookOpen },
    { path: "/forge", label: "Composer", icon: Sparkles },
    { path: "/repurpose", label: "Amplify", icon: Repeat },
    { path: "/archive", label: "Portfolio", icon: Archive },
    { path: "/calendar", label: "Planner", icon: CalendarIcon },
  ];

  return (
    <nav className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md bg-saffron-gold/20 flex items-center justify-center border border-saffron-gold/30 group-hover:bg-saffron-gold/30 transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5">
              <BookOpen className="w-5 h-5 text-saffron-gold transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="font-serif text-2xl text-foreground tracking-wide">
              Scriptorium
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
                    <button
                      key={item.path}
                      type="button"
                      aria-label={item.label}
                      onClick={() => navigate(item.path)}
                      className={`
                        inline-flex items-center gap-2 px-5 py-4 rounded-md transition-all duration-300
                        ${
                          isActive
                            ? "bg-saffron-gold/20 text-saffron-gold font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm hover:-translate-y-0.5"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden md:inline">{item.label}</span>
                    </button>
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
