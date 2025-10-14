import madisonLogo from "@/assets/madison-script-logo.png";

export const DesktopHeader = () => {
  return (
    <>
      {/* Gradient Overlay - Desktop Only */}
      <div className="hidden md:block fixed inset-x-0 top-0 h-64 pointer-events-none z-10">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)'
          }}
        />
      </div>

      {/* Transparent Header - Desktop Only */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-20 h-16">
        <div className="flex items-center h-full px-6">
          <img 
            src={madisonLogo} 
            alt="Madison Script" 
            className="h-12 w-auto"
            style={{ imageRendering: '-webkit-optimize-contrast' }}
          />
        </div>
      </header>
    </>
  );
};
