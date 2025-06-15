
import React from 'react';

const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="min-h-screen bg-background text-foreground relative overflow-hidden"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1593481194348-912154a9c3b8?q=80&w=2592&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
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
