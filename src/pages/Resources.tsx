import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Wallet, BarChart3, Shield, BookOpen, Globe, Download } from "lucide-react";
import DefiCalculators from "@/components/DefiCalculators";
import NewsletterSignup from "@/components/NewsletterSignup";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";

const Resources = () => {
  const resourceCategories = [
    {
      title: "Trusted Wallets",
      icon: Wallet,
      description: "Secure, beginner-friendly wallets for safe DeFi interaction",
      resources: [
        { name: "MetaMask", description: "Most popular and user-friendly browser wallet for Ethereum DeFi", url: "https://metamask.io", verified: true },
        { name: "Trust Wallet", description: "Mobile-first wallet with built-in DeFi browser and staking", url: "https://trustwallet.com", verified: true },
        { name: "Ledger Hardware Wallet", description: "Ultimate security for storing larger amounts long-term", url: "https://ledger.com", verified: true }
      ]
    },
    {
      title: "Portfolio Trackers",
      icon: BarChart3,
      description: "Track your DeFi positions across multiple chains and protocols",
      resources: [
        { name: "DeBank", description: "Clean, comprehensive multi-chain portfolio tracking", url: "https://debank.com", verified: true },
        { name: "Zapper", description: "Portfolio management with DeFi position entry/exit tools", url: "https://zapper.fi", verified: true },
        { name: "DeFiLlama", description: "Best source for protocol data and TVL tracking", url: "https://defillama.com", verified: true }
      ]
    },
    {
      title: "Beginner-Friendly DEXs",
      icon: Globe,
      description: "Decentralized exchanges perfect for first-time DeFi users",
      resources: [
        { name: "Uniswap", description: "Most trusted and liquid DEX on Ethereum", url: "https://uniswap.org", verified: true },
        { name: "PancakeSwap", description: "Popular Binance Smart Chain DEX with lower fees", url: "https://pancakeswap.finance", verified: true },
        { name: "1inch", description: "DEX aggregator that finds you the best swap rates", url: "https://1inch.io", verified: true }
      ]
    },
    {
      title: "Educational Resources",
      icon: BookOpen,
      description: "Practical guides and templates for financial planning",
      resources: [
        { name: "DeFi Security Guide", description: "Essential security steps before using any DeFi protocol: downloadable guide", url: "/resources/security-guide.pdf", verified: true }
      ]
    },
    {
      title: "Learning Resources",
      icon: Shield,
      description: "Official educational resources and deeper reading",
      resources: [
        { name: "CoinGecko Learn", description: "Comprehensive crypto and DeFi educational articles", url: "https://coinmarketcap.com/academy", verified: true },
        { name: "Ethereum.org DeFi Guide", description: "Official Ethereum Foundation DeFi documentation", url: "https://ethereum.org/defi", verified: true },
        { name: "Our Blog Articles", description: "In-depth guides and analysis from our education team", url: "/blog", verified: true }
      ]
    }
  ];

  return (
    <>
      <SEO 
        title="DeFi Tools & Calculators: Essential Resources for Crypto Investing"
        description="Comprehensive DeFi tools including yield farming calculators, portfolio trackers, trusted wallets, and essential platforms for decentralized finance investing and passive income strategies."
        keywords="DeFi calculators, crypto tools, yield farming calculator, DeFi portfolio tracker, cryptocurrency calculators, DeFi platforms, blockchain tools, passive income calculators"
        url="https://www.sentineldefi.online/resources"
        schema={{
          type: 'SoftwareApplication',
          data: {
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web Browser",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD"
            },
            featureList: [
              "DeFi yield calculators",
              "Portfolio tracking tools",
              "Risk assessment calculators",
              "APY comparison tools",
              "Impermanent loss calculators"
            ]
          }
        }}
        faq={[
          {
            question: "What DeFi calculators do you provide?",
            answer: "We offer comprehensive DeFi calculators including yield farming APY calculators, impermanent loss estimators, portfolio rebalancing tools, and risk assessment calculators to help you make informed DeFi investment decisions."
          },
          {
            question: "Are your DeFi tools free to use?",
            answer: "Yes, all our DeFi calculators and basic tools are completely free. We provide these resources to help educate users about decentralized finance and support informed decision-making in crypto investing."
          },
          {
            question: "Which DeFi platforms do you recommend?",
            answer: "We curate trusted DeFi platforms including leading DEXs, lending protocols, and yield farming platforms. All recommendations are based on security audits, track record, and community trust in the DeFi ecosystem."
          },
          {
            question: "How do I calculate DeFi yields and returns?",
            answer: "Our DeFi calculators help you estimate yields from staking, liquidity providing, and yield farming. Input your investment amount, duration, and platform APY to see projected returns and understand associated risks."
          }
        ]}
      />
      <div className="min-h-screen bg-transparent relative overflow-hidden">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Library"
          title="Tools and Resources"
          subtitle="PDFs, calculators, templates, and reference materials to support your DeFi education."
        />

      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        {/* Resource Categories */}
        <div className="space-y-24 mb-24">
          {resourceCategories.map((category) => (
            <section key={category.title}>
              {/* Category Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-10 pb-6 border-b border-white/10">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <category.icon className="w-6 h-6" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="font-consciousness text-2xl font-bold text-white mb-1">
                    {category.title}
                  </h2>
                  <p className="font-body text-white/50">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.resources.map((resource) => (
                  <Card 
                    key={resource.name}
                    className="p-6 bg-white/3 border border-white/8 rounded-2xl hover:border-violet-500/30 transition-all group flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="font-consciousness text-base font-semibold text-white group-hover:text-violet-300 transition-colors leading-snug">
                        {resource.name}
                      </h3>
                      {resource.verified && (
                        <Badge className="font-body text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border-none">
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="font-body text-sm text-white/50 mb-8 leading-relaxed flex-1">
                      {resource.description}
                    </p>
                    
                    <button
                      className="font-body text-sm text-violet-400 hover:text-violet-300 flex items-center gap-2 transition-colors group/btn"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      {resource.url.endsWith('.pdf') ? 'Download PDF' : 'Access Resource'}
                      <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* DeFi Calculators */}
        <section className="mb-16">
          <DefiCalculators />
        </section>

        {/* Disclaimer */}
        <Card className="p-8 bg-white/3 border border-white/8 rounded-2xl">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="font-consciousness text-lg font-bold text-white mb-4">
              Important Disclaimer
            </h3>
            <p className="font-body text-white/50 leading-relaxed">
              These resources are provided for educational purposes only. Always conduct your own research 
              and never invest more than you can afford to lose. DeFi protocols carry inherent risks 
              including smart contract vulnerabilities, impermanent loss, and market volatility.
            </p>
          </div>
        </Card>

        {/* Newsletter Signup */}
        <section className="mt-16">
          <NewsletterSignup variant="default" />
        </section>
      </div>
    </div>
    </>
  );
};

export default Resources;