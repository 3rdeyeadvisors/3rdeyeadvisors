import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Source {
  name: string;
  url: string;
}

interface BlogSourcesProps {
  sources: Source[];
}

const BlogSources: React.FC<BlogSourcesProps> = ({ sources }) => {
  return (
    <div className="bg-white/5 rounded-lg p-6 mb-8">
      <h4 className="font-semibold text-foreground mb-3">Data Sources</h4>
      <div className="flex flex-wrap gap-4">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{source.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BlogSources;
