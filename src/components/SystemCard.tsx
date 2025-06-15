
import React from 'react';
import { Link } from 'react-router-dom';
import HoverTiltWrapper from './HoverTiltWrapper';

interface SystemCardProps {
  icon: React.ElementType;
  title: string;
  url: string;
}

const SystemCard: React.FC<SystemCardProps> = ({ icon: Icon, title, url }) => {
  return (
    <Link to={url} className="no-underline h-full">
      <HoverTiltWrapper className="system-card h-full cursor-pointer">
        <div className="system-card-inner">
          <Icon className="w-8 h-8 text-primary" />
          <p className="font-semibold text-center">{title}</p>
        </div>
      </HoverTiltWrapper>
    </Link>
  );
};

export default SystemCard;
