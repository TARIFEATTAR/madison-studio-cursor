import { useState } from "react";
import { Plus, PenLine, Repeat, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FABActionProps {
  icon: React.ReactNode;
  label: string;
  route: string;
  onClick: () => void;
}

function FABAction({ icon, label, route, onClick }: FABActionProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        navigate(route);
        onClick();
      }}
      className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#E0E0E0] shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[48px]"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8956A] flex items-center justify-center text-white shadow-md">
        {icon}
      </div>
      <span className="text-sm font-medium text-[#333333] whitespace-nowrap">{label}</span>
    </button>
  );
}

export function FABMenu() {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { icon: <PenLine className="w-5 h-5" />, label: "Create Content", route: "/create" },
    { icon: <Repeat className="w-5 h-5" />, label: "Multiply", route: "/multiply" },
    { icon: <Image className="w-5 h-5" />, label: "Image Studio", route: "/image-studio" },
  ];

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998] md:hidden animate-fade-in"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* FAB Actions */}
      {isExpanded && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-3 animate-scale-in md:hidden">
          {actions.map((action) => (
            <FABAction
              key={action.route}
              icon={action.icon}
              label={action.label}
              route={action.route}
              onClick={() => setIsExpanded(false)}
            />
          ))}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] md:hidden",
          "w-14 h-14 rounded-full shadow-lg hover:shadow-xl",
          "bg-gradient-to-br from-[#D4AF37] to-[#B8956A]",
          "flex items-center justify-center text-white",
          "transition-all duration-300 active:scale-95",
          isExpanded && "rotate-45"
        )}
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}
