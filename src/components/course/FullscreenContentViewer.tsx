import React, { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
  FileText,
  ExternalLink,
  Download,
  Save,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { EnhancedMarkdownRenderer } from './EnhancedMarkdownRenderer';
import NotesEditor from './NotesEditor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'link' | 'download';
}

interface FullscreenContentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
  currentIndex: number;
  totalModules: number;
  onNext: () => void;
  onPrevious: () => void;
  courseTitle?: string;
  type?: 'text' | 'video' | 'interactive';
  videoUrl?: string;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  resources?: Resource[];
  onComplete?: () => void;
  isCompleted?: boolean;
}

export const FullscreenContentViewer: React.FC<FullscreenContentViewerProps> = ({
  isOpen,
  onClose,
  content,
  title,
  currentIndex,
  totalModules,
  onNext,
  onPrevious,
  courseTitle,
  type = 'text',
  videoUrl,
  notes = "",
  onNotesChange,
  resources = [],
  onComplete,
  isCompleted = false,
}) => {
  const { isFullscreen, isSupported, enter, exit, containerRef } = useFullscreen();
  const contentRef = useRef<HTMLDivElement>(null);
  const [showUI, setShowUI] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasNext = currentIndex < totalModules - 1;
  const hasPrevious = currentIndex > 0;
  const lastScrollY = useRef(0);

  const resetUITimer = useCallback(() => {
    if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    if (showUI) {
      uiTimeoutRef.current = setTimeout(() => setShowUI(false), 4000);
    }
  }, [showUI]);

  useEffect(() => {
    if (showUI) {
      resetUITimer();
    }
    return () => {
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    };
  }, [showUI, resetUITimer]);

  const swipeOccurredRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      const currentScrollY = contentRef.current.scrollTop;

      // If we scroll down more than 10px, hide UI immediately
      if (currentScrollY > lastScrollY.current + 10 && showUI) {
        setShowUI(false);
      }
      // If we scroll up more than 10px, show UI
      else if (currentScrollY < lastScrollY.current - 10 && !showUI) {
        setShowUI(true);
      }

      lastScrollY.current = currentScrollY;
    }
    resetUITimer();
  }, [showUI, resetUITimer]);

  const toggleUI = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // If a swipe just happened, don't toggle UI
    if (swipeOccurredRef.current) {
      swipeOccurredRef.current = false;
      return;
    }

    // If we're clicking on an interactive element (button, link, iframe), don't toggle
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('iframe')) {
      return;
    }
    setShowUI(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    if (isFullscreen) {
      exit();
    }
    onClose();
  }, [isFullscreen, exit, onClose]);

  const handleBoundarySwipe = useCallback((direction: 'left' | 'right') => {
    toast.info(direction === 'left' ? "You're at the last module" : "You're at the first module");
  }, []);

  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => {
      swipeOccurredRef.current = true;
      if (hasNext) onNext();
      else handleBoundarySwipe('left');
    },
    onSwipeRight: () => {
      swipeOccurredRef.current = true;
      if (hasPrevious) onPrevious();
      else handleBoundarySwipe('right');
    },
    threshold: 30,
    preventDefaultOnSwipe: true
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeOccurredRef.current = false;
    swipeHandlers.onTouchStart(e);
  }, [swipeHandlers]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          if (hasNext) onNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          if (hasPrevious) onPrevious();
          break;
        case 'Escape':
          handleClose();
          break;
        case 'f':
        case 'F':
          if (isSupported) {
            if (!isFullscreen) {
              enter(containerRef.current);
            } else {
              exit();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrevious, onNext, onPrevious, isFullscreen, isSupported, enter, exit, containerRef, handleClose]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    // Also show UI when navigating to new content to provide feedback
    setShowUI(true);
  }, [currentIndex]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-[#080808] overflow-hidden"
      onClick={toggleUI}
      onTouchStart={handleTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
      onTouchCancel={swipeHandlers.onTouchCancel}
    >
        <AnimatePresence>
          {!showUI && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1.1 }}
              className="fixed top-4 right-4 z-[10000]"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="bg-white/5 backdrop-blur-md rounded-full w-10 h-10 border border-white/10"
                aria-label="Exit focus mode"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Overlay */}
        <motion.div
          initial={false}
          animate={{
            y: showUI ? 0 : -150,
            opacity: showUI ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute top-0 left-0 right-0 z-50 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#080808]/95 backdrop-blur-sm safe-area-inset-top">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="shrink-0 min-h-[44px] min-w-[44px]"
                aria-label="Close focus mode"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                {courseTitle && (
                  <p className="text-xs text-white/50 truncate">{courseTitle}</p>
                )}
                <h1 className="text-sm font-semibold text-foreground truncate">
                  {title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-white/50 whitespace-nowrap mr-2">
                {currentIndex + 1} / {totalModules}
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden lg:flex min-h-[44px] min-w-[44px]"
                aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
              >
                {showSidebar ? (
                  <PanelRightClose className="w-5 h-5" />
                ) : (
                  <PanelRightOpen className="w-5 h-5" />
                )}
              </Button>

              {isSupported && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => isFullscreen ? exit() : enter(containerRef.current)}
                  className="min-h-[44px] min-w-[44px]"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 py-2 bg-[#080808]/80 border-b border-white/5">
            {Array.from({ length: totalModules }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === currentIndex
                    ? "bg-primary"
                    : i < currentIndex
                    ? "bg-primary/40"
                    : "bg-white/5"
                )}
              />
            ))}
          </div>
        </motion.div>

        {/* Content Area - Fills entire screen */}
        <div className="absolute inset-0 flex overflow-hidden">
          <div
            ref={contentRef}
            className={cn(
              "flex-1 overflow-y-auto px-4 scroll-smooth transition-all duration-300",
              showSidebar ? "lg:mr-0" : ""
            )}
            style={{ touchAction: 'pan-y' }}
            onScroll={handleScroll}
          >
            <div className={cn(
              "mx-auto transition-all duration-300 pt-28 pb-32 md:px-8 lg:px-12",
              showSidebar ? "max-w-4xl" : "max-w-6xl"
            )}>
              {type === 'video' && videoUrl && (
                <div className="aspect-video bg-black rounded-xl overflow-hidden mb-8 shadow-2xl border border-white/10">
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <EnhancedMarkdownRenderer content={content} />
            </div>
          </div>

          <AnimatePresence>
            {showSidebar && (
              <motion.aside
                initial={{ x: 350, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 350, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="hidden lg:flex w-[350px] border-l border-white/10 bg-[#080808]/50 backdrop-blur-md flex-col overflow-hidden pt-16"
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="font-consciousness font-semibold flex items-center gap-2">
                    <Save className="w-4 h-4 text-primary" />
                    Study Tools
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(false)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <Tabs defaultValue="notes" className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 pt-2">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="notes" className="text-xs">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Notes
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="text-xs">
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Resources
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="notes" className="flex-1 overflow-hidden flex flex-col p-4 mt-0">
                    <textarea
                      style={{
                        width: '100%',
                        flex: 1,
                        minHeight: '180px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        fontFamily: 'Inter, sans-serif',
                        resize: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                      value={notes}
                      onChange={(e) => onNotesChange?.(e.target.value)}
                      placeholder="Take notes while you learn..."
                    />
                  </TabsContent>

                  <TabsContent value="resources" className="flex-1 overflow-hidden flex flex-col p-4 mt-0">
                    <h3 className="text-sm font-medium mb-3">Module Resources</h3>
                    <ScrollArea className="flex-1 pr-3">
                      {resources && resources.length > 0 ? (
                        <div className="space-y-3">
                          {resources.map((resource, index) => (
                            <div
                              key={index}
                              className="group p-3 rounded-lg border border-white/10 bg-white/3 hover:bg-white/8 transition-all cursor-pointer"
                              onClick={() => window.open(resource.url, '_blank')}
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-md bg-[#080808] border border-white/10 text-primary group-hover:scale-110 transition-transform">
                                  {resource.type === 'pdf' && <FileText className="w-4 h-4" />}
                                  {resource.type === 'link' && <ExternalLink className="w-4 h-4" />}
                                  {resource.type === 'download' && <Download className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    {resource.title}
                                  </p>
                                  <p className="text-[10px] text-white/50 mt-1 capitalize">
                                    {resource.type}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-muted rounded-xl">
                          <FileText className="w-8 h-8 text-white/30 mx-auto mb-2" />
                          <p className="text-xs text-white/50">No resources for this module</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                <div className="p-4 border-t border-white/10 bg-white/3">
                  <p className="text-[10px] text-center text-white/50">
                    Notes are synced across your devices automatically
                  </p>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Footer Overlay */}
        <motion.div
          initial={false}
          animate={{
            y: showUI ? 0 : 150,
            opacity: showUI ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#080808]/95 backdrop-blur-sm px-4 py-3 safe-area-inset-bottom z-50"
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="min-h-[48px] px-4 gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span className="hidden sm:inline">Swipe or use arrows to navigate</span>
                <span className="sm:hidden">← Swipe →</span>
              </div>

              {/* Mark Complete inside fullscreen */}
              {onComplete && !isCompleted && (
                <button
                  onClick={() => { onComplete(); }}
                  className="flex items-center gap-2 font-body text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-2.5 transition-all font-semibold"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </button>
              )}
              {isCompleted && (
                <div className="flex items-center gap-2 font-body text-sm text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </div>
              )}
            </div>

            <Button
              variant={hasNext ? "cosmic" : "outline"}
              onClick={hasNext ? onNext : handleClose}
              className="min-h-[48px] px-4 gap-2"
            >
              <span className="hidden sm:inline">{hasNext ? "Next" : "Finish"}</span>
              <span className="sm:hidden">{hasNext ? "Next" : "Done"}</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Touch hint overlay */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="flex items-center gap-4 text-white/50 text-lg">
            <ChevronLeft className="w-8 h-8 animate-pulse" />
            <span>Swipe to navigate</span>
            <ChevronRight className="w-8 h-8 animate-pulse" />
          </div>
        </motion.div>
      </motion.div>
  );
};
