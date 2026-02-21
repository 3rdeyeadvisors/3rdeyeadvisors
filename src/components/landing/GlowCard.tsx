import { ReactNode, useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'primary' | 'accent' | 'awareness';
  delay?: number;
  isVisible?: boolean;
}

const GlowCard = ({ 
  children, 
  className, 
  glowColor = 'primary',
  delay = 0,
  isVisible = true
}: GlowCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const glowColors = {
    primary: 'hsl(var(--primary))',
    accent: 'hsl(var(--accent))',
    awareness: 'hsl(var(--awareness))',
  };

  return (
    <div
      className={cn(
        'relative group transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColors[glowColor]}20, transparent 40%)`
            : 'none',
        }}
      />
      
      {/* Border glow */}
      <div 
        className="absolute -inset-[1px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${glowColors[glowColor]}40, transparent, ${glowColors[glowColor]}40)`,
        }}
      />
      
      <Card className="relative bg-card/80 backdrop-blur-sm border-white/8 hover:border-primary/30 transition-all duration-300 h-full">
        {children}
      </Card>
    </div>
  );
};

export default GlowCard;
