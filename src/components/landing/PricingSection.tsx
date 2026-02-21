import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PRICING, COMMISSION_RATES, ANNUAL_BENEFITS } from '@/lib/constants';

const PricingSection = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState<'monthly' | 'annual' | null>(null);

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    if (!user || !session) {
      // Save plan selection before redirecting to auth
      sessionStorage.setItem('pending_plan', plan);
      navigate(`/auth?plan=${plan}`);
      return;
    }

    setCheckoutLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: {
          plan,
          successUrl: `${window.location.origin}/checkout/success?plan=${plan}&type=subscription`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <section className="py-10 md:py-14 lg:py-20 relative">
      <div className="max-w-5xl mx-auto px-6">
        <AnimatedSection className="text-center mb-8 md:mb-10 lg:mb-12">
          <span className="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.2em] text-primary font-medium mb-4 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            14 Day Free Trial
          </span>
          <h2 className="text-3xl md:text-5xl font-consciousness font-bold text-foreground mb-6">
            Start Your Journey Risk Free
          </h2>
          <p className="text-lg text-white/50 font-body max-w-2xl mx-auto">
            Try everything free for 14 days. Cancel anytime.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <AnimatedSection animation="fade-left" delay={0}>
            <div className="relative h-full p-5 md:p-6 lg:p-8 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group">
              <div className="flex flex-col h-full">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-consciousness font-semibold text-foreground mb-2">
                    Monthly
                  </h3>
                  <p className="text-sm text-white/50 font-body mb-4">
                    Full access billed monthly
                  </p>
                  <div className="mb-1">
                    <span className="text-4xl font-consciousness font-bold text-foreground">{PRICING.monthly.display}</span>
                    <span className="text-white/50 font-body">{PRICING.monthly.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6 flex-grow">
                  {[
                    '14 day free trial',
                    'All DeFi courses and tutorials',
                    'Exclusive content and resources',
                    'Community access',
                    `${Math.round(COMMISSION_RATES.monthly * 100)}% referral commission`,
                    'Cancel anytime'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-foreground/80 font-body">
                      <CheckCircle2 className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="outline"
                  className="w-full font-body py-6 border-white/8 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => handleSubscribe('monthly')}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 'monthly' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start 14 Day Free Trial'
                  )}
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* Annual Plan */}
          <AnimatedSection animation="fade-right" delay={100}>
            <div className="relative h-full p-5 md:p-6 lg:p-8 rounded-2xl border-2 border-primary/50 bg-white/3 backdrop-blur-sm group overflow-hidden">
              {/* Premium badge */}
              <div className="absolute -top-px left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary-foreground bg-primary px-4 py-1.5 rounded-b-lg font-medium">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </span>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

              <div className="relative flex flex-col h-full pt-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-consciousness font-semibold text-foreground mb-2">
                    Annual
                  </h3>
                  <p className="text-sm text-white/50 font-body mb-4">
                    Full year commitment
                  </p>
                  <div className="mb-1">
                    <span className="text-4xl font-consciousness font-bold text-foreground">{PRICING.annual.display}</span>
                    <span className="text-white/50 font-body">{PRICING.annual.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6 flex-grow">
                  {[
                    '14 day free trial',
                    'All DeFi courses and tutorials',
                    'Early access to new courses',
                    `${ANNUAL_BENEFITS.bonusRaffleTickets} bonus raffle entries per raffle`,
                    'Priority email announcements',
                    `${Math.round(COMMISSION_RATES.annual * 100)}% referral commission`,
                    'Vote on platform roadmap'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-foreground/80 font-body">
                      <CheckCircle2 className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full font-body py-6 bg-primary hover:bg-primary/90"
                  onClick={() => handleSubscribe('annual')}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 'annual' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Start 14 Day Free Trial'
                  )}
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={200}>
          <p className="text-center text-sm text-white/50 font-body mt-8">
            Cancel anytime during your trial. No questions asked.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingSection;
