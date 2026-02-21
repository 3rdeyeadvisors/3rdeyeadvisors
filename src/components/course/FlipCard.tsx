import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCw } from "lucide-react";

interface FlipCardProps {
  front: string;
  back: string;
}

export const FlipCard = ({ front, back }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all min-h-[140px] relative border-muted"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <CardContent className="px-4 py-4 sm:px-6 sm:py-5 flex flex-col items-center justify-center text-center min-h-[140px]">
        {!isFlipped ? (
          <>
            <p className="font-semibold text-foreground text-sm sm:text-base mb-3 break-words">{front}</p>
            <RotateCw className="h-4 w-4 text-white/50 mt-2" />
            <p className="text-xs text-white/50 mt-1">Click to reveal</p>
          </>
        ) : (
          <>
            <p className="text-foreground text-sm sm:text-base mb-3 break-words leading-relaxed">{back}</p>
            <RotateCw className="h-4 w-4 text-white/50 mt-2" />
            <p className="text-xs text-white/50 mt-1">Click to flip back</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
