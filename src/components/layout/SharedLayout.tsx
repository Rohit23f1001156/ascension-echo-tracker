import React, { useEffect } from 'react';

const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.style.removeProperty('--mouse-x');
      document.documentElement.style.removeProperty('--mouse-y');
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-background text-foreground relative overflow-hidden"
    >
      {/* Spotlight Effect */}
      <div 
        className="pointer-events-none fixed inset-0 z-[3] transition duration-300"
        style={{
          background: 'radial-gradient(600px at var(--mouse-x) var(--mouse-y), rgba(138, 43, 226, 0.3), transparent 80%)'
        }}
      ></div>
      
      {/* Enhanced Auras */}
      <div className="purple-aura-1"></div>
      <div className="purple-aura-2"></div>
      <div className="central-aura"></div>
      <div className="blue-flow-border"></div>
      
      <div className="min-h-screen bg-black/70 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SharedLayout;
