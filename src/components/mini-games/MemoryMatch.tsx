import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';

interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = ['🧠', '⚡', '🔬', '🌌', '🧬', '🧪', '🔭', '🛡️'];

export const MemoryMatch: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const { playCorrectAnswer, playWrongAnswer, playClick, playSuccess } = useAchievementSounds();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initGame = useCallback(() => {
    const shuffled = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched || isWon) return;

    playClick();
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].symbol === cards[second].symbol) {
        playCorrectAnswer();
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);

        if (newCards.every(c => c.isMatched)) {
          setIsWon(true);
          playSuccess();
          const score = Math.max(10, 100 - moves);
          onComplete(score);
        }
      } else {
        playWrongAnswer();
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex justify-between w-full max-w-md items-center">
        <div className="text-xl font-consciousness text-primary">Moves: {moves}</div>
        <Button variant="outline" size="sm" onClick={initGame} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            className="aspect-square relative cursor-pointer"
          >
            <AnimatePresence mode="wait">
              {card.isFlipped || card.isMatched ? (
                <motion.div
                  key="front"
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full bg-primary/20 border-2 border-primary rounded-xl flex items-center justify-center text-3xl"
                >
                  {card.symbol}
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: -180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full bg-card border-2 border-border rounded-xl flex items-center justify-center text-primary"
                >
                  <Brain className="w-8 h-8 opacity-20" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {isWon && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mt-4"
        >
          <h3 className="text-2xl font-bold text-primary glow-text">Congratulations!</h3>
          <p className="text-muted-foreground">You matched all pairs in {moves} moves.</p>
        </motion.div>
      )}
    </div>
  );
};

export default MemoryMatch;
