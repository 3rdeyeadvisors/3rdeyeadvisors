import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timer, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Problem {
  text: string;
  answer: number;
}

export const MathSprint: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateProblem = useCallback(() => {
    const operators = ['+', '-', '*'];
    const op = operators[Math.floor(Math.random() * (score > 10 ? 3 : 2))];
    let n1, n2, ans;

    if (op === '+') {
      n1 = Math.floor(Math.random() * 50) + 1;
      n2 = Math.floor(Math.random() * 50) + 1;
      ans = n1 + n2;
    } else if (op === '-') {
      n1 = Math.floor(Math.random() * 50) + 20;
      n2 = Math.floor(Math.random() * 20) + 1;
      ans = n1 - n2;
    } else {
      n1 = Math.floor(Math.random() * 12) + 1;
      n2 = Math.floor(Math.random() * 12) + 1;
      ans = n1 * n2;
    }

    setProblem({ text: `${n1} ${op} ${n2}`, answer: ans });
    setUserInput('');
  }, [score]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    generateProblem();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      onComplete(Math.min(25, score * 2));
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, onComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !userInput) return;

    if (parseInt(userInput) === problem.answer) {
      setScore(s => s + 1);
      setFeedback('correct');
      setTimeout(() => setFeedback(null), 400);
      generateProblem();
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 400);
      setUserInput('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-md mx-auto">
      <div className="flex justify-between w-full items-center px-2">
        <div className="flex items-center gap-2 text-primary font-consciousness">
          <Timer className="w-5 h-5" /> {timeLeft}s
        </div>
        <div className="flex items-center gap-2 text-primary font-consciousness text-xl">
          Score: {score}
        </div>
      </div>

      <div className="w-full aspect-video bg-card border-2 border-border rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-green-500/10 flex items-center justify-center z-10">
              <CheckCircle2 className="w-24 h-24 text-green-500" />
            </motion.div>
          )}
          {feedback === 'wrong' && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-red-500/10 flex items-center justify-center z-10">
              <XCircle className="w-24 h-24 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === 'idle' && (
          <Button onClick={startGame} size="lg" className="gap-2">
            <Zap className="w-5 h-5" /> Start Math Sprint
          </Button>
        )}

        {gameState === 'playing' && problem && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full px-8">
            <div className="text-5xl font-bold font-mono tracking-tighter">{problem.text} = ?</div>
            <Input
              autoFocus
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="text-center text-3xl h-16 bg-background/50 border-primary/30 focus:border-primary"
              placeholder="Answer"
            />
          </form>
        )}

        {gameState === 'finished' && (
          <div className="text-center space-y-4">
            <p className="text-3xl font-bold text-primary">Time's Up!</p>
            <p className="text-xl">You solved {score} problems!</p>
            <Button onClick={startGame} variant="outline">Try Again</Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center italic">
        Speed and accuracy are the keys to mental agility.
      </p>
    </div>
  );
};

export default MathSprint;
