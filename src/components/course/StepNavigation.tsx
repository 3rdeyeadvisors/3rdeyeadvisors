import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: string;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepChange: (stepId: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onMarkComplete: () => void;
  isAuthenticated: boolean;
}

export const StepNavigation = ({
  steps,
  currentStep,
  completedSteps,
  onStepChange,
  onPrevious,
  onNext,
  onMarkComplete,
  isAuthenticated
}: StepNavigationProps) => {
  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isCurrentStepCompleted = isStepCompleted(currentStep);
  const isLastStep = currentStep === steps.length;

  return (
    <div className="space-y-4">
      {/* Step List - Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-2 min-w-max md:grid md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => {
            const StepIcon = step.icon;
            const current = step.id === currentStep;
            const completed = isStepCompleted(step.id);

            return (
              <Button
                key={step.id}
                variant={current ? "default" : completed ? "secondary" : "outline"}
                onClick={() => onStepChange(step.id)}
                className={`
                  justify-start gap-2 min-w-[200px] md:min-w-0 font-body text-xs uppercase tracking-widest rounded-xl px-4 py-3
                  ${completed ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30" : "bg-white/5 border-white/10 text-white/70 hover:text-white"}
                  ${current ? "bg-violet-600 text-white border-violet-600 ring-0" : ""}
                `}
                disabled={!isAuthenticated && step.id !== 1}
              >
                <StepIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">{step.title}</span>
                {completed && <CheckCircle className="h-4 w-4 shrink-0" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center pt-6 border-t border-white/5">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1 || !isAuthenticated}
          className="font-body text-xs uppercase tracking-widest border-white/10 text-white hover:bg-white/5 rounded-xl px-6 py-4 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous Step
        </Button>

        <div className="flex gap-3 flex-col sm:flex-row">
          {!isCurrentStepCompleted && (
            <Button
              onClick={onMarkComplete}
              disabled={!isAuthenticated}
              className="font-body text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 py-4 w-full sm:w-auto"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}

          <Button
            onClick={onNext}
            disabled={!isAuthenticated}
            className="font-body text-xs uppercase tracking-widest bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 py-4 w-full sm:w-auto"
          >
            {isLastStep ? "Complete Tutorial" : "Next Step"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Completion Badge for Current Step */}
      {isCurrentStepCompleted && (
        <div className="flex items-center justify-center gap-2 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="font-body text-sm font-medium text-emerald-400">This step is completed</span>
        </div>
      )}
    </div>
  );
};