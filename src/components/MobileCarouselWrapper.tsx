import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MobileCarouselWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileCarouselWrapper: React.FC<MobileCarouselWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const childrenArray = React.Children.toArray(children);
  const childCount = childrenArray.length;

  // All tracking values as refs to avoid stale closures
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const containerWidthRef = useRef(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const dragOffsetRef = useRef(0);
  const currentIndexRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Only state that triggers re-renders
  const [renderIndex, setRenderIndex] = useState(0);
  const [displayOffset, setDisplayOffset] = useState(0);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        containerWidthRef.current = containerRef.current.offsetWidth;
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(childCount - 1, index));
    currentIndexRef.current = newIndex;
    setRenderIndex(newIndex);
    setDisplayOffset(0);
    dragOffsetRef.current = 0;
  }, [childCount]);

  // Native touch event handlers - registered ONCE on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container || childCount <= 1) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Update container width
      containerWidthRef.current = container.offsetWidth;
      
      // Initialize touch tracking
      isDraggingRef.current = true;
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      startTimeRef.current = Date.now();
      isHorizontalSwipeRef.current = null;
      dragOffsetRef.current = 0;
      
      // Add class to body to coordinate with pull-to-refresh
      document.body.classList.add('carousel-dragging');
      container.setAttribute('data-dragging', 'true');
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startXRef.current;
      const diffY = currentY - startYRef.current;
      
      // Determine swipe direction on first significant movement
      if (isHorizontalSwipeRef.current === null) {
        if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
          isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
          
          if (!isHorizontalSwipeRef.current) {
            // Vertical swipe - cancel carousel drag
            isDraggingRef.current = false;
            document.body.classList.remove('carousel-dragging');
            container.setAttribute('data-dragging', 'false');
            return;
          }
        } else {
          return; // Wait for more movement
        }
      }
      
      // Only handle horizontal swipes
      if (!isHorizontalSwipeRef.current) return;
      
      // CRITICAL: Prevent default and stop propagation to prevent scroll/pull-to-refresh
      e.preventDefault();
      e.stopImmediatePropagation();
      
      // Apply resistance at edges
      const currentIdx = currentIndexRef.current;
      let offset = diffX;
      if ((currentIdx === 0 && diffX > 0) || (currentIdx === childCount - 1 && diffX < 0)) {
        offset = diffX * 0.3;
      }
      
      dragOffsetRef.current = offset;
      
      // Use RAF for smooth updates
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        setDisplayOffset(offset);
      });
    };

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;
      
      // Remove dragging state
      document.body.classList.remove('carousel-dragging');
      container.setAttribute('data-dragging', 'false');
      
      const wasHorizontal = isHorizontalSwipeRef.current;
      isDraggingRef.current = false;
      isHorizontalSwipeRef.current = null;
      
      if (!wasHorizontal) {
        dragOffsetRef.current = 0;
        setDisplayOffset(0);
        return;
      }
      
      const elapsed = Date.now() - startTimeRef.current;
      const velocity = Math.abs(dragOffsetRef.current) / elapsed;
      const threshold = containerWidthRef.current * 0.2;
      const velocityThreshold = 0.5;
      const currentIdx = currentIndexRef.current;
      
      let newIndex = currentIdx;
      const offset = dragOffsetRef.current;
      
      if (offset > threshold || (offset > 30 && velocity > velocityThreshold)) {
        newIndex = Math.max(0, currentIdx - 1);
      } else if (offset < -threshold || (offset < -30 && velocity > velocityThreshold)) {
        newIndex = Math.min(childCount - 1, currentIdx + 1);
      }
      
      currentIndexRef.current = newIndex;
      dragOffsetRef.current = 0;
      
      setRenderIndex(newIndex);
      setDisplayOffset(0);
    };

    // Register listeners with proper options - passive: false for touchmove
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      document.body.classList.remove('carousel-dragging');
      
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [childCount]); // Only depend on childCount, not on state

  // Calculate transform
  const baseTransform = -renderIndex * 100;
  const dragPercent = containerWidthRef.current > 0 ? (displayOffset / containerWidthRef.current) * 100 : 0;
  const transform = baseTransform + dragPercent;

  return (
    <div className={cn("md:hidden", className)}>
      <div 
        ref={containerRef}
        className="mobile-carousel-container relative overflow-hidden"
        data-carousel="true"
        data-dragging="false"
      >
        <div
          className="mobile-carousel-track flex"
          style={{
            transform: `translateX(${transform}%)`,
            transition: displayOffset !== 0 ? 'none' : 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {childrenArray.map((child, index) => (
            <div 
              key={index}
              className="min-w-full w-full flex-shrink-0 px-2"
            >
              {child}
            </div>
          ))}
        </div>
        
        {/* Swipe hint - only show on first slide */}
        {renderIndex === 0 && childCount > 1 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 animate-pulse pointer-events-none">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Dot indicators */}
      {childCount > 1 && (
        <div className="flex justify-center gap-2 mt-4 pb-2">
          {Array.from({ length: childCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === renderIndex 
                  ? 'bg-primary w-4' 
                  : 'bg-white/20 hover:bg-white/30'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      <div className="text-center mt-2">
        <span className="text-xs text-white/50">← Swipe to see more →</span>
      </div>
    </div>
  );
};
