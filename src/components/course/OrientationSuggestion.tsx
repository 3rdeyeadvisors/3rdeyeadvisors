import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

export const OrientationSuggestion = () => {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    if (!isMobile) {
      setShow(false);
      return;
    }

    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);

      // Show suggestion if in portrait and it hasn't been dismissed recently
      const dismissed = sessionStorage.getItem('orientation-suggestion-dismissed');
      if (portrait && !dismissed) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isMobile]);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('orientation-suggestion-dismissed', 'true');
  };

  if (!show || !isMobile || !isPortrait) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-4 right-4 z-40 bg-primary/95 text-primary-foreground p-4 rounded-xl shadow-2xl flex items-center gap-4 backdrop-blur-sm border border-white/20"
      >
        <div className="bg-white/20 p-2 rounded-lg shrink-0">
          <RotateCw className="w-6 h-6 animate-spin-slow" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Best viewed in landscape</p>
          <p className="text-xs opacity-90 truncate">Rotate your device for a better experience</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismiss}
          className="shrink-0 text-primary-foreground hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};
