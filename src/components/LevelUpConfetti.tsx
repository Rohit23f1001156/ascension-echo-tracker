
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { usePlayer } from '@/context/PlayerContext';

const LevelUpConfetti: React.FC = () => {
  const { levelUpAnimation } = usePlayer();
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!levelUpAnimation) return null;

  return (
    <Confetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      recycle={false}
      numberOfPieces={200}
      colors={['#9333ea', '#a855f7', '#c084fc', '#e879f9', '#fbbf24']}
      gravity={0.3}
    />
  );
};

export default LevelUpConfetti;
