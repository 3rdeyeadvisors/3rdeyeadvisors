import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';
import { MobileCarouselWrapper } from '@/components/MobileCarouselWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, PieChart as PieChartIcon, Activity, Loader2, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface DefiProtocol {
  id: string;
  name: string;
  tvl: number;
  change_1d: number;
  change_7d: number;
  category: string;
}

interface DefiData {
  totalTvl: number;
  totalVolume24h: number;
  averageYield: number;
  protocols: DefiProtocol[];
  historicalData: Array<{
    date: string;
    totalTvl: number;
    volume: number;
    yield: number;
  }>;
  riskDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

// Deterministic pseudo-random based on seed (for consistent results)
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate deterministic trend bars based on protocol data
const generateTrendBars = (protocolId: string, change7d: number, barCount: number): number[] => {
  const bars: number[] = [];
  const isPositive = change7d >= 0;
  const baseHeight = isPositive ? 12 : 8;
  const changeImpact = Math.abs(change7d) / 10; // Normalize change impact
  
  // Create a seed from protocol ID
  let seed = 0;
  for (let i = 0; i < protocolId.length; i++) {
    seed += protocolId.charCodeAt(i);
  }
  
  for (let i = 0; i < barCount; i++) {
    // Deterministic height based on position, protocol seed, and trend direction
    const variation = seededRandom(seed + i * 100);
    const trendFactor = isPositive 
      ? 0.5 + (i / barCount) * 0.5 // Upward trend
      : 0.5 + ((barCount - 1 - i) / barCount) * 0.5; // Downward trend
    
    const height = baseHeight * trendFactor + variation * 8 * (1 + changeImpact);
    bars.push(Math.max(3, Math.min(24, height)));
  }
  
  return bars;
};

// Fallback data in case of API errors (deterministic, no Math.random)
const generateFallbackData = (): DefiData => {
  const historicalData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    // Deterministic variations based on day index
    const tvlVariation = 0.95 + seededRandom(i) * 0.1;
    const volumeVariation = 0.8 + seededRandom(i + 100) * 0.4;
    const yieldVariation = 0.9 + seededRandom(i + 200) * 0.2;
    
    return {
      date: date.toISOString().split('T')[0],
      totalTvl: 200000000000 * tvlVariation,
      volume: 50000000000 * volumeVariation,
      yield: 8.5 * yieldVariation
    };
  });

  const protocols: DefiProtocol[] = [
    { id: 'lido', name: 'Lido', tvl: 32000000000, change_1d: 2.1, change_7d: 5.3, category: 'Liquid Staking' },
    { id: 'aave', name: 'Aave', tvl: 18000000000, change_1d: -1.2, change_7d: 3.1, category: 'Lending' },
    { id: 'makerdao', name: 'MakerDAO', tvl: 15000000000, change_1d: 0.8, change_7d: -2.1, category: 'CDP' },
    { id: 'uniswap', name: 'Uniswap', tvl: 12000000000, change_1d: 1.5, change_7d: 4.2, category: 'DEX' },
    { id: 'compound', name: 'Compound', tvl: 8000000000, change_1d: -0.5, change_7d: 1.8, category: 'Lending' },
    { id: 'convex', name: 'Convex', tvl: 6500000000, change_1d: 3.2, change_7d: 8.1, category: 'Yield' },
    { id: 'curve', name: 'Curve', tvl: 5200000000, change_1d: 1.8, change_7d: 2.9, category: 'DEX' },
    { id: 'pancakeswap', name: 'PancakeSwap', tvl: 4800000000, change_1d: 2.5, change_7d: 6.7, category: 'DEX' }
  ];

  const riskDistribution = [
    { name: 'Liquid Staking', value: 38, color: '#06b6d4' },
    { name: 'Lending', value: 31, color: '#8b5cf6' },
    { name: 'DEX', value: 18, color: '#10b981' },
    { name: 'CDP', value: 8, color: '#f59e0b' },
    { name: 'Yield', value: 5, color: '#84cc16' }
  ];

  return {
    totalTvl: 200000000000,
    totalVolume24h: 50000000000,
    averageYield: 8.5,
    protocols,
    historicalData,
    riskDistribution
  };
};

// Cache key for localStorage
const DEFI_DATA_CACHE_KEY = 'defi-charts-cached-data';

// Load cached data from localStorage
const loadCachedData = (): DefiData | null => {
  try {
    const cached = localStorage.getItem(DEFI_DATA_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed to load cached DeFi data:', e);
  }
  return null;
};

// Save data to localStorage cache
const saveCachedData = (data: DefiData) => {
  try {
    localStorage.setItem(DEFI_DATA_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to cache DeFi data:', e);
  }
};

export const DefiCharts = () => {
  const { toast } = useToast();
  const [data, setData] = useState<DefiData | null>(() => loadCachedData());
  const [loading, setLoading] = useState(() => !loadCachedData()); // Only show loading if no cache
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'totalTvl' | 'volume' | 'yield'>('totalTvl');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // New states for countdown and cooldown
  const [nextRefreshTime, setNextRefreshTime] = useState<Date | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [refreshCooldown, setRefreshCooldown] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDefiData = async (forceRefresh: boolean = false, isRetry: boolean = false) => {
    try {
      // Only show loading spinner if we don't have any data yet
      if (!data) {
        setLoading(true);
      }
      setError(null);
      
      // Add force parameter if manual refresh is requested
      const functionName = forceRefresh ? 'fetch-defi-data?force=1' : 'fetch-defi-data';
      const { data: response, error: functionError } = await supabase.functions.invoke(functionName);
      
      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error('Failed to fetch DeFi data');
      }
      
      if (response && response.protocols && Array.isArray(response.protocols)) {
        setData(response);
        saveCachedData(response); // Cache successful response
        setLastUpdated(new Date());
        setRetryCount(0); // Reset retry count on success
        
        // Set next refresh time and reset countdown
        const nextRefresh = new Date(Date.now() + 300000); // 5 minutes from now
        setNextRefreshTime(nextRefresh);
        
        // Show success toast for manual refresh
        if (forceRefresh) {
          toast({
            title: "Data refreshed successfully",
            description: `Updated at ${new Date().toLocaleTimeString()}`,
            variant: "default"
          });
          
          // Start cooldown
          setRefreshCooldown(10);
        }
      } else {
        console.warn('Invalid response structure');
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      console.error('Error fetching DeFi data:', err);
      
      // Auto-retry up to 3 times on initial load failure
      if (!isRetry && retryCount < 3 && !data) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchDefiData(forceRefresh, true), 2000); // Retry after 2 seconds
        return;
      }
      
      // Use cached data if available, otherwise use fallback
      const cachedData = loadCachedData();
      if (cachedData && !data) {
        setError('Using cached data due to network issues.');
        setData(cachedData);
      } else if (!data) {
        setError('Using sample data : no cached data available.');
        setData(generateFallbackData());
      } else {
        // We already have data, just show the error message
        setError('Network issue : showing previous data.');
      }
      
      // Set next refresh time
      const nextRefresh = new Date(Date.now() + 300000); // 5 minutes from now
      setNextRefreshTime(nextRefresh);
      
      // Show error toast for manual refresh
      if (forceRefresh) {
        toast({
          title: "Refresh failed",
          description: cachedData ? "Using cached data due to network issues" : "Using sample data",
          variant: "destructive"
        });
        
        // Start cooldown even on error
        setRefreshCooldown(10);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch fresh data (will show cached data immediately if available)
    fetchDefiData();
    
    // Set initial next refresh time
    const nextRefresh = new Date(Date.now() + 300000); // 5 minutes from now
    setNextRefreshTime(nextRefresh);
    
    // Update data every 5 minutes (300000ms)
    const interval = setInterval(() => {
      fetchDefiData();
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      if (nextRefreshTime) {
        const secondsUntilRefresh = Math.max(0, Math.floor((nextRefreshTime.getTime() - Date.now()) / 1000));
        setCountdownSeconds(secondsUntilRefresh);
        
        // Reset next refresh time when countdown reaches 0
        if (secondsUntilRefresh === 0) {
          const nextRefresh = new Date(Date.now() + 300000);
          setNextRefreshTime(nextRefresh);
        }
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [nextRefreshTime]);

  // Button cooldown effect
  useEffect(() => {
    if (refreshCooldown > 0) {
      const cooldownInterval = setInterval(() => {
        setRefreshCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      
      return () => clearInterval(cooldownInterval);
    }
  }, [refreshCooldown]);

  // Desktop media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = () => setIsDesktop(mediaQuery.matches);
    
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addListener(handleChange);
    
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Carousel slide tracking
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);
    onSelect();

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6 mobile-typography-center">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Loading real-time DeFi data...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Category colors for protocol visualization - using design system tokens
  const categoryColors: { [key: string]: string } = {
    'Liquid Staking': 'hsl(var(--primary))', // Primary brand color
    'Lending': 'hsl(var(--awareness))', // Green awareness color  
    'DEX': 'hsl(var(--accent))', // Accent color
    'CDP': 'hsl(var(--secondary))', // Secondary color
    'Yield': 'hsl(var(--destructive))', // Red destructive color
    'CEX': 'hsl(var(--muted-foreground))', // Muted gray
    'Bridge': 'hsl(215 100% 60%)', // Bright blue
    'Derivatives': 'hsl(330 80% 65%)', // Pink
    'Insurance': 'hsl(84 81% 44%)', // Lime green
    'Restaking': 'hsl(24 95% 53%)', // Orange variant
    'RWA': 'hsl(168 76% 42%)', // Teal
    'Gaming': 'hsl(271 91% 65%)', // Purple violet
    'NFT Marketplace': 'hsl(348 83% 47%)', // Rose red
    'Synthetics': 'hsl(142 76% 36%)', // Emerald green
    'Options': 'hsl(262 83% 58%)', // Blue violet
    'Prediction Market': 'hsl(199 89% 48%)', // Sky blue
    'Stablecoin': 'hsl(88 50% 53%)', // Stable green
    'Launchpad': 'hsl(0 84% 60%)', // Launch red
    'Perpetuals': 'hsl(258 90% 66%)', // Deep purple
    'SocialFi': 'hsl(322 84% 57%)', // Social pink
    'Privacy': 'hsl(220 13% 18%)', // Dark gray
    'Oracle': 'hsl(160 84% 39%)', // Oracle green
    'DAO': 'hsl(271 81% 56%)', // DAO purple
    'Analytics': 'hsl(188 95% 68%)', // Analytics cyan
    'Cross Chain': 'hsl(20 90% 48%)', // Chain orange
    'Farm': 'hsl(142 71% 45%)', // Farm green
    'Algo-Stables': 'hsl(173 80% 40%)', // Algorithm teal
    'Indexes': 'hsl(25 95% 39%)', // Index brown
    'Reserve Currency': 'hsl(329 69% 52%)', // Reserve pink
    'default': 'hsl(var(--muted-foreground))' // Default using theme
  };

  const getProtocolColor = (category: string) => {
    return categoryColors[category] || categoryColors.default;
  };

  const getCurrentTVL = () => data.historicalData[data.historicalData.length - 1]?.totalTvl || data.totalTvl;
  const getPreviousTVL = () => data.historicalData[data.historicalData.length - 2]?.totalTvl || data.totalTvl;
  const getTVLChange = () => ((getCurrentTVL() - getPreviousTVL()) / getPreviousTVL() * 100).toFixed(2);

  // MobileCarouselWrapper is now imported from a separate stable component

  return (
    <div className="space-y-6 mobile-typography-center">
      {/* Status badges and refresh button */}
      <div className="flex flex-col items-center gap-3">
        <TooltipProvider>
          {/* Live Data badge on top, centered */}
          <Badge variant="secondary" className={`${loading ? "animate-pulse" : ""}`}>
            <Activity className="w-4 h-4 mr-2" />
            {loading ? 'Updating...' : 'Live Data'}
          </Badge>
          
          {/* Next refresh and button row */}
          <div className="flex flex-wrap gap-2 justify-center">
            <UITooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  <Clock className="w-4 h-4 mr-2" />
                  {countdownSeconds > 0 ? 
                    `Next refresh in ${Math.floor(countdownSeconds / 60)}:${(countdownSeconds % 60).toString().padStart(2, '0')}` :
                    (lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Updates every 5 min')
                  }
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Data refreshes automatically every 5 minutes</p>
                {lastUpdated && <p>Last refresh: {lastUpdated.toLocaleString()}</p>}
              </TooltipContent>
            </UITooltip>
            <UITooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDefiData(true)}
                  disabled={loading || refreshCooldown > 0}
                  className="gap-2 flex items-center justify-center min-h-[44px]"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="whitespace-nowrap">
                    {refreshCooldown > 0 ? `Wait ${refreshCooldown}s` : 'Refresh Now'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {refreshCooldown > 0 ? (
                  <p>Please wait {refreshCooldown} seconds before refreshing again</p>
                ) : (
                  <p>Force refresh data immediately</p>
                )}
              </TooltipContent>
            </UITooltip>
          </div>
        </TooltipProvider>
      </div>
      
      {error && (
        <p className="text-amber-500 text-sm text-center">{error}</p>
      )}

      {/* Mobile View - Only show key metrics */}
      <div className="block md:hidden space-y-4">
        <Card>
          <CardHeader className="flex flex-col items-center justify-center space-y-2 pb-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-center">Total Value Locked</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(getCurrentTVL())}</div>
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              {parseFloat(getTVLChange()) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-awareness mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive mr-1" />
              )}
              <span className={parseFloat(getTVLChange()) >= 0 ? 'text-awareness' : 'text-destructive'}>
                {getTVLChange()}%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        
        {/* Mobile Analytics Notice */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Explore Full Analytics on Desktop
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Access comprehensive charts, risk analysis, and detailed protocol data on desktop.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop View - Show all metrics */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getCurrentTVL())}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {parseFloat(getTVLChange()) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-awareness mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive mr-1" />
              )}
              <span className={parseFloat(getTVLChange()) >= 0 ? 'text-awareness' : 'text-destructive'}>
                {getTVLChange()}%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalVolume24h)}
            </div>
            <p className="text-xs text-muted-foreground">Trading volume across protocols</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Yield</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageYield.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Annual percentage yield</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart - Hidden on mobile */}
      <Card className="hidden md:block overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Market Trends</CardTitle>
                <CardDescription className="text-sm">30-day performance across key DeFi metrics</CardDescription>
              </div>
            </div>
            <div className="flex gap-1.5 p-1 bg-muted/50 rounded-lg">
              <Button
                variant={selectedMetric === 'totalTvl' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('totalTvl')}
                className={`text-xs px-3 ${selectedMetric === 'totalTvl' ? 'shadow-sm' : 'hover:bg-background/80'}`}
              >
                <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                TVL
              </Button>
              <Button
                variant={selectedMetric === 'volume' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('volume')}
                className={`text-xs px-3 ${selectedMetric === 'volume' ? 'shadow-sm' : 'hover:bg-background/80'}`}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Volume
              </Button>
              <Button
                variant={selectedMetric === 'yield' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric('yield')}
                className={`text-xs px-3 ${selectedMetric === 'yield' ? 'shadow-sm' : 'hover:bg-background/80'}`}
              >
                <Percent className="w-3.5 h-3.5 mr-1.5" />
                Yield
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={isDesktop ? 320 : 250}>
            <AreaChart data={data.historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="marketTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                fontSize={11}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))', strokeOpacity: 0.5 }}
                dy={8}
              />
              <YAxis 
                tickFormatter={(value) => 
                  selectedMetric === 'yield' ? `${value.toFixed(1)}%` : formatCurrency(value)
                }
                fontSize={11}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                dx={-5}
                width={70}
              />
              <Tooltip 
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.5 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value as number;
                    const date = new Date(label);
                    return (
                      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3 min-w-[160px]">
                        <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                          <span className="text-sm text-muted-foreground">
                            {selectedMetric === 'totalTvl' ? 'TVL' : selectedMetric === 'volume' ? 'Volume' : 'Avg Yield'}:
                          </span>
                          <span className="text-sm font-bold text-foreground ml-auto">
                            {selectedMetric === 'yield' ? `${value.toFixed(2)}%` : formatCurrency(value)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#marketTrendGradient)"
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--primary))', 
                  stroke: 'hsl(var(--background))', 
                  strokeWidth: 3,
                  filter: 'url(#glow)'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protocol Rankings */}
        <Card className="flex flex-col">
          <CardHeader className="text-center md:text-left flex-shrink-0">
            <CardTitle className="flex items-center justify-center md:justify-start">
              <BarChart3 className="w-5 h-5 mr-2" />
              Top DeFi Protocols
            </CardTitle>
            <CardDescription>Ranked by Total Value Locked with 7-day trends</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            {data?.protocols && data.protocols.length > 0 ? (
              <>
                {/* Desktop Layout - Carousel with slide indicators */}
                <div className="hidden md:block flex-1 flex flex-col">
                  <div className="flex-1 min-h-0">
                    <Carousel className="h-full" setApi={setCarouselApi}>
                      <CarouselContent>
                        {Array.from({ length: Math.ceil(data.protocols.length / 4) }, (_, slideIndex) => (
                          <CarouselItem key={slideIndex}>
                            <div className="space-y-4 overflow-y-auto h-full pr-2">
                              {data.protocols.slice(slideIndex * 4, (slideIndex + 1) * 4).map((protocol, index) => (
                                <div key={protocol.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center justify-between gap-3">
                                    {/* Protocol info */}
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                                        {slideIndex * 4 + index + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-lg truncate">{protocol.name}</span>
                                          <Badge 
                                            variant="outline" 
                                            className="text-xs flex-shrink-0"
                                            style={{ 
                                              borderColor: getProtocolColor(protocol.category),
                                              color: getProtocolColor(protocol.category),
                                              backgroundColor: `${getProtocolColor(protocol.category)}10`
                                            }}
                                          >
                                            {protocol.category}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          TVL: <span className="font-mono font-semibold">{formatCurrency(protocol.tvl)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Performance data */}
                                    <div className="flex items-center gap-4">
                                      <div className="flex gap-4">
                                        <div className="text-center">
                                          <div className="text-xs text-muted-foreground mb-1">24h</div>
                                          <div className={`flex items-center text-sm font-mono ${protocol.change_1d >= 0 ? 'text-awareness' : 'text-destructive'}`}>
                                            {protocol.change_1d >= 0 ? (
                                              <TrendingUp className="w-3 h-3 mr-1" />
                                            ) : (
                                              <TrendingDown className="w-3 h-3 mr-1" />
                                            )}
                                            {protocol.change_1d >= 0 ? '+' : ''}{protocol.change_1d.toFixed(1)}%
                                          </div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-xs text-muted-foreground mb-1">7d</div>
                                          <div className={`flex items-center text-sm font-mono ${protocol.change_7d >= 0 ? 'text-awareness' : 'text-destructive'}`}>
                                            {protocol.change_7d >= 0 ? (
                                              <TrendingUp className="w-3 h-3 mr-1" />
                                            ) : (
                                              <TrendingDown className="w-3 h-3 mr-1" />
                                            )}
                                            {protocol.change_7d >= 0 ? '+' : ''}{protocol.change_7d.toFixed(1)}%
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Visual trend line - deterministic based on protocol data */}
                                      <div className="flex w-16 h-8 items-end justify-between">
                                        {generateTrendBars(protocol.id, protocol.change_7d, 7).map((height, i) => (
                                          <div
                                            key={i}
                                            className="w-1.5 rounded-sm"
                                            style={{ 
                                              height: `${height}px`,
                                              backgroundColor: getProtocolColor(protocol.category),
                                              opacity: 0.4 + (i * 0.08)
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      
                      {/* Navigation controls inside the carousel */}
                      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                        <CarouselPrevious />
                        <span className="text-xs text-muted-foreground px-2">
                          {currentSlide + 1} of {Math.ceil(data.protocols.length / 4)}
                        </span>
                        <CarouselNext />
                      </div>
                    </Carousel>
                  </div>
                  
                  {/* Progress Bar Indicator */}
                  <div className="space-y-3 mt-16 flex-shrink-0">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="flex h-full rounded-full overflow-hidden">
                        {Array.from({ length: Math.ceil(data.protocols.length / 4) }, (_, index) => (
                          <button
                            key={index}
                            onClick={() => carouselApi?.scrollTo(index)}
                            className={`flex-1 h-full transition-colors border-r border-background last:border-r-0 ${
                              currentSlide === index ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                          >
                            <span className="sr-only">Go to slide {index + 1} of {Math.ceil(data.protocols.length / 4)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Carousel */}
                <MobileCarouselWrapper>
                  {data.protocols.slice(0, 8).map((protocol, index) => (
                    <div key={protocol.id} className="p-3 rounded-lg border bg-card text-center">
                      <div className="flex flex-col items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="font-semibold">{protocol.name}</div>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: getProtocolColor(protocol.category),
                            color: getProtocolColor(protocol.category),
                            backgroundColor: `${getProtocolColor(protocol.category)}10`
                          }}
                        >
                          {protocol.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground text-center">
                          TVL: <span className="font-mono font-semibold text-foreground">{formatCurrency(protocol.tvl)}</span>
                        </div>
                        
                        <div className="flex justify-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">24h</div>
                            <div className={`font-mono font-medium ${protocol.change_1d >= 0 ? 'text-awareness' : 'text-destructive'}`}>
                              {protocol.change_1d >= 0 ? '+' : ''}{protocol.change_1d.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">7d</div>
                            <div className={`font-mono font-medium ${protocol.change_7d >= 0 ? 'text-awareness' : 'text-destructive'}`}>
                              {protocol.change_7d >= 0 ? '+' : ''}{protocol.change_7d.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Mini trend visualization - deterministic */}
                        <div className="flex w-full h-6 items-end justify-center gap-0.5 mx-auto max-w-48">
                          {generateTrendBars(protocol.id, protocol.change_7d, 12).map((height, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-sm"
                              style={{ 
                                height: `${height}px`,
                                backgroundColor: getProtocolColor(protocol.category),
                                opacity: 0.3 + (i * 0.05)
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </MobileCarouselWrapper>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Protocol data loading...</p>
                  {error && <p className="text-sm mt-2">{error}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Distribution - Hidden on mobile */}
        <Card className="hidden md:flex md:flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChartIcon className="w-4 h-4 text-primary" />
              </div>
              Category Distribution
            </CardTitle>
            <CardDescription className="text-sm">TVL breakdown by category (Top 10 Protocols)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex items-center justify-center">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-8 w-full max-w-2xl mx-auto">
              {/* Chart Container with center label */}
              <div className="relative flex justify-center flex-shrink-0">
                <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius="65%"
                        outerRadius="90%"
                        paddingAngle={3}
                        dataKey="value"
                        label={false}
                        labelLine={false}
                        strokeWidth={0}
                      >
                        {data.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'TVL Share']} 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Center label - show actual total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-foreground">
                    {data.riskDistribution.reduce((sum, item) => sum + item.value, 0)}%
                  </span>
                  <span className="text-xs text-muted-foreground">Top 10 TVL</span>
                </div>
              </div>
              
              {/* Legend with progress bars */}
              <div className="flex-1 min-w-0 space-y-2.5 max-w-xs">
                {data.riskDistribution.map((entry, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium text-foreground">{entry.name}</span>
                      </div>
                      <span className="text-sm font-mono font-semibold text-foreground">{entry.value}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${entry.value}%`, 
                          backgroundColor: entry.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Details Table */}
      <Card>
        <CardHeader className="text-center md:text-left">
          <CardTitle>Protocol Performance</CardTitle>
          <CardDescription>Detailed metrics for top DeFi protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-consciousness text-sm">Protocol</th>
                  <th className="text-right py-4 px-4 font-consciousness text-sm">TVL</th>
                  <th className="text-right py-4 px-4 font-consciousness text-sm">1D Change</th>
                  <th className="text-right py-4 px-4 font-consciousness text-sm">7D Change</th>
                  <th className="text-right py-4 px-4 font-consciousness text-sm">Category</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {data.protocols.slice(0, 8).map((protocol, index) => (
                  <tr key={protocol.id} className="border-b border-white/5 md:border-white/10 hover:bg-white/5 transition-colors block md:table-row mb-4 md:mb-0 p-4 md:p-0 rounded-2xl md:rounded-none bg-white/2 md:bg-transparent">
                    <td className="py-2 md:py-4 px-0 md:px-4 block md:table-cell">
                      <div className="flex items-center justify-between md:justify-start gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                            {index + 1}
                          </div>
                          <span className="font-consciousness font-semibold text-white">{protocol.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] md:hidden"
                          style={{
                            borderColor: getProtocolColor(protocol.category),
                            color: getProtocolColor(protocol.category),
                            backgroundColor: `${getProtocolColor(protocol.category)}10`
                          }}
                        >
                          {protocol.category}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-2 md:py-4 px-0 md:px-4 block md:table-cell">
                      <div className="flex justify-between md:justify-end items-center">
                        <span className="text-xs text-white/40 md:hidden font-body">TVL</span>
                        <span className="font-mono font-medium text-white">{formatCurrency(protocol.tvl)}</span>
                      </div>
                    </td>
                    <td className="py-2 md:py-4 px-0 md:px-4 block md:table-cell">
                      <div className="flex justify-between md:justify-end items-center">
                        <span className="text-xs text-white/40 md:hidden font-body">1D Change</span>
                        <span className={`font-mono font-medium ${protocol.change_1d >= 0 ? 'text-awareness' : 'text-destructive'}`}>
                          {protocol.change_1d >= 0 ? '+' : ''}{protocol.change_1d.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 md:py-4 px-0 md:px-4 block md:table-cell">
                      <div className="flex justify-between md:justify-end items-center">
                        <span className="text-xs text-white/40 md:hidden font-body">7D Change</span>
                        <span className={`font-mono font-medium ${protocol.change_7d >= 0 ? 'text-awareness' : 'text-destructive'}`}>
                          {protocol.change_7d >= 0 ? '+' : ''}{protocol.change_7d.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 md:py-4 px-0 md:px-4 hidden md:table-cell text-right">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: getProtocolColor(protocol.category),
                          color: getProtocolColor(protocol.category)
                        }}
                      >
                        {protocol.category}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
