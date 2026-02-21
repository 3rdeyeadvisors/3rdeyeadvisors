import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timer, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';

interface Problem {
  text: string;
  answer: number;
}

export const MathSprint: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const { playCorrectAnswer, playWrongAnswer } = useAchievementSounds();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const scoreRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
      timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('finished');
            onCompleteRef.current(scoreRef.current * 2);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !userInput) return;

    if (parseInt(userInput) === problem.answer) {
      const newScore = score + 1;
      setScore(newScore);
      scoreRef.current = newScore;
      setFeedback('correct');
      playCorrectAnswer();
      setTimeout(() => setFeedback(null), 400);
      generateProblem();
    } else {
      setFeedback('wrong');
      playWrongAnswer();
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

      <div className="w-full aspect-video bg-white/3 border-2 border-white/8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
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
          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-6 w-full px-8"
            animate={feedback === 'wrong' ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="text-5xl font-bold font-mono tracking-tighter">{problem.text} = ?</div>
            <Input
              autoFocus
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="text-center text-3xl h-16 bg-white/5 border-primary/30 focus:border-primary"
              placeholder="Answer"
            />
          </motion.form>
        )}

        {gameState === 'finished' && (
          <div className="text-center space-y-4">
            <p className="text-3xl font-bold text-primary">Time's Up!</p>
            <p className="text-xl">You solved {score} problems!</p>
            <Button onClick={startGame} variant="outline">Try Again</Button>
          </div>
        )}
      </div>

      <p className="text-xs text-white/50 text-center italic">
        Speed and accuracy are the keys to mental agility.
      </p>
    </div>
  );
};

export default MathSprint;
