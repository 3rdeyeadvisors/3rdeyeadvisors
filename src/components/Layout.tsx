import { ReactNode, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import Navigation from "./Navigation";
import Footer from "./Footer";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "./ui/pull-to-refresh";
import { useIsMobile } from "@/hooks/use-mobile";
import useScrollToTop from "@/hooks/useScrollToTop";
import { useAchievementSounds } from "@/hooks/useAchievementSounds";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

interface LayoutProps {
  children: ReactNode;
}

// Routes that should render without Layout (nav/footer)
const STANDALONE_ROUTES = ['/rosa-birthday'];

const Layout = ({ children }: LayoutProps) => {
  // Initialize real-time synchronization for all pages
  useRealtimeSync();

  const location = useLocation();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { playRefresh } = useAchievementSounds();
  
  // Scroll to top on route change
  useScrollToTop();
  
  const handleRefresh = useCallback(async () => {
    // Play refresh sound
    playRefresh();
    
    // Invalidate all queries to refetch data
    await queryClient.invalidateQueries();
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
  }, [queryClient, playRefresh]);

  const { isRefreshing, pullDistance, isTriggered } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    disabled: !isMobile
  });
  
  // Check if this is a standalone route
  if (STANDALONE_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }
  
  // Generate canonical URL - normalize path and ensure proper domain
  // Keep trailing slash only for homepage, remove for all other pages
  const canonicalUrl = location.pathname === '/' 
    ? 'https://www.the3rdeyeadvisors.com/'
    : `https://www.the3rdeyeadvisors.com${location.pathname}`.replace(/\/$/, '');

  return (
    <>
      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        isTriggered={isTriggered}
      />
      <div className="min-h-screen bg-gradient-cosmic flex flex-col">
        <Navigation />
        <main className="pt-[calc(4rem+env(safe-area-inset-top))] md:pt-[calc(5rem+env(safe-area-inset-top))] flex-1">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
