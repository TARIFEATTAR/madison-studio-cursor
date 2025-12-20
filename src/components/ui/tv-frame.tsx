/**
 * TVFrame - Vintage wooden TV frame component
 * Creates an old-school TV cabinet with CRT screen effects
 */

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface TVFrameProps {
  children: React.ReactNode;
  className?: string;
  meetingId?: string;
  meetingUrl?: string;
  onJoinClick?: () => void;
}

export function TVFrame({ 
  children, 
  className, 
  meetingId,
  meetingUrl,
  onJoinClick 
}: TVFrameProps) {
  return (
    <div className={cn("relative group w-full", className)}>
      {/* --- TV CABINET CONTAINER --- */}
      <div 
        className="relative bg-[#5D4037] rounded-3xl p-4 md:p-6 shadow-2xl border-b-8 border-r-8 border-[#3E2723] transform transition-transform hover:scale-[1.01]"
        style={{
          boxShadow: `
            0 8px 16px rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {/* Wood Grain Texture Simulation */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none rounded-3xl" 
          style={{ 
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 12px)' 
          }}
        />

        {/* --- TV FACE --- */}
        <div 
          className="flex gap-3 md:gap-4 h-48 md:h-64 bg-[#D7CCC8] rounded-xl p-2 md:p-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] border-4 border-[#A1887F]"
        >
          {/* --- THE SCREEN (CRT) --- */}
          <div 
            className="flex-1 relative bg-[#1a1a1a] rounded-[2rem] border-6 md:border-8 border-[#cfd8dc] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
          >
            {/* Screen Content */}
            <div className="absolute inset-0 z-0">
              {children}
            </div>

            {/* "Channel" Display (Meeting ID) */}
            {meetingId && (
              <div 
                className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/40 backdrop-blur-sm px-2 md:px-3 py-1 rounded font-mono text-[10px] md:text-xs text-green-400 border border-green-900/50 shadow-lg font-bold tracking-widest uppercase z-30"
              >
                CH: {meetingId}
              </div>
            )}

            {/* CRT Effects: Scanlines & Vignette */}
            <div 
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: `
                  linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%),
                  linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))
                `,
                backgroundSize: '100% 4px, 3px 100%',
              }}
            />
            <div 
              className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] z-20 rounded-[1.5rem]" 
            />
            
            {/* Screen Glare */}
            <div 
              className="absolute top-2 md:top-4 left-4 md:left-8 w-16 md:w-24 h-8 md:h-12 bg-white opacity-10 rounded-[50%] blur-xl transform -rotate-12 pointer-events-none z-30" 
            />
          </div>

          {/* --- CONTROL PANEL (Side) --- */}
          <div className="w-16 md:w-24 flex flex-col items-center justify-between py-2 flex-shrink-0">
            {/* Brand/Logo Area */}
            <div className="text-[0.5rem] md:text-[0.6rem] font-black tracking-widest text-[#5D4037] opacity-60 uppercase text-center leading-tight">
              Madison<br/>Vision
            </div>

            {/* Tuning Knobs */}
            <div className="space-y-3 md:space-y-4">
              <div 
                className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#3E2723] flex items-center justify-center transform rotate-45 cursor-pointer hover:rotate-90 transition-transform"
                style={{
                  boxShadow: `
                    2px 4px 6px rgba(0, 0, 0, 0.4),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                <div className="w-1 h-4 md:h-6 bg-[#8D6E63] rounded-full"></div>
              </div>
              <div 
                className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#3E2723] flex items-center justify-center transform -rotate-12 cursor-pointer hover:-rotate-45 transition-transform"
                style={{
                  boxShadow: `
                    2px 4px 6px rgba(0, 0, 0, 0.4),
                    inset 2px 2px 4px rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                <div className="w-1 h-4 md:h-6 bg-[#8D6E63] rounded-full"></div>
              </div>
            </div>

            {/* Speaker Grille */}
            <div className="w-full px-2 space-y-1 opacity-40">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-0.5 w-full bg-[#3E2723] rounded-full"
                />
              ))}
            </div>

            {/* The "Join" Button (Styled as Power/Channel Button) */}
            {meetingUrl && onJoinClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onJoinClick();
                }}
                className="group/btn relative w-full"
                title="Open in new tab"
              >
                <div 
                  className="w-12 h-8 md:w-16 md:h-10 mx-auto bg-[#c62828] rounded-lg active:shadow-none active:translate-y-[4px] transition-all flex items-center justify-center border-t border-white/20 cursor-pointer"
                  style={{
                    boxShadow: `
                      0 4px 0 #8e0000,
                      0 5px 5px rgba(0, 0, 0, 0.3)
                    `,
                  }}
                >
                  <span className="text-[8px] md:text-[10px] font-bold text-white uppercase tracking-wider">
                    Join
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3 text-white ml-1 opacity-80" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* --- LEGS / STAND (Visual Flourish) --- */}
        <div 
          className="absolute -bottom-2 md:-bottom-3 left-6 md:left-8 w-3 md:w-4 h-4 md:h-6 bg-[#3E2723] -z-10"
          style={{ transform: 'skewX(10deg)' }}
        />
        <div 
          className="absolute -bottom-2 md:-bottom-3 right-6 md:right-8 w-3 md:w-4 h-4 md:h-6 bg-[#3E2723] -z-10"
          style={{ transform: 'skewX(-10deg)' }}
        />
      </div>
    </div>
  );
}

