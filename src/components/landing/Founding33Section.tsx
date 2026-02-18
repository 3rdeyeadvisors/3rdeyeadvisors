import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Crown, Loader2, Flame, Lock } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Founding33SectionProps {
  totalSpots?: number;
  claimedSpots?: number;
}

interface SpotsData {
  total: number;
  claimed: number;
  remaining: number;
}

const Founding33Section = ({ totalSpots = 33, claimedSpots: initialClaimed = 0 }: Founding33SectionProps) => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [spotsData, setSpotsData] = useState<SpotsData>({
    total: totalSpots,
    claimed: initialClaimed,
    remaining: totalSpots - initialClaimed,
  });

  // Fetch dynamic spots data on mount
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-founding33-spots');
        if (error) throw error;
        if (data) {
          setSpotsData({
            total: data.total || 33,
            claimed: data.claimed || 0,
            remaining: data.remaining || 33,
          });
        }
      } catch (err) {
        console.error('Error fetching spots:', err);
        // Keep default values on error
      }
    };
    fetchSpots();
  }, []);

  // Handle success/cancel query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const founding33Status = params.get('founding33');
    
    if (founding33Status === 'success') {
      toast.success('🎉 Welcome to the Founding 33! Check your email for confirmation.', {
        duration: 8000,
      });
      // Clear the query param
      navigate('/', { replace: true });
    } else if (founding33Status === 'canceled') {
      toast.info('Checkout was canceled. Your spot is still available!', {
        duration: 5000,
      });
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);

  const spotsRemaining = spotsData.remaining;
  const percentageClaimed = (spotsData.claimed / spotsData.total) * 100;
  const isSoldOut = spotsRemaining <= 0;

  const handleSecureSeat = async () => {
    if (!user || !session) {
      navigate('/auth?redirect=/?founding33=checkout');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-founding33-checkout');
      
      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout');
      setIsLoading(false);
    }
  };

  const benefits = [
    'Lifetime access to ALL current courses',
    'Every future course release included',
    'Full community channel access',
    'Priority access to new features',
    '70% referral commission (highest tier)',
    '10 bonus raffle entries per raffle',
    'Founding member recognition badge',
    '3x weighted vote on platform roadmap',
  ];

  return (
    <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
      {/* Premium background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-background/40 to-background/60 pointer-events-none" />
      
      {/* Subtle glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <AnimatedSection className="text-center mb-8 md:mb-12">
          {/* Limited Edition Badge */}
          <span className="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.2em] text-amber-400 font-medium mb-6 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full">
            <Crown className="w-4 h-4" />
            Limited Edition
          </span>
          
          {/* Heading */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-consciousness font-bold text-foreground mb-4">
            Join the Founding 33.
          </h2>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground font-consciousness max-w-2xl mx-auto">
            Secure lifetime access to the 3EA ecosystem. Only 33 spots available.
          </p>
        </AnimatedSection>

        {/* Premium Card */}
        <AnimatedSection delay={150}>
          <div className="relative overflow-hidden p-6 md:p-8 lg:p-10 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-card via-card/90 to-card/80 backdrop-blur-sm shadow-2xl shadow-amber-500/10">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/50 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/50 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/50 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/50 rounded-br-3xl" />

            <div className="text-center mb-8">
              {/* Price */}
              <div className="mb-2">
                <span className="text-5xl md:text-6xl font-consciousness font-bold text-foreground">$2,000</span>
              </div>
              <p className="text-amber-400 uppercase tracking-widest text-sm font-semibold">
                One-Time Payment
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center text-sm md:text-base text-foreground/90 font-consciousness">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Spots Counter */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 md:p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="text-lg md:text-xl font-consciousness font-semibold text-foreground">
                  {isSoldOut 
                    ? 'All 33 founding spots have been claimed!' 
                    : `Only ${spotsRemaining} of ${spotsData.total} spots remaining`
                  }
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 bg-background/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${percentageClaimed}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center font-consciousness">
                {spotsData.claimed} founding members have already claimed their spot
              </p>
            </div>

            {/* CTA Button */}
            {isSoldOut ? (
              <Button 
                size="lg"
                className="w-full py-7 text-lg font-consciousness font-semibold bg-muted text-muted-foreground border-0 cursor-not-allowed"
                disabled
              >
              <Lock className="w-5 h-5" />
                <span>All 33 Spots Claimed</span>
              </Button>
            ) : (
              <Button 
                size="lg"
                className="w-full py-7 text-lg font-consciousness font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black border-0 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300"
                onClick={handleSecureSeat}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    <span>Secure Your Founding Seat!</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </AnimatedSection>

        {/* Trust note */}
        <AnimatedSection delay={300}>
          <p className="text-center text-sm text-muted-foreground font-consciousness mt-6">
            Instant lifetime access • No recurring fees ever
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Founding33Section;
