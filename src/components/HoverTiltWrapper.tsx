
import React, { useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface HoverTiltWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const HoverTiltWrapper: React.FC<HoverTiltWrapperProps> = ({ children, className }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = (y / height - 0.5) * -20;
    const rotateY = (x / width - 0.5) * 20;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
  };

  return (
    <div
      ref={cardRef}
      className={cn(className)}
      style={{ transition: 'transform 0.1s ease', willChange: 'transform' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default HoverTiltWrapper;
