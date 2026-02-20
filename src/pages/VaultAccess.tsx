import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";
import VaultSection from "@/components/landing/VaultSection";
import { Button } from "@/components/ui/button";
import { 
  Lock,
  ExternalLink,
  Shield,
  ArrowRight,
  ChevronRight
} from "lucide-react";

// External URLs
const THIRDWEB_NFT_URL = "https://thirdweb.com/ethereum/0x91AE8ec3d88E871679F826c1D6c5B008f105506c";
const ENZYME_VAULT_URL = "https://app.enzyme.finance/vault/0x8b668add6fba7c01444353c0dfdef222a816cd9f";

const VaultAccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAccess } = useSubscription();

  return (
    <>
      <SEO 
        title="Vault Access | Managed DeFi Strategies"
        description="Access the exclusive 3EA Enzyme Vault. Three tiers of education and institutional grade DeFi management strategies."
      />

      <div className="min-h-screen bg-black pb-20">
        <PageHero
          eyebrow="The Vault"
          title="Knowledge at Every Level"
          subtitle="Three tiers of education from foundational to institutional grade. Each vault unlocks a deeper layer of the DeFi ecosystem."
        />

        <div className="container mx-auto px-6">
          {/* Membership Gate for non-premium users */}
          {!hasAccess && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto mb-20 relative overflow-hidden group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="font-consciousness text-2xl font-bold text-white mb-4">Premium Membership Required</h2>
                <p className="font-body text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
                  Access to managed vaults and institutional-grade strategies is reserved for our active members. Join the movement to unlock full access.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/subscription">
                    <Button className="font-body bg-violet-600 hover:bg-violet-500 text-white px-8 py-6 rounded-xl transition-all">
                      View Membership Plans
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/philosophy">
                    <Button variant="ghost" className="font-body text-white/40 hover:text-white hover:bg-white/5">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Render the VaultSection component */}
          <VaultSection />

          {/* Quick Links Section */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <Link to="/vault-deposit-guide" className="group">
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-violet-500/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-consciousness text-white font-bold">Deposit Guide</h4>
                    <p className="font-body text-xs text-white/40">Step-by-step instructions</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-violet-400 transition-colors" />
              </div>
            </Link>

            <Link to="/vault-withdrawal-guide" className="group">
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-violet-500/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-consciousness text-white font-bold">Withdrawal Guide</h4>
                    <p className="font-body text-xs text-white/40">Exit liquidity procedures</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-violet-400 transition-colors" />
              </div>
            </Link>
          </div>

          {/* Enzyme External CTA */}
          <div className="mt-16 text-center">
            <a
              href={ENZYME_VAULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-body text-sm transition-colors border border-violet-500/20 bg-violet-500/5 px-6 py-3 rounded-full"
            >
              Enter Enzyme Platform
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="font-body text-[10px] text-white/20 uppercase tracking-widest mt-4">
              Managed on Ethereum Mainnet
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VaultAccess;
