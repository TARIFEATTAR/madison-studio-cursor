import { Link, useLocation } from "react-router-dom";
import { BookOpen, Sparkles, Archive, Calendar as CalendarIcon } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "The Reservoir", icon: BookOpen },
    { path: "/forge", label: "The Forge", icon: Sparkles },
    { path: "/archive", label: "The Archive", icon: Archive },
    { path: "/calendar", label: "The Calendar", icon: CalendarIcon },
  ];

  return (
    <nav className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md bg-saffron-gold/20 flex items-center justify-center border border-saffron-gold/30 group-hover:bg-saffron-gold/30 transition-colors">
              <BookOpen className="w-5 h-5 text-saffron-gold" />
            </div>
            <span className="font-serif text-2xl text-foreground tracking-wide">
              The Codex
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md transition-all
                    ${
                      isActive
                        ? "bg-saffron-gold/20 text-saffron-gold font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
