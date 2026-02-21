import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TutorialHeaderProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}

export const TutorialHeader = ({
  title,
  icon: Icon,
  difficulty,
  duration,
  currentStep,
  totalSteps,
  completedSteps
}: TutorialHeaderProps) => {
  const navigate = useNavigate();
  const progress = (completedSteps.length / totalSteps) * 100;

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner":
        return "bg-awareness/20 text-awareness border-awareness/30";
      case "Intermediate":
        return "bg-accent/20 text-accent border-accent/30";
      case "Advanced":
        return "bg-primary-glow/20 text-primary-glow border-primary-glow/30";
      default:
        return "bg-white/3 text-white/50 border-white/8";
    }
  };

  return (
    <div className="mb-6 md:mb-8">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate("/tutorials")}
        className="mb-4 md:mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tutorials
      </Button>

      {/* Header Card */}
      <div className="bg-white/3 border border-white/8 rounded-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={getDifficultyColor(difficulty)} variant="outline">
                  {difficulty}
                </Badge>
                <span className="text-sm text-white/50">• {duration}</span>
                <span className="text-sm text-white/50">
                  • Step {currentStep} of {totalSteps}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Progress</span>
            <span className="font-medium text-foreground">
              {completedSteps.length}/{totalSteps} steps completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
};