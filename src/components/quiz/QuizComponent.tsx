import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePoints } from "@/hooks/usePoints";
import { useBadges } from "@/hooks/useBadges";
import { useAchievementSounds } from "@/hooks/useAchievementSounds";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy,
  AlertCircle
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'true-false';
  options: string[];
  correctAnswers: number[];
  explanation?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
  maxAttempts: number;
}

interface QuizComponentProps {
  courseId: number;
  moduleId: string;
  quiz: Quiz;
  onComplete?: (passed: boolean, score: number) => void;
}

export const QuizComponent = ({ courseId, moduleId, quiz, onComplete }: QuizComponentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardPoints } = usePoints();
  const { awardBadge } = useBadges();
  const { playQuizPass, playCorrectAnswer, playWrongAnswer } = useAchievementSounds();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load previous attempts
  useEffect(() => {
    if (user) {
      loadAttempts();
    }
  }, [user, quiz.id]);

  // Timer
  useEffect(() => {
    if (quizStarted && timeLeft !== null && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeLeft, showResults]);

  const loadAttempts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quiz.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error('Error loading attempts:', error);
    }
  };

  const canTakeQuiz = () => {
    return attempts.length < quiz.maxAttempts;
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    if (quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach(question => {
      // Validate question structure
      if (!question.correctAnswers || !Array.isArray(question.correctAnswers)) {
        console.error('Invalid question structure:', question);
        return;
      }

      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (question.type === 'single' || question.type === 'true-false') {
        if (userAnswer !== undefined && question.correctAnswers.includes(userAnswer)) {
          earnedPoints += question.points;
        }
      } else if (question.type === 'multiple') {
        if (userAnswer && Array.isArray(userAnswer)) {
          const correctSet = new Set(question.correctAnswers);
          const userSet = new Set(userAnswer);
          
          if (correctSet.size === userSet.size && 
              [...correctSet].every(x => userSet.has(x))) {
            earnedPoints += question.points;
          }
        }
      }
    });

    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  const handleSubmitQuiz = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit the quiz.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Calculate score before submission
      const finalScore = calculateScore();
      const passed = finalScore >= quiz.passingScore;
      const timeTaken = quiz.timeLimit ? (quiz.timeLimit * 60) - (timeLeft || 0) : null;

      // Try to save to database, but don't fail if it doesn't work (for courseContent quizzes)
      try {
        const { error } = await supabase
          .from('quiz_attempts')
          .insert({
            user_id: user.id,
            quiz_id: quiz.id,
            answers,
            score: finalScore,
            passed,
            time_taken: timeTaken,
            completed_at: new Date().toISOString()
          });

        if (error) {
          // Could not save quiz to database (this is OK for courseContent quizzes)
        }
      } catch (dbError) {
        // Database save skipped for courseContent quiz
      }

      // Set results state - this should always happen
      setScore(finalScore);
      setShowResults(true);
      setQuizStarted(false);
      
      // Show prominent toast notification
      toast({
        title: passed ? "🎉 Quiz Passed!" : "📝 Quiz Submitted",
        description: passed 
          ? `Excellent work! You scored ${finalScore}% (passing: ${quiz.passingScore}%)` 
          : `You scored ${finalScore}%. You need ${quiz.passingScore}% to pass. ${canTakeQuiz() ? 'You can try again!' : ''}`,
        variant: passed ? "default" : "destructive",
        duration: 5000,
      });

      onComplete?.(passed, finalScore);
      
      // Award points for quiz completion
      if (passed) {
        // Play quiz pass sound
        playQuizPass();
        
        try {
          await awardPoints('quiz_passed', `${quiz.id}_${new Date().toISOString().slice(0, 7)}`);
          
          // Award quiz_master badge after 5 quizzes
          // Note: This is a simplified check - in production you'd query the DB
          
          // Award bonus for perfect score
          if (finalScore === 100) {
            await awardPoints('quiz_perfect', `${quiz.id}_perfect_${new Date().toISOString().slice(0, 7)}`);
            // Award perfectionist badge
            await awardBadge('perfectionist');
          }

          // Special logic for Final Exams (33 questions)
          if (quiz.questions.length >= 33 && quiz.id.startsWith('exam-')) {
            await awardBadge('final_exam_master');

            if (finalScore === 100) {
              await awardBadge('course_mastery');
            }
          }
        } catch (e) {
          // Could not award quiz points
        }
      }
      
      // Try to reload attempts (may not work for courseContent quizzes)
      try {
        await loadAttempts();
      } catch (e) {
        // Could not reload attempts
      }
    } catch (error) {
      console.error('Error calculating quiz score:', error);
      
      toast({
        title: "⚠️ Quiz Error",
        description: "There was an error processing your quiz. Please try again.",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: Question) => {
    // Validate question structure
    if (!question || !question.options || !Array.isArray(question.options)) {
      return (
        <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
          <p className="text-sm text-destructive">Error: Invalid question structure</p>
        </div>
      );
    }

    const userAnswer = answers[question.id];

    if (question.type === 'single' || question.type === 'true-false') {
      return (
        <RadioGroup
          value={userAnswer?.toString()}
          onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
          className="space-y-3 sm:space-y-3 w-full"
        >
          {question.options.map((option, index) => (
            <Label 
              key={index} 
              htmlFor={`${question.id}-${index}`}
              className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer w-full max-w-full min-h-[56px] sm:min-h-[60px]"
            >
              <RadioGroupItem 
                value={index.toString()} 
                id={`${question.id}-${index}`} 
                className="mt-1 shrink-0 w-5 h-5 sm:w-5 sm:h-5" 
              />
              <span className="text-sm sm:text-base md:text-base leading-relaxed break-words flex-1 min-w-0 pt-0.5">
                {option}
              </span>
            </Label>
          ))}
        </RadioGroup>
      );
    }

    if (question.type === 'multiple') {
      return (
        <div className="space-y-3 sm:space-y-3 w-full">
          {question.options.map((option, index) => (
            <Label
              key={index}
              htmlFor={`${question.id}-${index}`}
              className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer w-full max-w-full min-h-[56px] sm:min-h-[60px]"
            >
              <Checkbox
                id={`${question.id}-${index}`}
                checked={userAnswer ? userAnswer.includes(index) : false}
                onCheckedChange={(checked) => {
                  const currentAnswers = userAnswer || [];
                  if (checked) {
                    handleAnswerChange(question.id, [...currentAnswers, index]);
                  } else {
                    handleAnswerChange(question.id, currentAnswers.filter((i: number) => i !== index));
                  }
                }}
                className="mt-1 shrink-0 w-5 h-5 sm:w-5 sm:h-5"
              />
              <span className="text-sm sm:text-base md:text-base leading-relaxed break-words flex-1 min-w-0 pt-0.5">
                {option}
              </span>
            </Label>
          ))}
        </div>
      );
    }

    return null;
  };

  const renderResults = () => {
    const passed = score >= quiz.passingScore;
    
    return (
      <Card className="p-3 sm:p-6 bg-white/3 border border-white/8 rounded-2xl w-full max-w-full overflow-hidden">
        {/* Prominent Results Header */}
        <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl" style={{
          background: passed 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'
        }}>
          <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center border-2 sm:border-4 ${
            passed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "bg-red-500/20 text-red-400 border-red-500/40"
          }`}>
            {passed ? <Trophy className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" /> : <XCircle className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />}
          </div>
          <Badge className={`font-body text-[10px] uppercase tracking-widest mb-3 ${passed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {passed ? "✅ QUIZ PASSED" : "📝 QUIZ COMPLETE"}
          </Badge>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-consciousness font-bold text-white mb-2 sm:mb-3 break-words">
            {passed ? "Congratulations!" : "Good Effort!"}
          </h3>
          <div className="text-3xl sm:text-4xl md:text-5xl font-consciousness font-bold text-white mb-2">
            {score}%
          </div>
          <p className="font-body text-xs sm:text-sm text-white/50 px-2 break-words">
            {passed 
              ? `You passed! (Required: ${quiz.passingScore}%)` 
              : `You need ${quiz.passingScore}% to pass. ${canTakeQuiz() ? 'You can try again!' : ''}`
            }
          </p>
        </div>

        {/* Detailed Results Section */}
        <Separator className="my-4 sm:my-6 border-white/5" />
        
        <div className="mb-3 sm:mb-4">
          <h4 className="font-consciousness text-lg font-bold text-white text-center mb-3 sm:mb-4 break-words">
            Answer Review
          </h4>
        </div>

        <div className="space-y-3 sm:space-y-4 w-full max-w-full">
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = question.type === 'multiple' 
              ? userAnswer && Array.isArray(userAnswer) && 
                new Set(question.correctAnswers).size === new Set(userAnswer).size &&
                question.correctAnswers.every(ans => userAnswer.includes(ans))
              : question.correctAnswers.includes(userAnswer);

            return (
              <div key={question.id} className={`p-3 sm:p-4 border-2 rounded-lg w-full max-w-full overflow-hidden ${
                isCorrect ? 'border-awareness/30 bg-awareness/5' : 'border-destructive/30 bg-destructive/5'
              }`}>
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isCorrect ? "bg-awareness text-awareness-foreground" : "bg-destructive text-destructive-foreground"
                  }`}>
                    {isCorrect ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                      <h4 className="font-semibold text-xs sm:text-sm md:text-base break-words">Question {index + 1}</h4>
                      <Badge variant={isCorrect ? "default" : "destructive"} className="text-[10px] sm:text-xs shrink-0">
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <p className="mb-2 sm:mb-3 text-xs sm:text-sm md:text-base font-medium break-words leading-relaxed">{question.question}</p>
                
                <div className="space-y-2 w-full max-w-full overflow-hidden">
                  {userAnswer !== undefined && (
                    <div className="text-xs sm:text-sm break-words">
                      <span className="font-medium">Your Answer: </span>
                      <span className={`${isCorrect ? "text-awareness" : "text-destructive"} break-words`}>
                        {question.type === 'multiple' && Array.isArray(userAnswer)
                          ? userAnswer.map(ans => question.options[ans]).join(', ')
                          : question.options[userAnswer]}
                      </span>
                    </div>
                  )}
                  
                  {!isCorrect && (
                    <div className="bg-muted/50 p-2 sm:p-3 rounded border border-border w-full max-w-full overflow-hidden">
                      <p className="text-xs sm:text-sm font-semibold text-awareness mb-1 break-words">✓ Correct Answer:</p>
                      <p className="text-xs sm:text-sm font-medium break-words leading-relaxed">
                        {question.correctAnswers.map(ans => question.options[ans]).join(', ')}
                      </p>
                      {question.explanation && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs sm:text-sm text-muted-foreground italic break-words leading-relaxed">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 w-full">
          {canTakeQuiz() && !passed && (
            <Button onClick={startQuiz} variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Try Again ({quiz.maxAttempts - attempts.length} left)
            </Button>
          )}
        </div>
      </Card>
    );
  };

  if (!user) {
    return (
      <Card className="p-8 text-center bg-white/3 border-white/8 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="font-consciousness text-xl font-bold text-white mb-2">Sign In Required</h3>
        <p className="font-body text-white/50">Please sign in to take this quiz.</p>
      </Card>
    );
  }

  if (showResults) {
    return renderResults();
  }

  if (!quizStarted) {
    const lastAttempt = attempts[0];
    const hasPassedBefore = attempts.some(attempt => attempt.passed);

    return (
      <Card className="p-8 bg-white/3 border-white/8 rounded-2xl">
        <div className="text-center mb-8">
          <h2 className="font-consciousness text-2xl font-bold text-white mb-2">{quiz.title}</h2>
          {quiz.description && (
            <p className="font-body text-white/50 mb-4">{quiz.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <Trophy className="w-5 h-5 text-violet-400 mb-2" />
            <span className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Pass Score</span>
            <span className="font-consciousness text-lg text-white">{quiz.passingScore}%</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <RotateCcw className="w-5 h-5 text-violet-400 mb-2" />
            <span className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Max Tries</span>
            <span className="font-consciousness text-lg text-white">{quiz.maxAttempts}</span>
          </div>
          {quiz.timeLimit && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
              <Clock className="w-5 h-5 text-violet-400 mb-2" />
              <span className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Time Limit</span>
              <span className="font-consciousness text-lg text-white">{quiz.timeLimit}m</span>
            </div>
          )}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <CheckCircle className="w-5 h-5 text-violet-400 mb-2" />
            <span className="font-body text-[10px] uppercase tracking-widest text-white/40 mb-1">Questions</span>
            <span className="font-consciousness text-lg text-white">{quiz.questions.length}</span>
          </div>
        </div>

        {attempts.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Previous Attempts</h3>
            <div className="space-y-2">
              {attempts.slice(0, 3).map((attempt, index) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>Attempt {attempts.length - index}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={attempt.passed ? "default" : "destructive"}>
                      {attempt.score}%
                    </Badge>
                    {attempt.passed && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          {hasPassedBefore ? (
            <div className="mb-4">
              <Badge variant="default" className="mb-2">Quiz Passed</Badge>
              <p className="text-sm text-muted-foreground">You've already passed this quiz!</p>
            </div>
          ) : (
            <div className="mb-4">
              {!canTakeQuiz() && (
                <div className="text-red-600 mb-4">
                  <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                  <p>You've used all your attempts for this quiz.</p>
                </div>
              )}
            </div>
          )}
          
          <Button 
            onClick={startQuiz} 
            disabled={!canTakeQuiz()}
            className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 py-6 transition-all"
          >
            {hasPassedBefore ? "Practice Again" : "Start Quiz"}
          </Button>
        </div>
      </Card>
    );
  }

  // Quiz in progress
  const currentQuestionData = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Card className="p-4 sm:p-8 bg-white/3 border-white/8 rounded-2xl w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h2 className="font-consciousness text-xl font-bold text-white mb-1 break-words">{quiz.title}</h2>
          <p className="font-body text-xs uppercase tracking-widest text-white/40">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </div>
        {timeLeft !== null && (
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className={`text-sm sm:text-base ${timeLeft < 300 ? "text-red-600 font-bold" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 w-full max-w-full overflow-hidden">
        <h3 className="font-consciousness text-lg font-bold text-white mb-6 break-words leading-relaxed">
          {currentQuestionData.question}
        </h3>
        <div className="w-full max-w-full overflow-hidden">
          {renderQuestion(currentQuestionData)}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="font-body text-xs uppercase tracking-widest border-white/10 text-white hover:bg-white/5 rounded-xl px-6 py-4 w-full sm:w-auto order-2 sm:order-1"
        >
          Previous
        </Button>

        <div className="font-body text-xs uppercase tracking-widest text-white/40 text-center order-1 sm:order-2">
          {Object.keys(answers).length} of {quiz.questions.length} answered
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <Button
            onClick={handleSubmitQuiz}
            disabled={loading}
            className="font-body text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 py-4 w-full sm:w-auto order-3"
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="font-body text-xs uppercase tracking-widest bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 py-4 w-full sm:w-auto order-3"
          >
            Next
          </Button>
        )}
      </div>
    </Card>
  );
};