// ═══════════════════════════════════════════════════════════════════════════════
// THE VAULT - Premium DAM Access Widget
// Vintage safe/vault aesthetic inspired by old-world craftsmanship
// ═══════════════════════════════════════════════════════════════════════════════

import { NavLink } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface TheVaultProps {
  isActive: boolean;
  onNavigate?: () => void;
}

// Custom Vault/Safe Icon - Vintage keyhole design
function VaultIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer vault door frame */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Inner decorative border */}
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="1"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="2 1"
        fill="none"
        opacity="0.5"
      />
      {/* Keyhole - classic vintage shape */}
      <circle
        cx="12"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M12 12.5V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Decorative rivets */}
      <circle cx="6" cy="6" r="0.75" fill="currentColor" opacity="0.6" />
      <circle cx="18" cy="6" r="0.75" fill="currentColor" opacity="0.6" />
      <circle cx="6" cy="18" r="0.75" fill="currentColor" opacity="0.6" />
      <circle cx="18" cy="18" r="0.75" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function TheVault({ isActive, onNavigate }: TheVaultProps) {
  const { open } = useSidebar();

  return (
    <NavLink
      to="/dam"
      onClick={onNavigate}
      className="block"
    >
      <div
        className={cn(
          // Base styles - square-ish proportions
          "relative overflow-hidden rounded-lg transition-all duration-300",
          "border",
          // Expanded state
          open ? "p-4" : "p-2",
          // Active state - brass glow
          isActive
            ? "bg-gradient-to-br from-[hsl(38,33%,20%)] via-[hsl(38,33%,15%)] to-[hsl(38,33%,10%)] border-[hsl(38,33%,56%)]/50 shadow-[0_0_20px_rgba(184,149,106,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]"
            : "bg-gradient-to-br from-[#1a1918] via-[#141312] to-[#0f0e0d] border-white/10 hover:border-[hsl(38,33%,56%)]/40 hover:shadow-[0_0_15px_rgba(184,149,106,0.1)]",
          // Subtle texture overlay
          "before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9InRyYW5zcGFyZW50Ii8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIvPjwvc3ZnPg==')] before:opacity-50 before:pointer-events-none"
        )}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[hsl(38,33%,56%)]/30 rounded-tl-sm" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[hsl(38,33%,56%)]/30 rounded-tr-sm" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[hsl(38,33%,56%)]/30 rounded-bl-sm" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[hsl(38,33%,56%)]/30 rounded-br-sm" />

        <div className={cn(
          "relative z-10 flex",
          open ? "flex-col items-center gap-3" : "justify-center"
        )}>
          {/* Vault Icon Container */}
          <div
            className={cn(
              "relative flex items-center justify-center rounded-lg transition-all duration-300",
              // Size based on sidebar state
              open ? "w-12 h-12" : "w-8 h-8",
              // Styling
              isActive
                ? "bg-[hsl(38,33%,56%)]/20 ring-1 ring-[hsl(38,33%,56%)]/40"
                : "bg-white/5 group-hover:bg-[hsl(38,33%,56%)]/10",
              // Inner shadow for depth
              "shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
            )}
          >
            <VaultIcon
              className={cn(
                "transition-all duration-300",
                open ? "w-7 h-7" : "w-5 h-5",
                isActive
                  ? "text-[hsl(38,33%,56%)]"
                  : "text-white/60 group-hover:text-[hsl(38,33%,56%)]"
              )}
            />
            
            {/* Subtle shine effect on icon */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg pointer-events-none" />
          </div>

          {/* Text - only when expanded */}
          {open && (
            <div className="text-center">
              <h3
                className={cn(
                  "font-serif font-semibold tracking-wide text-sm transition-colors duration-200",
                  isActive
                    ? "text-[hsl(38,33%,56%)]"
                    : "text-white/90"
                )}
              >
                The Vault
              </h3>
              <p className="text-[10px] text-white/40 font-medium tracking-wider uppercase mt-0.5">
                Asset Library
              </p>
            </div>
          )}
        </div>

        {/* Bottom decorative line */}
        {open && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-px bg-gradient-to-r from-transparent via-[hsl(38,33%,56%)]/30 to-transparent" />
        )}
      </div>
    </NavLink>
  );
}

export default TheVault;

