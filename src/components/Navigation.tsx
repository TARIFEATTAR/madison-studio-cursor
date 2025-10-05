import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Archive, Calendar as CalendarIcon, LogOut, Repeat } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: "/library", label: "Library", icon: BookOpen },
    { path: "/forge", label: "Composer", icon: Sparkles },
    { path: "/repurpose", label: "Amplify", icon: Repeat },
    { path: "/archive", label: "Portfolio", icon: Archive },
    { path: "/calendar", label: "Planner", icon: CalendarIcon },
  ];

  return (
    <nav className="border-b border-aged-brass/15 bg-[hsl(var(--ink-black))] sticky top-0 z-50 shadow-level-2">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/logo.png" 
              alt="Scriptorium - Brand Intelligence" 
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
                            ? "bg-aged-brass/12 text-parchment-white font-medium shadow-sm border-b-2 border-aged-brass"
                            : "text-parchment-white/70 hover:text-aged-brass hover:bg-aged-brass/8 hover:shadow-sm hover:-translate-y-0.5"
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
