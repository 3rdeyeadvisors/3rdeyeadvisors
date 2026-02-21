import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StepBlockProps {
  steps: string[];
  title?: string;
}

export const StepBlock = ({ steps, title }: StepBlockProps) => {
  return (
    <Card className="border-muted bg-white/3 w-full">
      <CardContent className="px-4 py-4 sm:px-6 sm:py-5 space-y-3">
        {title && <h4 className="font-semibold mb-3 text-sm sm:text-base break-words">{title}</h4>}
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3 items-start">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 min-w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {index + 1}
              </span>
              <span className="flex-1 pt-0.5 text-foreground text-sm sm:text-base break-words leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
