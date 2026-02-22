import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DataPoint {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface BlogDataPointsProps {
  title?: string;
  points: DataPoint[];
}

const BlogDataPoints: React.FC<BlogDataPointsProps> = ({ 
  title = "Key Data Points",
  points 
}) => {
  return (
    <div className="bg-white/5 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {points.map((point, index) => {
          const Icon = point.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground/60">{point.label}</p>
                <p className="font-semibold text-foreground">{point.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogDataPoints;
