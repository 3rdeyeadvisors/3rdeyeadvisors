import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';

const COLORS = [
  { id: 0, color: 'bg-red-500', glow: 'shadow-[0_0_20px_#ef4444]' },
  { id: 1, color: 'bg-blue-500', glow: 'shadow-[0_0_20px_#3b82f6]' },
  { id: 2, color: 'bg-green-500', glow: 'shadow-[0_0_20px_#22c55e]' },
  { id: 3, color: 'bg-yellow-500', glow: 'shadow-[0_0_20px_#eab308]' },
];

export const PatternSequence: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const { playCorrectAnswer, playWrongAnswer, playClick } = useAchievementSounds();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'gameOver'>('idle');
  const [level, setLevel] = useState(0);
  const [isError, setIsError] = useState(false);

  const startNextLevel = useCallback((currentSequence: number[]) => {
    const nextColor = Math.floor(Math.random() * 4);
    const newSequence = [...currentSequence, nextColor];
    setSequence(newSequence);
    setUserSequence([]);
    setGameState('showing');
    playSequence(newSequence);
  }, []);

  const playSequence = async (seq: number[]) => {
    setGameState('showing');
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveButton(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveButton(null);
    }
    setGameState('playing');
  };

  const handleButtonClick = (id: number) => {
    if (gameState !== 'playing') return;

    playClick();
    setActiveButton(id);
    setTimeout(() => setActiveButton(null), 200);

    const newUserSequence = [...userSequence, id];
    setUserSequence(newUserSequence);

    if (id !== sequence[newUserSequence.length - 1]) {
      setGameState('gameOver');
      setIsError(true);
      playWrongAnswer();
      const score = Math.max(10, level * 5);
      onComplete(score);
      setTimeout(() => setIsError(false), 500);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      setLevel(l => l + 1);
      playCorrectAnswer();
      setTimeout(() => startNextLevel(sequence), 1000);
    }
  };

  const startGame = () => {
    setLevel(1);
    startNextLevel([]);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 w-full max-w-md mx-auto">
      <div className="text-2xl font-consciousness text-primary">Level: {level}</div>

      <motion.div
        className="grid grid-cols-2 gap-4 w-full aspect-square"
        animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {COLORS.map((item) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(item.id)}
            className={`rounded-2xl cursor-pointer transition-all duration-200 ${item.color} ${
              activeButton === item.id ? `${item.glow} brightness-125 scale-105` : 'opacity-40 grayscale-[0.5]'
            }`}
          />
        ))}
      </motion.div>

      <div className="text-center h-12 flex items-center justify-center">
        {gameState === 'idle' && (
          <Button onClick={startGame} size="lg">Start Pattern Test</Button>
        )}
        {gameState === 'showing' && <p className="text-lg text-primary animate-pulse">Watch the pattern...</p>}
        {gameState === 'playing' && <p className="text-lg text-primary">Your turn!</p>}
        {gameState === 'gameOver' && (
          <div className="flex flex-col gap-2">
            <p className="text-xl text-red-500 font-bold">Game Over!</p>
            <Button onClick={startGame} variant="outline" size="sm">Try Again</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternSequence;
