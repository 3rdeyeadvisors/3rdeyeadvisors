import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache for storing API responses
let cachedData: { data: any; timestamp: number } | null = null;
const CACHE_DURATION_MS = 3 * 60 * 1000; // 3 minutes for fresher data

// Sentinel DeFi Recommended token IDs (CoinGecko format)
const RECOMMENDED_IDS = [
  'bitcoin',
  'ethereum', 
  'solana',
  'avalanche-2',
  'cardano',
  'near',
  'sui',
  'binancecoin',
  'uniswap',
  'chainlink',
  'cosmos',
  'arbitrum',
  'polygon-ecosystem-token',
  'tether',
  'usd-coin',
  'dai',
  'monero',
  'litecoin',
  'ripple',
  'hyperliquid'
];

// Staking APY data (approximate values from user's watchlist)
const STAKING_APY: Record<string, number> = {
  'solana': 4.25,
  'avalanche-2': 4.47,
  'cardano': 2.99,
  'cosmos': 14.68,
  'near': 5.0,
  'sui': 2.77,
  'polygon-ecosystem-token': 4.0,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    
    // Return cached data if still valid
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION_MS) {
      console.log('Returning cached crypto data');
      return new Response(JSON.stringify({
        success: true,
        data: cachedData.data,
        cached: true,
        cacheAge: Math.floor((now - cachedData.timestamp) / 1000),
        lastUpdated: new Date(cachedData.timestamp).toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Fetching fresh crypto data from CoinGecko');

    // Fetch top 50 coins by market cap (covers top 10 + our recommended list)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?' + new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: '100',
        page: '1',
        sparkline: 'false',
        price_change_percentage: '24h'
      }),
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const allCoins = await response.json();

    // Get top 10 by market cap
    const top10 = allCoins.slice(0, 10).map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      priceChange24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      stakingApy: STAKING_APY[coin.id] || null
    }));

    // Get recommended tokens
    const recommended = RECOMMENDED_IDS
      .map(id => allCoins.find((coin: any) => coin.id === id))
      .filter(Boolean)
      .map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        currentPrice: coin.current_price,
        priceChange24h: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
        stakingApy: STAKING_APY[coin.id] || null
      }));

    const responseData = {
      top10,
      recommended,
      allAvailableIds: allCoins.map((c: any) => c.id)
    };

    // Update cache
    cachedData = {
      data: responseData,
      timestamp: now
    };

    return new Response(JSON.stringify({
      success: true,
      data: responseData,
      cached: false,
      cacheAge: 0,
      lastUpdated: new Date(now).toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    
    // Return cached data if available, even if stale
    if (cachedData) {
      const nowFallback = Date.now();
      console.log('Returning stale cached data due to error');
      return new Response(JSON.stringify({
        success: true,
        data: cachedData.data,
        cached: true,
        stale: true,
        cacheAge: Math.floor((nowFallback - cachedData.timestamp) / 1000),
        lastUpdated: new Date(cachedData.timestamp).toISOString(),
        error: 'Using cached data due to API error'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch crypto prices',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
