import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";

interface TermDefinitionProps {
  term: string;
  definition: string;
}

export const TermDefinition: React.FC<TermDefinitionProps> = ({ term, definition }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="cursor-help border-b border-dotted border-primary text-primary hover:text-primary-glow transition-colors inline-flex items-center gap-1 font-medium">
          {term}
          <Info className="w-3 h-3 opacity-70" />
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-white/3 border-white/8 shadow-xl z-[10001]">
        <div className="space-y-2">
          <h4 className="font-consciousness font-bold text-primary">{term}</h4>
          <p className="text-sm text-foreground/90 leading-relaxed">
            {definition}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
