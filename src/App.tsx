import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { HelmetProvider } from "react-helmet-async";
import SecurityHeaders from "@/components/SecurityHeaders";
import Layout from "./components/Layout";
import PageTransition from "./components/PageTransition";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProgressProvider } from "./components/progress/ProgressProvider";
import { SubscriptionProvider } from "./hooks/useSubscription";
import { PointsProvider } from "./components/points/PointsProvider";
import { ThirdwebProvider } from "thirdweb/react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ReloadPrompt from "./components/pwa/ReloadPrompt";

// Lazy load all pages for better performance and smaller initial bundle size
const Index = lazy(() => import("./pages/Index"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Philosophy = lazy(() => import("./pages/Philosophy"));
const Courses = lazy(() => import("./pages/Courses"));
const Blog = lazy(() => import("./pages/Blog"));
const Resources = lazy(() => import("./pages/Resources"));
const Store = lazy(() => import("./pages/Store"));
const MerchandiseDetail = lazy(() => import("./pages/MerchandiseDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const ModuleViewer = lazy(() => import("./pages/ModuleViewer"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Institutional = lazy(() => import("./pages/Institutional"));
const EmailLogsAdmin = lazy(() => import("./pages/EmailLogsAdmin"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const WalletSetupTutorial = lazy(() => import("./pages/WalletSetupTutorial"));
const FirstDexSwapTutorial = lazy(() => import("./pages/FirstDexSwapTutorial"));
const DefiCalculatorsTutorial = lazy(() => import("./pages/DefiCalculatorsTutorial"));
const SpottingScamsTutorial = lazy(() => import("./pages/SpottingScamsTutorial"));
const CrossChainBridgingTutorial = lazy(() => import("./pages/CrossChainBridgingTutorial"));
const AdvancedDefiProtocolsTutorial = lazy(() => import("./pages/AdvancedDefiProtocolsTutorial"));
const PortfolioRebalancingTutorial = lazy(() => import("./pages/PortfolioRebalancingTutorial"));
const PortfolioTrackingTutorial = lazy(() => import("./pages/PortfolioTrackingTutorial"));
const LiquidityPoolBasicsTutorial = lazy(() => import("./pages/LiquidityPoolBasicsTutorial"));
const ReadingDefiMetricsTutorial = lazy(() => import("./pages/ReadingDefiMetricsTutorial"));
const RiskAssessmentTutorial = lazy(() => import("./pages/RiskAssessmentTutorial"));
const ChartReadingTutorial = lazy(() => import("./pages/ChartReadingTutorial"));
const NftDefiTutorial = lazy(() => import("./pages/NftDefiTutorial"));
const DaoParticipationTutorial = lazy(() => import("./pages/DaoParticipationTutorial"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const SocialBanner = lazy(() => import("./pages/SocialBanner"));
const SetupStripeProducts = lazy(() => import("./pages/SetupStripeProducts"));
const StripeDiagnostic = lazy(() => import("./pages/StripeDiagnostic"));
const WebThreeGamingDefiConvergence = lazy(() => import("./pages/WebThreeGamingDefiConvergence"));
const DefaiRevolution2025 = lazy(() => import("./pages/DefaiRevolution2025"));
const DefiRegulationAmlIntegration = lazy(() => import("./pages/DefiRegulationAmlIntegration"));
const LiquidStakingTokens2025 = lazy(() => import("./pages/LiquidStakingTokens2025"));
const StablecoinsDefiInfrastructure2025 = lazy(() => import("./pages/StablecoinsDefiInfrastructure2025"));
const WhyMostPeopleLoseCrypto = lazy(() => import("./pages/WhyMostPeopleLoseCrypto"));
const DefiMatured2025 = lazy(() => import("./pages/DefiMatured2025"));
const DefiVaultsExplained = lazy(() => import("./pages/DefiVaultsExplained"));
const PredictionMarketsDeFi2025 = lazy(() => import("./pages/PredictionMarketsDeFi2025"));
const RwaOvertakesDex2025 = lazy(() => import("./pages/RwaOvertakesDex2025"));
const AdminStoreDashboard = lazy(() => import("./pages/AdminStoreDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Raffles = lazy(() => import("./pages/Raffles"));
const RaffleHistory = lazy(() => import("./pages/RaffleHistory"));
const AwarenessBlueprintLanding = lazy(() => import("./pages/AwarenessBlueprintLanding"));
const AdLanding = lazy(() => import("./pages/AdLanding"));
const UploadResourceFile = lazy(() => import("./pages/UploadResourceFile"));
const VaultAccess = lazy(() => import("./pages/VaultAccess"));
const VaultDepositTutorial = lazy(() => import("./pages/VaultDepositTutorial"));
const VaultWithdrawalTutorial = lazy(() => import("./pages/VaultWithdrawalTutorial"));
const Earn = lazy(() => import("./pages/Earn"));
const ReferralTerms = lazy(() => import("./pages/ReferralTerms"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const MiniGames = lazy(() => import("./pages/MiniGames"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const CheckoutCancel = lazy(() => import("./pages/CheckoutCancel"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Wrapper component to provide location key for page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Use a stable key for course module navigation to prevent remounting and maintain state (like fullscreen)
  const getStableKey = () => {
    if (location.pathname.startsWith('/courses/') && location.pathname.includes('/module/')) {
      const parts = location.pathname.split('/');
      // Return key as /courses/:id/module for all modules in same course
      // This prevents the entire Routes tree from remounting when navigating between modules
      return parts.slice(0, 4).join('/');
    }
    return location.pathname;
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location} key={getStableKey()}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/philosophy" element={<PageTransition><Philosophy /></PageTransition>} />
        <Route path="/institutional" element={<PageTransition><Institutional /></PageTransition>} />
        <Route path="/courses" element={<PageTransition><Courses /></PageTransition>} />
        <Route path="/courses/:courseId" element={<PageTransition><CourseDetail /></PageTransition>} />
        <Route path="/courses/:courseId/module/:moduleId" element={<PageTransition><ModuleViewer /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:page(\\d+)" element={<Navigate to="/blog" replace />} />
        <Route path="/blog/defi-regulation-aml-integration" element={<PageTransition><DefiRegulationAmlIntegration /></PageTransition>} />
        <Route path="/blog/web3-gaming-defi-convergence-2025" element={<PageTransition><WebThreeGamingDefiConvergence /></PageTransition>} />
        <Route path="/blog/defai-revolution-2025" element={<PageTransition><DefaiRevolution2025 /></PageTransition>} />
        <Route path="/blog/liquid-staking-tokens-2025" element={<PageTransition><LiquidStakingTokens2025 /></PageTransition>} />
        <Route path="/blog/stablecoins-defi-infrastructure-2025" element={<PageTransition><StablecoinsDefiInfrastructure2025 /></PageTransition>} />
        <Route path="/blog/why-most-people-lose-crypto" element={<PageTransition><WhyMostPeopleLoseCrypto /></PageTransition>} />
        <Route path="/blog/defi-matured-2025" element={<PageTransition><DefiMatured2025 /></PageTransition>} />
        <Route path="/blog/defi-vaults-explained" element={<PageTransition><DefiVaultsExplained /></PageTransition>} />
        <Route path="/blog/prediction-markets-defi-2025" element={<PageTransition><PredictionMarketsDeFi2025 /></PageTransition>} />
        <Route path="/blog/rwa-overtakes-dex-2025" element={<PageTransition><RwaOvertakesDex2025 /></PageTransition>} />
        <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
        <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
        <Route path="/tutorials" element={<PageTransition><Tutorials /></PageTransition>} />
        <Route path="/tutorials/wallet-setup" element={<PageTransition><WalletSetupTutorial /></PageTransition>} />
        <Route path="/tutorials/first-dex-swap" element={<PageTransition><FirstDexSwapTutorial /></PageTransition>} />
        <Route path="/tutorials/defi-calculators" element={<PageTransition><DefiCalculatorsTutorial /></PageTransition>} />
        <Route path="/tutorials/spotting-scams" element={<PageTransition><SpottingScamsTutorial /></PageTransition>} />
        <Route path="/tutorials/cross-chain-bridging" element={<PageTransition><CrossChainBridgingTutorial /></PageTransition>} />
        <Route path="/tutorials/advanced-defi-protocols" element={<PageTransition><AdvancedDefiProtocolsTutorial /></PageTransition>} />
        <Route path="/tutorials/portfolio-rebalancing" element={<PageTransition><PortfolioRebalancingTutorial /></PageTransition>} />
        <Route path="/tutorials/portfolio-tracking" element={<PageTransition><PortfolioTrackingTutorial /></PageTransition>} />
        <Route path="/tutorials/liquidity-pools" element={<PageTransition><LiquidityPoolBasicsTutorial /></PageTransition>} />
        <Route path="/tutorials/reading-defi-metrics" element={<PageTransition><ReadingDefiMetricsTutorial /></PageTransition>} />
        <Route path="/tutorials/risk-assessment" element={<PageTransition><RiskAssessmentTutorial /></PageTransition>} />
        <Route path="/tutorials/chart-reading" element={<PageTransition><ChartReadingTutorial /></PageTransition>} />
        <Route path="/tutorials/nft-defi" element={<PageTransition><NftDefiTutorial /></PageTransition>} />
        <Route path="/tutorials/dao-participation" element={<PageTransition><DaoParticipationTutorial /></PageTransition>} />
        <Route path="/store" element={<PageTransition><Store /></PageTransition>} />
        <Route path="/store/merchandise/:productId" element={<PageTransition><MerchandiseDetail /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/signin" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/subscription" element={<PageTransition><Subscription /></PageTransition>} />
        <Route path="/awareness-blueprint" element={<PageTransition><AwarenessBlueprintLanding /></PageTransition>} />
        <Route path="/start" element={<PageTransition><AdLanding /></PageTransition>} />
        <Route path="/admin/upload-resource" element={
          <ProtectedRoute requireRole="admin">
            <PageTransition><UploadResourceFile /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/profile/:userId" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/social-banner" element={<PageTransition><SocialBanner /></PageTransition>} />
        <Route path="/setup-stripe-products" element={
          <ProtectedRoute requireRole="admin">
            <PageTransition><SetupStripeProducts /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/stripe-diagnostic" element={
          <ProtectedRoute requireRole="admin">
            <PageTransition><StripeDiagnostic /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/admin/email-logs" element={
          <ProtectedRoute requireRole="admin">
            <PageTransition><EmailLogsAdmin /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/admin/store" element={
          <ProtectedRoute requireRole="admin">
            <PageTransition><AdminStoreDashboard /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requireRole="admin">
            <PageTransition><AdminDashboard /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/raffles" element={<PageTransition><Raffles /></PageTransition>} />
        <Route path="/raffle-history" element={<PageTransition><RaffleHistory /></PageTransition>} />
        <Route path="/earn" element={<PageTransition><Earn /></PageTransition>} />
        <Route path="/referral-terms" element={<PageTransition><ReferralTerms /></PageTransition>} />
        <Route path="/roadmap" element={<PageTransition><Roadmap /></PageTransition>} />
        <Route path="/mini-games" element={<PageTransition><MiniGames /></PageTransition>} />
        <Route path="/vault-access" element={<PageTransition><VaultAccess /></PageTransition>} />
        <Route path="/vault-deposit-guide" element={<PageTransition><VaultDepositTutorial /></PageTransition>} />
        <Route path="/vault-withdrawal-guide" element={<PageTransition><VaultWithdrawalTutorial /></PageTransition>} />
        <Route path="/checkout/success" element={<PageTransition><CheckoutSuccess /></PageTransition>} />
        <Route path="/checkout/cancel" element={<PageTransition><CheckoutCancel /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  // Handle domain and protocol redirects in production only
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    
    // Redirect 3rdeyeadvisors.com (without "the") to the3rdeyeadvisors.com
    if (hostname === '3rdeyeadvisors.com' || hostname === 'www.3rdeyeadvisors.com') {
      const redirectUrl = `https://the3rdeyeadvisors.com${pathname}${search}${hash}`;
      window.location.replace(redirectUrl);
      return;
    }
    
    // Ensure HTTPS on the3rdeyeadvisors.com domain
    if (hostname.endsWith('the3rdeyeadvisors.com') && protocol === 'http:') {
      const redirectUrl = `https://${hostname}${pathname}${search}${hash}`;
      window.location.replace(redirectUrl);
    }
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider>
          <TooltipProvider>
            <CartProvider>
              <AuthProvider>
                <SubscriptionProvider>
                  <ProgressProvider>
                    <PointsProvider>
                      <SecurityHeaders />
                      <ReloadPrompt />
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <Layout>
                          <AnimatedRoutes />
                        </Layout>
                      </BrowserRouter>
                    </PointsProvider>
                  </ProgressProvider>
                </SubscriptionProvider>
              </AuthProvider>
            </CartProvider>
          </TooltipProvider>
        </ThirdwebProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
