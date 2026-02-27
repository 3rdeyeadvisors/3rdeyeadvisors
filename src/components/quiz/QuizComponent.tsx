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
        <div className="p-4 border border-red-500 rounded-lg bg-red-500/10">
          <p className="text-sm text-red-500">Error: Invalid question structure</p>
        </div>
      );
    }

    const userAnswer = answers[question.id];

    return (
      <div className="space-y-3 w-full">
        {question.options.map((option, index) => {
          const isSelected = question.type === 'multiple'
            ? userAnswer?.includes(index)
            : userAnswer === index;

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (question.type === 'multiple') {
                  const currentAnswers = userAnswer || [];
                  if (isSelected) {
                    handleAnswerChange(question.id, currentAnswers.filter((i: number) => i !== index));
                  } else {
                    handleAnswerChange(question.id, [...currentAnswers, index]);
                  }
                } else {
                  handleAnswerChange(question.id, index);
                }
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all font-body text-sm ${
                isSelected
                  ? "border-violet-500/50 bg-violet-500/10 text-white"
                  : "border-white/10 bg-white/3 hover:border-violet-500/30 hover:bg-violet-500/5 text-white/70 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? "border-violet-400 bg-violet-400 text-black" : "border-white/20"
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-black rounded-full" />}
                </div>
                <span>{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderResults = () => {
    const passed = score >= quiz.passingScore;
    
    return (
      <div className="bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8 text-center">
        <div className="mb-8">
          <div className="text-5xl font-consciousness font-bold text-white mb-4">
            {score}%
          </div>
          <div className={`inline-flex items-center px-4 py-1.5 rounded-full border font-body text-sm font-semibold mb-4 ${
            passed
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : 'text-red-400 border-red-500/30 bg-red-500/10'
          }`}>
            {passed ? 'Passed' : 'Failed'}
          </div>
          <p className="font-body text-white/50 max-w-sm mx-auto">
            {passed 
              ? "Excellent work! You've mastered this module's core concepts."
              : `You need ${quiz.passingScore}% to pass. Review the content and try again.`
            }
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          {canTakeQuiz() && !passed && (
            <Button
              onClick={startQuiz}
              className="w-full font-body border border-white/15 hover:border-violet-500/30 text-white/70 hover:text-white rounded-xl px-6 py-4 transition-all bg-transparent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Quiz ({quiz.maxAttempts - attempts.length} left)
            </Button>
          )}

          <Button
            onClick={() => setShowResults(false)}
            variant="outline"
            className="w-full font-body border-white/10 text-white/40 hover:text-white rounded-xl px-6 py-4"
          >
            Review Answers
          </Button>
        </div>

        {/* Detailed Results Section (shown when Review Answers is clicked or just keep it simple) */}
        {!passed && (
          <div className="mt-12 space-y-4 text-left">
            <h4 className="font-consciousness text-lg font-bold text-white mb-4">Review Your Answers</h4>
            {quiz.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = question.type === 'multiple'
                ? userAnswer && Array.isArray(userAnswer) &&
                  new Set(question.correctAnswers).size === new Set(userAnswer).size &&
                  question.correctAnswers.every(ans => userAnswer.includes(ans))
                : question.correctAnswers.includes(userAnswer);

              if (isCorrect) return null;

              return (
                <div key={question.id} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <p className="font-consciousness text-sm font-bold text-white mb-2">Question {index + 1}</p>
                  <p className="font-body text-sm text-white/70 mb-3">{question.question}</p>
                  <div className="text-xs font-body">
                    <span className="text-red-400 line-through mr-2">
                      Your answer: {question.type === 'multiple' && Array.isArray(userAnswer)
                        ? userAnswer.map(ans => question.options[ans]).join(', ')
                        : question.options[userAnswer]}
                    </span>
                    <span className="text-emerald-400">
                      Correct: {question.correctAnswers.map(ans => question.options[ans]).join(', ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
                <div key={attempt.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
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
              <p className="text-sm text-white/50">You've already passed this quiz!</p>
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
    <div className="bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/8 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="font-body text-xs uppercase tracking-widest text-white/40 mb-3">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
          <h2 className="font-consciousness text-lg font-bold text-white break-words">{quiz.title}</h2>
        </div>
        {timeLeft !== null && (
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Clock className="w-4 h-4 text-violet-400" />
            <span className={`font-body text-sm font-medium ${timeLeft < 60 ? "text-red-400 animate-pulse" : "text-white/70"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="font-consciousness text-lg md:text-xl font-bold text-white mb-6 leading-snug">
          {currentQuestionData.question}
        </h3>
        {renderQuestion(currentQuestionData)}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/8">
        <div className="font-body text-xs uppercase tracking-widest text-white/40">
          {Object.keys(answers).length} of {quiz.questions.length} answered
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1 sm:flex-none font-body border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl px-6 h-[48px]"
            >
              Previous
            </Button>
          )}

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={loading || Object.keys(answers).length < quiz.questions.length}
              className="flex-1 sm:flex-none font-body bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8 h-[48px]"
            >
              {loading ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestionData.id] === undefined}
              className="flex-1 sm:flex-none font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-8 h-[48px]"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};