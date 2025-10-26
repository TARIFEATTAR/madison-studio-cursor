import { Home, Library, Calendar, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  route: string;
  isActive: boolean;
}

function NavItem({ icon, label, route, isActive }: NavItemProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(route)}
      className={cn(
        "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200",
        "active:scale-95 min-w-[48px] min-h-[48px]",
        isActive ? "text-[#D4AF37]" : "text-[#666666] hover:text-[#333333]"
      )}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: "Home", route: "/" },
    { icon: <Library className="w-5 h-5" />, label: "Library", route: "/library" },
    { icon: null, label: "", route: "" }, // Spacer for FAB
    { icon: <Calendar className="w-5 h-5" />, label: "Schedule", route: "/schedule" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", route: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[900] bg-white border-t border-[#E0E0E0] safe-area-inset-bottom md:hidden">
      <div className="flex items-center justify-around px-2" style={{ height: "60px" }}>
        {navItems.map((item, index) => {
          if (item.icon === null) {
            return <div key={index} className="flex-1" />; // Spacer for FAB
          }
          return (
            <NavItem
              key={item.route}
              icon={item.icon}
              label={item.label}
              route={item.route}
              isActive={location.pathname === item.route}
            />
          );
        })}
      </div>
    </nav>
  );
}
