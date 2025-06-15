
import React, { useEffect, useState } from 'react';
import { PlusCircle, Coins } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import LevelUpDialog from '@/components/LevelUpDialog';
import Confetti from 'react-confetti';
import { Link } from 'react-router-dom';

const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  const { stats, levelUpData, clearLevelUpData } = usePlayer();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.style.removeProperty('--mouse-x');
      document.documentElement.style.removeProperty('--mouse-y');
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-background text-foreground relative overflow-hidden"
    >
      {levelUpData && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} tweenDuration={10000} />}
      {/* Spotlight Effect */}
      <div 
        className="pointer-events-none fixed inset-0 z-[3] transition duration-300"
        style={{
          background: 'radial-gradient(600px at var(--mouse-x) var(--mouse-y), rgba(138, 43, 226, 0.3), transparent 80%)'
        }}
      ></div>
      
      {/* Shadow Gate Portal */}
      <div className="shadow-gate-portal"></div>
      <div className="blue-flow-border"></div>
      
      <div className="min-h-screen bg-black/70 backdrop-blur-sm relative z-10">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-400/20 border border-yellow-500/30 shadow-lg p-2 rounded-lg text-white">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-lg">{stats.coins}</span>
          </div>

          {stats.statPointsToAllocate > 0 && (
            <Link to="/stats">
              <div className="flex items-center gap-2 bg-primary/80 border border-primary/30 shadow-lg p-2 rounded-lg text-primary-foreground animate-pulse-strong cursor-pointer hover:bg-primary">
                <PlusCircle className="w-5 h-5" />
                <span className="font-bold text-lg">{stats.statPointsToAllocate}</span>
              </div>
            </Link>
          )}
        </div>
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
      <LevelUpDialog
        isOpen={!!levelUpData}
        onClose={clearLevelUpData}
        levelUpInfo={levelUpData}
      />
    </div>
  );
};

export default SharedLayout;
