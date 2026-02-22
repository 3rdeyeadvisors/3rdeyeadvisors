/**
 * Enhanced Layout with SEO Automation
 * Automatically applies SEO validation and monitoring to all pages
 */

import { ReactNode, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Navigation from "./Navigation";
import Footer from "./Footer";
import SEOValidator from "./SEOValidator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "./ui/pull-to-refresh";
import { useIsMobile } from "@/hooks/use-mobile";

interface AutomatedLayoutProps {
  children: ReactNode;
  showSEOValidator?: boolean;
}

const AutomatedLayout = ({ children, showSEOValidator = true }: AutomatedLayoutProps) => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
    await new Promise(resolve => setTimeout(resolve, 500));
  }, [queryClient]);

  const { isRefreshing, pullDistance, isTriggered } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    disabled: !isMobile
  });

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        isTriggered={isTriggered}
      />
      <Navigation />
      <main className="pt-16 flex-1">
        {children}
      </main>
      <Footer />
      
      {/* SEO Validator - shows in development, optional in production */}
      {showSEOValidator && <SEOValidator />}
    </div>
  );
};

export default AutomatedLayout;