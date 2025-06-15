
import React from 'react';

const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="min-h-screen bg-background text-foreground relative overflow-hidden"
    >
      <div className="purple-aura-1"></div>
      <div className="purple-aura-2"></div>
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
