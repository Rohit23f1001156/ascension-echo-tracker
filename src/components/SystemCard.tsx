
import React, { useRef, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

interface SystemCardProps {
  icon: React.ElementType;
  title: string;
  url: string;
}

const SystemCard: React.FC<SystemCardProps> = ({ icon: Icon, title, url }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = (y / height - 0.5) * -25;
    const rotateY = (x / width - 0.5) * 25;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
  };

  return (
    <Link to={url} className="no-underline">
      <div
        ref={cardRef}
        className="system-card h-full cursor-pointer"
        style={{ transition: 'transform 0.1s ease', willChange: 'transform' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="system-card-inner">
          <Icon className="w-8 h-8 text-primary" />
          <p className="font-semibold text-center">{title}</p>
        </div>
      </div>
    </Link>
  );
};

export default SystemCard;
