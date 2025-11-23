import { createPortal } from "react-dom";
import { useState, useEffect } from 'react';

const MadisonStudioLoadingAnimation = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [dots, setDots] = useState('');

  // Editorial loading phases
  const phases = [
    "Consulting the archives...",
    "Reviewing brand guidelines...",
    "Crafting your narrative...",
    "Refining the prose...",
    "Adding final flourishes...",
    "Nearly complete..."
  ];

  // Cycle through phases
  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % phases.length);
    }, 4000);

    return () => clearInterval(phaseInterval);
  }, []);

  // Animated dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-vellum overflow-hidden">
      {/* Subtle paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(45deg, transparent 48%, rgba(184, 149, 106, 0.03) 50%, transparent 52%),
                           linear-gradient(-45deg, transparent 48%, rgba(184, 149, 106, 0.03) 50%, transparent 52%)`,
          backgroundSize: '8px 8px'
        }}
      />

      <div className="relative z-10 text-center max-w-2xl px-8">
        {/* Animated brass sparkle icon - matching original */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative w-20 h-20">
            {/* Rotating outer ring */}
            <svg 
              className="absolute inset-0 w-20 h-20 animate-spin-slow"
              viewBox="0 0 100 100"
              style={{ animationDuration: '8s' }}
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--aged-brass-hex)"
                strokeWidth="2"
                strokeDasharray="10 5"
                opacity="0.3"
              />
            </svg>

            {/* Center sparkle - pulsing (matches your original icon) */}
            <svg 
              className="absolute inset-0 w-20 h-20 animate-pulse"
              viewBox="0 0 100 100"
            >
              {/* Four-point star */}
              <path
                d="M50 20 L55 45 L80 50 L55 55 L50 80 L45 55 L20 50 L45 45 Z"
                fill="var(--aged-brass-hex)"
                opacity="0.9"
              />
              {/* Small accent sparkles */}
              <circle cx="50" cy="15" r="2" fill="var(--aged-brass-hex)" opacity="0.7" />
              <circle cx="85" cy="50" r="2" fill="var(--aged-brass-hex)" opacity="0.7" />
              <circle cx="50" cy="85" r="2" fill="var(--aged-brass-hex)" opacity="0.7" />
              <circle cx="15" cy="50" r="2" fill="var(--aged-brass-hex)" opacity="0.7" />
            </svg>
          </div>
        </div>

        {/* Main heading - matching original format */}
        <h1 
          className="text-5xl mb-6 tracking-tight"
          style={{ 
            fontFamily: 'Georgia, serif',
            fontWeight: 400,
            color: '#2F2A26'
          }}
        >
          Generating your content{dots}
        </h1>

        {/* Subtext - matching original */}
        <p 
          className="text-xl mb-12"
          style={{ color: '#6B6560' }}
        >
          This usually takes 20-30 seconds
        </p>

        {/* Phase indicator with fade transition - clean, no divider */}
        <div className="min-h-[32px] mb-8">
          <p 
            key={currentPhase}
            className="text-brand-charcoal/60 italic text-lg animate-fade-in"
            style={{ fontFamily: 'Crimson Text, serif' }}
          >
            {phases[currentPhase]}
          </p>
        </div>

        {/* Progress indicator dots */}
        <div className="flex justify-center gap-2 mt-8">
          {phases.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentPhase 
                  ? 'w-8 bg-brand-brass' 
                  : 'w-1.5 bg-brand-stone'
              }`}
            />
          ))}
        </div>

        {/* Floating manuscript pages animation (subtle background) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 30}%`,
                animation: `float ${8 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 2}s`
              }}
            >
              <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
                <rect 
                  width="40" 
                  height="50" 
                  fill="var(--aged-brass-hex)" 
                  opacity="0.2"
                  rx="2"
                />
                <line x1="8" y1="12" x2="32" y2="12" stroke="var(--aged-brass-hex)" strokeWidth="1" opacity="0.3" />
                <line x1="8" y1="18" x2="32" y2="18" stroke="var(--aged-brass-hex)" strokeWidth="1" opacity="0.3" />
                <line x1="8" y1="24" x2="28" y2="24" stroke="var(--aged-brass-hex)" strokeWidth="1" opacity="0.3" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes fade-in {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0) rotate(-2deg);
            opacity: 0.1;
          }
          50% { 
            transform: translateY(-100px) rotate(2deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default MadisonStudioLoadingAnimation;
