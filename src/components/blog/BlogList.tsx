import React from 'react';

interface BlogListItem {
  label: string;
  description: string;
}

interface BlogListProps {
  items: BlogListItem[];
}

const BlogList: React.FC<BlogListProps> = ({ items }) => {
  return (
    <div className="bg-white/5 rounded-lg p-6 mb-6">
      <ul className="space-y-3 text-foreground/90">
        {items.map((item, index) => (
          <li key={index}>
            <strong className="text-foreground">{item.label}:</strong> {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogList;
