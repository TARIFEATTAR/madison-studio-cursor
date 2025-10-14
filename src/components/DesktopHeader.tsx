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
    </>
  );
};
