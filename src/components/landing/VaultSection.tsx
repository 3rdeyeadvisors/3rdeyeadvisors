import { Shield, Lock, TrendingUp, Info } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const vaultLayers = [
  {
    title: "Layer 1: Security First",
    description: "Focus on principal protection through established protocols and multi-signature custody. Your assets remain on-chain where you can verify them 24/7.",
    features: ["Hardware Wallet Integration", "On-Chain Verification", "Established Protocol Bias"]
  },
  {
    title: "Layer 2: Sustainable Yield",
    description: "Automated harvesting of lending and trading fees. No hype and no algorithmic stablecoins. Only proven revenue models that have survived multiple market cycles.",
    features: ["Direct Peer-to-Peer Interest", "Trading Fee Collection", "Auto-Compounding Logic"]
  },
  {
    title: "Layer 3: Active Management",
    description: "Strategists rotate capital between audited protocols based on risk adjusted performance. We watch the code so you do not have to.",
    features: ["Risk Adjusted Rotation", "Code Level Analysis", "Proactive Rebalancing"]
  }
];

const vaults = [
  {
    name: "3EA Earth Access Vault",
    status: "Live",
    isLive: true,
    description: "Managed allocation of blue chip assets and stablecoin yield strategies on Ethereum Mainnet.",
    strategy: "Diversified DeFi Alpha",
    target: "Conservative Growth",
    icon: Shield,
    accent: "text-violet-400",
    bg: "bg-violet-500/10"
  },
  {
    name: "Institutional Treasury Vault",
    status: "Coming Q2 2026",
    isLive: false,
    description: "Sophisticated reserve management for organizations and family offices focused on inflation protection.",
    strategy: "Low Volatility Reserve",
    target: "Capital Preservation",
    icon: Lock,
    accent: "text-blue-400",
    bg: "bg-blue-500/10"
  },
  {
    name: "Yield Maximizer Vault",
    status: "Coming Q3 2026",
    isLive: false,
    description: "Active farming and leveraged strategies for investors seeking higher returns on their digital assets.",
    strategy: "Aggressive Alpha",
    target: "Maximum Yield",
    icon: TrendingUp,
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10"
  }
];

const VaultSection = () => {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistVault, setWaitlistVault] = useState<string | null>(null);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState<string | null>(null);

  const handleWaitlistJoin = async (vaultName: string) => {
    setWaitlistVault(vaultName);
  };

  const handleWaitlistSubmit = async (vaultName: string, email: string) => {
    if (!email || !email.includes('@')) return;
    setWaitlistLoading(true);
    try {
      const { error } = await supabase
        .from('vault_waitlist')
        .insert([{ email: email.trim().toLowerCase(), vault_name: vaultName }]);
      if (!error) {
        setWaitlistSuccess(vaultName);
        setWaitlistVault(null);
        setWaitlistEmail('');
      }
    } catch (err) {
      console.error('Waitlist error:', err);
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <Badge variant="outline" className="mb-4 font-body border-violet-500/30 text-violet-400">
            3EA Managed Vaults
          </Badge>
          <h2 className="font-consciousness text-3xl md:text-5xl font-bold text-white mb-6">
            Institutional Grade Management for All
          </h2>
          <p className="font-body text-xl text-white/50 max-w-3xl mx-auto">
            Experience the power of professionally managed DeFi strategies. No complexity and no guesswork.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {vaults.map((vault, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <Card className="h-full border-white/10 bg-white/5 backdrop-blur-md hover:border-violet-500/30 transition-all duration-300 overflow-hidden flex flex-col">
                <div className={`p-4 ${vault.bg} flex items-center justify-between`}>
                  <vault.icon className={`w-6 h-6 ${vault.accent}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${vault.isLive ? 'text-emerald-400' : 'text-white/40'}`}>
                    {vault.status}
                  </span>
                </div>
                <CardContent className="p-8 flex-1 flex flex-col">
                  <h3 className="font-consciousness text-2xl font-bold text-white mb-4">{vault.name}</h3>
                  <p className="font-body text-white/50 mb-8 leading-relaxed">
                    {vault.description}
                  </p>
                  
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="font-body text-xs uppercase text-white/40">Strategy</span>
                      <span className="font-body text-sm text-white/80">{vault.strategy}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="font-body text-xs uppercase text-white/40">Target</span>
                      <span className="font-body text-sm text-white/80">{vault.target}</span>
                    </div>
                  </div>

                  {!vault.isLive && (
                    <div className="mt-6 pt-4 border-t border-white/5">
                      {waitlistSuccess === vault.name ? (
                        <p className="font-body text-xs text-emerald-400 text-center py-2">
                          You are on the waitlist. We will notify you when this vault opens.
                        </p>
                      ) : waitlistVault === vault.name ? (
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            className="flex-1 font-body text-xs bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors min-w-0"
                          />
                          <button
                            onClick={() => handleWaitlistSubmit(vault.name, waitlistEmail)}
                            disabled={waitlistLoading}
                            className="font-body text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-2 rounded-lg transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {waitlistLoading ? '...' : 'Notify Me'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleWaitlistJoin(vault.name)}
                          className="w-full font-body text-sm text-white/40 hover:text-violet-400 transition-colors py-2 border border-white/10 hover:border-violet-500/30 rounded-xl"
                        >
                          Notify Me When Live
                        </button>
                      )}
                    </div>
                  )}

                  {vault.isLive && (
                    <button className="w-full font-body py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg shadow-violet-900/20">
                      Access Vault
                    </button>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/10 pt-16">
          {vaultLayers.map((layer, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold font-consciousness">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-consciousness text-lg font-bold text-white mb-3">{layer.title}</h4>
                  <p className="font-body text-sm text-white/40 leading-relaxed mb-4">
                    {layer.description}
                  </p>
                  <ul className="space-y-2">
                    {layer.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2 text-xs font-body text-white/60">
                        <div className="w-1 h-1 rounded-full bg-violet-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VaultSection;
