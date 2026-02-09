import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Star, 
  AlertTriangle,
  Coins,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  marketCapRank: number;
  stakingApy: number | null;
}

interface CryptoPricesResponse {
  success: boolean;
  data: {
    top10: CryptoData[];
    recommended: CryptoData[];
  };
  cached: boolean;
  stale?: boolean;
  lastUpdated: string;
  error?: string;
}

const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 1) {
    return `$${price.toFixed(2)}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(6)}`;
  }
};

const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  return `$${marketCap.toLocaleString()}`;
};

const CryptoCard = ({ crypto, isRecommended = false }: { crypto: CryptoData; isRecommended?: boolean }) => {
  const isPositive = crypto.priceChange24h >= 0;
  
  return (
    <Card className={`p-4 bg-card/80 border-border hover:border-primary/50 transition-all duration-300 ${isRecommended ? 'ring-1 ring-primary/30' : ''}`}>
      {/* Header: Center on mobile, left-align on desktop */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between mb-3 gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <img 
            src={crypto.image} 
            alt={`${crypto.name} icon`}
            className="w-10 h-10 sm:w-8 sm:h-8 rounded-full"
            loading="lazy"
            width={32}
            height={32}
          />
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <span className="font-consciousness font-semibold text-foreground">{crypto.symbol}</span>
              {isRecommended && (
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              )}
            </div>
            <span className="text-xs text-muted-foreground font-consciousness truncate max-w-[120px] sm:max-w-[80px] block">
              {crypto.name}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          #{crypto.marketCapRank}
        </Badge>
      </div>
      
      {/* Price and details: All centered on mobile */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="text-2xl sm:text-xl font-consciousness font-bold text-foreground">
          {formatPrice(crypto.currentPrice)}
        </div>
        
        {/* Price change and APY: Stack on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-0">
          <div className={`flex items-center gap-1 text-sm font-consciousness ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{isPositive ? '+' : ''}{crypto.priceChange24h?.toFixed(2) || '0.00'}%</span>
          </div>
          
          {crypto.stakingApy && (
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-xs">
              {crypto.stakingApy}% APY
            </Badge>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground font-consciousness">
          MCap: {formatMarketCap(crypto.marketCap)}
        </div>
      </div>
    </Card>
  );
};

const LoadingSkeleton = () => (
  <Card className="p-4 bg-card/80 border-border">
    <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between mb-3 gap-2 sm:gap-0">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <Skeleton className="w-10 h-10 sm:w-8 sm:h-8 rounded-full" />
        <div className="text-center sm:text-left">
          <Skeleton className="w-12 h-4 mb-1 mx-auto sm:mx-0" />
          <Skeleton className="w-16 h-3 mx-auto sm:mx-0" />
        </div>
      </div>
      <Skeleton className="w-8 h-5" />
    </div>
    <div className="text-center sm:text-left">
      <Skeleton className="w-24 h-7 mb-2 mx-auto sm:mx-0" />
      <Skeleton className="w-16 h-4 mx-auto sm:mx-0" />
    </div>
  </Card>
);

export const CryptoPricesWidget = () => {
  const [data, setData] = useState<CryptoPricesResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllTop10, setShowAllTop10] = useState(false);
  const [showAllRecommended, setShowAllRecommended] = useState(false);
  
  const isMobile = useIsMobile();

  const fetchPrices = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { data: responseData, error: fetchError } = await supabase.functions.invoke('fetch-crypto-prices');

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (responseData?.success) {
        setData(responseData.data);
        setLastUpdated(responseData.lastUpdated);
        setIsStale(responseData.stale || false);
      } else {
        throw new Error(responseData?.error || 'Failed to fetch prices');
      }
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    
    // Auto-refresh every 3 minutes to match cache duration
    const interval = setInterval(() => fetchPrices(), 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Limit displayed items on mobile - show only 1 by default for minimal scrolling
  const displayedTop10 = isMobile && !showAllTop10 ? data?.top10.slice(0, 1) : data?.top10;
  const displayedRecommended = isMobile && !showAllRecommended ? data?.recommended.slice(0, 1) : data?.recommended;

  if (loading) {
    return (
      <Card className="p-6 bg-card/60 border-border">
        {/* Loading Header - Centered on mobile */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Coins className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-2xl font-consciousness font-bold text-foreground">Live Crypto Prices</h2>
              <p className="text-sm text-muted-foreground font-consciousness">Loading market data...</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-consciousness font-semibold text-foreground">Top 10 by Market Cap</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array(isMobile ? 1 : 10).fill(0).map((_, i) => <LoadingSkeleton key={i} />)}
          </div>
        </div>
        
        <div>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <h3 className="text-lg font-consciousness font-semibold text-foreground">3EA Recommended</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array(isMobile ? 1 : 10).fill(0).map((_, i) => <LoadingSkeleton key={i} />)}
          </div>
        </div>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="p-6 bg-card/60 border-border">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-consciousness font-semibold text-foreground mb-2">
            Unable to Load Prices
          </h3>
          <p className="text-muted-foreground font-consciousness mb-4">{error}</p>
          <Button onClick={() => fetchPrices(true)} variant="outline" className="min-h-[52px]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/60 border-border">
      {/* Header - Fully centered on mobile */}
      <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Coins className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-consciousness font-bold text-foreground">Live Crypto Prices</h2>
            <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground font-consciousness">
              {lastUpdated && (
                <span>Updated at {formatLastUpdated(lastUpdated)}</span>
              )}
              {isStale && (
                <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                  Cached
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => fetchPrices(true)} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
          className="font-consciousness min-h-[52px] sm:min-h-0 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Top 10 Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-consciousness font-semibold text-foreground">Top 10 by Market Cap</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayedTop10?.map((crypto) => (
            <CryptoCard key={crypto.id} crypto={crypto} />
          ))}
        </div>
        
        {/* Show More/Less Toggle for Top 10 */}
        {isMobile && data?.top10 && data.top10.length > 1 && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 font-consciousness min-h-[52px]"
            onClick={() => setShowAllTop10(!showAllTop10)}
          >
            {showAllTop10 ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show More ({data.top10.length - 1} more)
              </>
            )}
          </Button>
        )}
      </div>

      {/* 3EA Recommended Section */}
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <h3 className="text-lg font-consciousness font-semibold text-foreground">3EA Recommended</h3>
          </div>
          <Badge variant="secondary" className="font-consciousness">Our Picks</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayedRecommended?.map((crypto) => (
            <CryptoCard key={crypto.id} crypto={crypto} isRecommended />
          ))}
        </div>
        
        {/* Show More/Less Toggle for Recommended */}
        {isMobile && data?.recommended && data.recommended.length > 1 && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 font-consciousness min-h-[52px]"
            onClick={() => setShowAllRecommended(!showAllRecommended)}
          >
            {showAllRecommended ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show More ({data.recommended.length - 1} more)
              </>
            )}
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground font-consciousness text-center">
          Prices powered by CoinGecko. Data refreshes every 3 minutes. 
          APY rates are approximate and subject to change. Not financial advice.
        </p>
      </div>
    </Card>
  );
};

export default CryptoPricesWidget;
