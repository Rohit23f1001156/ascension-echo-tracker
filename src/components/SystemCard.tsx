
import React from 'react';
import { Link } from 'react-router-dom';
import HoverTiltWrapper from './HoverTiltWrapper';
import { cn } from '@/lib/utils';

interface SystemCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ElementType;
  title: string;
  url?: string;
}

const SystemCard = React.forwardRef<HTMLDivElement, SystemCardProps>(
  ({ icon: Icon, title, url, className, ...props }, ref) => {
    const cardContent = (
      <HoverTiltWrapper className="system-card h-full">
        <div className="system-card-inner">
          <Icon className="w-8 h-8 text-primary" />
          <p className="font-semibold text-center font-serif">{title}</p>
        </div>
      </HoverTiltWrapper>
    );

    if (url) {
      return (
        <Link to={url} className={cn('no-underline h-full', className)}>
          {cardContent}
        </Link>
      );
    }

    return (
      <div ref={ref} className={cn('h-full cursor-pointer', className)} {...props}>
        {cardContent}
      </div>
    );
  }
);
SystemCard.displayName = 'SystemCard';

export default SystemCard;
