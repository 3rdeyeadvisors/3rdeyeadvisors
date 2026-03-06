import { DefiCharts } from '@/components/DefiCharts';
import { CryptoPricesWidget } from '@/components/CryptoPricesWidget';
import { TrendingUp, Activity, BarChart3, AlertTriangle } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero from '@/components/PageHero';

const Analytics = () => {
  return (
    <>
      <SEO 
        title="DeFi Analytics & Market Data: Real-Time Protocol Insights"
        description="Live DeFi analytics dashboard powered by DefiLlama API with real-time market data, yield farming insights, TVL tracking, and protocol performance metrics from Aave, Uniswap, and 200+ protocols."
        keywords="DeFi analytics, real-time DeFi data, DefiLlama API, yield farming analytics, TVL tracking, DeFi market insights, protocol analytics, crypto market data, DeFi charts, blockchain analytics, Aave data, Uniswap analytics"
        url="https://www.sentineldefi.online/analytics"
      />
      <div className="min-h-screen bg-transparent pt-20 pb-12">
        <PageHero
          eyebrow="Market Data"
          title="DeFi Analytics"
          subtitle="Live protocol data, yield opportunities, and market insights sourced directly from on-chain activity."
        />

        <div className="container mx-auto px-4 space-y-8">
          {/* Live Crypto Prices */}
          <CryptoPricesWidget />

          {/* Live Analytics Dashboard */}
          <DefiCharts />

          {/* Market Insights Card */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-consciousness font-bold text-white mb-2">
                  Market Data Disclaimer
                </h3>
                <p className="text-white/50 font-body leading-relaxed text-sm">
                  This data is sourced live from DefiLlama API and leading DeFi protocols for educational and informational purposes.
                  While the data represents real market conditions, it should not be used as the sole basis for investment decisions.
                  Always verify data from multiple sources and conduct your own research before making any financial decisions in the DeFi space.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;