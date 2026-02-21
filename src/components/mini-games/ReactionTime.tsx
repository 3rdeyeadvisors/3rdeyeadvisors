import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';

export const ReactionTime: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const { playSuccess, playWrongAnswer, playClick } = useAchievementSounds();
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'clicked' | 'tooEarly'>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    setGameState('waiting');
    setReactionTime(null);

    const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('tooEarly');
      playWrongAnswer();
    } else if (gameState === 'ready') {
      const endTime = Date.now();
      const diff = endTime - startTime;
      setReactionTime(diff);
      setGameState('clicked');
      playSuccess();

      // Points based on reaction time: < 250ms is excellent
      const points = Math.max(10, Math.floor(5000 / diff));
      onComplete(Math.min(25, points));
    } else if (gameState === 'clicked' || gameState === 'tooEarly' || gameState === 'idle') {
      playClick();
      startTest();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getInstructions = () => {
    switch (gameState) {
      case 'idle': return 'Click anywhere to start';
      case 'waiting': return 'Wait for blue...';
      case 'ready': return 'CLICK NOW!';
      case 'clicked': return `${reactionTime}ms. Click to try again.`;
      case 'tooEarly': return 'Too early! Click to restart.';
    }
  };

  const getBgColor = () => {
    switch (gameState) {
      case 'waiting': return 'bg-red-500/20 border-red-500/50';
      case 'ready': return 'bg-primary/40 border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]';
      case 'tooEarly': return 'bg-orange-500/20 border-orange-500/50';
      default: return 'bg-white/3 border-white/8';
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-md mx-auto">
      <div
        onClick={handleClick}
        className={`w-full aspect-video rounded-3xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-[0.98] ${getBgColor()}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={gameState}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            {gameState === 'idle' && <Zap className="w-16 h-16 text-primary animate-pulse" />}
            {gameState === 'waiting' && <Clock className="w-16 h-16 text-red-500" />}
            {gameState === 'ready' && <Zap className="w-20 h-20 text-white fill-white" />}
            {gameState === 'tooEarly' && <AlertCircle className="w-16 h-16 text-orange-500" />}
            {gameState === 'clicked' && (
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold text-primary mb-2">{reactionTime}ms</span>
                <span className="text-sm text-white/50">
                  {reactionTime! < 200 ? 'Superhuman! 🚀' :
                   reactionTime! < 250 ? 'Elite! ⚡' :
                   reactionTime! < 300 ? 'Great! 👍' : 'Good. Try again!'}
                </span>
              </div>
            )}
            <p className="text-xl font-consciousness mt-2">{getInstructions()}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-xs text-white/50 text-center px-4">
        Average human reaction time is ~250-300ms. Can you beat the average?
      </p>
    </div>
  );
};

export default ReactionTime;
