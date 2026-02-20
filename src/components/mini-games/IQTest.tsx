import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Award, Share2, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { shareResultsViaEmail } from '@/lib/email';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';
import { toast } from 'sonner';

interface IQQuestion {
  id: number;
  type: 'pattern' | 'logic' | 'math' | 'spatial';
  question: string;
  image?: string;
  options: string[];
  correct: number;
}

const QUESTIONS: IQQuestion[] = [
  {
    id: 1,
    type: 'logic',
    question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies.",
    options: ["True", "False"],
    correct: 0
  },
  {
    id: 2,
    type: 'math',
    question: "Which number comes next in the sequence: 2, 4, 8, 16, 32, ...",
    options: ["48", "64", "128", "40"],
    correct: 1
  },
  {
    id: 3,
    type: 'pattern',
    question: "Book is to Reading as Fork is to...",
    options: ["Drawing", "Eating", "Writing", "Stirring"],
    correct: 1
  },
  {
    id: 4,
    type: 'math',
    question: "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: ["100 minutes", "50 minutes", "5 minutes", "1 minute"],
    correct: 2
  },
  {
    id: 5,
    type: 'logic',
    question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    options: ["$0.10", "$0.05", "$0.15", "$1.00"],
    correct: 1
  },
  {
    id: 6,
    type: 'spatial',
    question: "Which word does NOT belong with the others?",
    options: ["Leopard", "Cougar", "Tiger", "Wolf"],
    correct: 3
  },
  {
    id: 7,
    type: 'math',
    question: "Solve: (12 + 8) / 4 + 5 * 2 = ?",
    options: ["15", "20", "25", "10"],
    correct: 0
  },
  {
    id: 8,
    type: 'pattern',
    question: "Finger is to Hand as Leaf is to...",
    options: ["Tree", "Branch", "Forest", "Flower"],
    correct: 1
  },
  {
    id: 9,
    type: 'logic',
    question: "Some months have 30 days, some have 31. How many have 28?",
    options: ["1", "6", "12", "0"],
    correct: 2
  },
  {
    id: 10,
    type: 'spatial',
    question: "If you rotate a 'P' 180 degrees, what does it most look like?",
    options: ["b", "d", "q", "g"],
    correct: 2
  },
  {
    id: 11,
    type: 'math',
    question: "Sequence: 1, 1, 2, 3, 5, 8, 13, ...",
    options: ["15", "20", "21", "25"],
    correct: 2
  },
  {
    id: 12,
    type: 'logic',
    question: "Mary's father has 5 daughters: Nana, Nene, Nini, Nono. What is the 5th daughter's name?",
    options: ["Nunu", "Mary", "Nany", "None"],
    correct: 1
  },
  {
    id: 13,
    type: 'spatial',
    question: "Which shape is the odd one out?",
    options: ["Circle", "Square", "Triangle", "Sphere"],
    correct: 3
  },
  {
    id: 14,
    type: 'math',
    question: "If you have 3 apples and you take away 2, how many apples do you have?",
    options: ["1", "2", "3", "0"],
    correct: 1
  },
  {
    id: 15,
    type: 'logic',
    question: "Which is heavier: A pound of gold or a pound of feathers?",
    options: ["Gold", "Feathers", "Neither", "Depends on volume"],
    correct: 2
  }
];

export const IQTest: React.FC<{ onComplete: (iq: number, score: number) => void }> = ({ onComplete }) => {
  const { user } = useAuth();
  const { playClick, playSuccess } = useAchievementSounds();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    playClick();
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      playSuccess();
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: number[]) => {
    let correctCount = 0;
    finalAnswers.forEach((ans, idx) => {
      if (ans === QUESTIONS[idx].correct) correctCount++;
    });

    // Simple IQ estimation: Mean 100, SD 15
    // 15/15 = ~145+ (Top 0.1%)
    // 10/15 = ~115 (High average)
    // 7/15 = ~100 (Average)
    const estimatedIQ = 70 + (correctCount * 5.33);
    const score = correctCount * 5; // 75 max points

    setIsFinished(true);
    onComplete(Math.round(estimatedIQ), score);
  };

  const getPercentile = (iq: number) => {
    if (iq >= 145) return "99.9th";
    if (iq >= 130) return "98th";
    if (iq >= 120) return "91st";
    if (iq >= 110) return "75th";
    if (iq >= 90) return "50th";
    if (iq >= 80) return "25th";
    return "10th";
  };

  const getDescription = (iq: number) => {
    if (iq >= 130) return "Very Superior : You possess exceptional cognitive abilities.";
    if (iq >= 120) return "Superior : Your mental agility is well above the general population.";
    if (iq >= 110) return "High Average : You have strong analytical and logical skills.";
    if (iq >= 90) return "Average : Your cognitive profile is well-balanced.";
    return "Keep Training : Daily cognitive exercises can improve these scores over time.";
  };

  const handleEmailResults = async () => {
    if (!user?.email) {
      toast.error("Please sign in to email your results.");
      return;
    }

    setIsSending(true);
    const correctCount = answers.filter((ans, idx) => ans === QUESTIONS[idx].correct).length;
    const finalIQ = Math.round(70 + (correctCount * 5.33));

    await shareResultsViaEmail({
      email: user.email,
      game_type: 'IQ Assessment',
      score: correctCount * 5,
      iq_score: finalIQ,
      percentile: getPercentile(finalIQ),
      description: getDescription(finalIQ)
    });
    setIsSending(false);
  };

  if (isFinished) {
    const finalIQ = 70 + (answers.filter((ans, idx) => ans === QUESTIONS[idx].correct).length * 5.33);
    const roundedIQ = Math.round(finalIQ);

    return (
      <div className="flex flex-col items-center gap-8 p-6 w-full max-w-2xl mx-auto text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Award className="w-24 h-24 text-primary mx-auto mb-4 glow-primary" />
          <h2 className="text-4xl font-bold mb-2 font-consciousness">Assessment Complete</h2>
          <div className="text-6xl font-bold text-primary my-6 tracking-tighter">IQ {roundedIQ}</div>
          <p className="text-xl text-muted-foreground mb-8">{getDescription(roundedIQ)}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-sm text-muted-foreground">World Percentile</p>
            <p className="text-2xl font-bold">Top {getPercentile(roundedIQ)}</p>
          </Card>
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <p className="text-2xl font-bold">{Math.round((answers.filter((ans, idx) => ans === QUESTIONS[idx].correct).length / QUESTIONS.length) * 100)}%</p>
          </Card>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button variant="outline" className="gap-2" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'My IQ Assessment Result',
                text: `I just scored an IQ of ${roundedIQ} on 3rdeyeadvisors! Can you beat my score?`,
                url: window.location.href,
              });
            } else {
              toast.info("Copied to clipboard!");
              navigator.clipboard.writeText(`I just scored an IQ of ${roundedIQ} on 3rdeyeadvisors!`);
            }
          }}>
            <Share2 className="w-4 h-4" /> Share Results
          </Button>
          <Button className="gap-2" onClick={handleEmailResults} disabled={isSending}>
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Email My Certificate
          </Button>
        </div>

        <p className="text-xs text-muted-foreground max-w-md italic mt-4">
          Disclaimer: This is a simplified cognitive assessment for entertainment and educational purposes.
          Actual clinical IQ tests are much more comprehensive.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-consciousness text-primary">
          <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(((currentStep) / QUESTIONS.length) * 100)}% Complete</span>
        </div>
        <Progress value={(currentStep / QUESTIONS.length) * 100} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          className="space-y-6"
        >
          <Card className="p-8 border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-6">
              <Brain className="w-8 h-8 text-primary shrink-0 mt-1" />
              <h3 className="text-2xl font-medium leading-tight">
                {QUESTIONS[currentStep].question}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {QUESTIONS[currentStep].options.map((option, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="h-auto py-4 px-6 text-left justify-start text-lg hover:bg-primary/10 hover:border-primary transition-all active:scale-[0.98]"
                  onClick={() => handleAnswer(idx)}
                >
                  <span className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center mr-4 text-sm font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </Button>
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2 justify-center text-muted-foreground text-sm">
        <CheckCircle2 className="w-4 h-4" />
        Scientifically-inspired cognitive assessment
      </div>
    </div>
  );
};

export default IQTest;
