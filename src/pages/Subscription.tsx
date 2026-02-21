import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Crown, Loader2, Sparkles, Calendar, CreditCard, Clock, AlertTriangle } from 'lucide-react';
import SEO from '@/components/SEO';
import { PRICING, ANNUAL_BENEFITS, COMMISSION_RATES } from '@/lib/constants';

/**
 * Subscription Page - Audited for pricing consistency with constants.ts
 */
const Subscription = () => {
  const { user, session } = useAuth();
  const { subscription, loading: subLoading, checkSubscription, hasAccess, isTrialing, isDbTrial, daysRemaining, trialExpired } = useSubscription();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState<'monthly' | 'annual' | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const planParam = searchParams.get('plan') as 'monthly' | 'annual' | null;
    if (planParam && user && session && !hasAccess && !subLoading && (planParam === 'monthly' || planParam === 'annual')) {
      // Small delay to ensure the page has mounted
      const timer = setTimeout(() => {
        handleSubscribe(planParam);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, session, hasAccess, subLoading]);

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    if (!user || !session) {
      navigate(`/auth?plan=${plan}`);
      return;
    }

    setCheckoutLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { plan },
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

  const handleManageSubscription = async () => {
    if (!user || !session) {
      toast.error('Please sign in first');
      return;
    }

    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
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
      console.error('Portal error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <SEO
        title="Subscription"
        description="Subscribe to 3rdeyeadvisors for full access to DeFi courses, tutorials, and premium content. Start your 14 day free trial today."
        keywords="defi subscription, crypto education, blockchain courses, defi membership"
      />

      <div className="min-h-screen bg-background py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-5">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-primary">
                {user && !hasAccess && !trialExpired ? 'Your Free Trial is Active!' : '14 Day Free Trial'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5">
              {hasAccess ? 'Your Subscription' : 'Unlock Your DeFi Potential'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              {hasAccess 
                ? 'You have full access to all courses, tutorials, and premium content.'
                : 'Full access to all courses, tutorials, and premium content. Cancel anytime during your trial.'}
            </p>
          </div>

          {/* Trial Expired Warning */}
          {user && trialExpired && !hasAccess && (
            <Card className="mb-8 border-destructive/50 bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Your Free Trial Has Ended</h3>
                    <p className="text-white/70 text-sm">
                      Subscribe now to continue accessing all courses and premium content.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Database Trial Status */}
          {hasAccess && isDbTrial && daysRemaining !== null && (
            <Card className="mb-8 border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-white">Free Trial Active</CardTitle>
                      <CardDescription>
                        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Free Trial
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-white/50 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Trial ends: {formatDate(subscription?.trialEnd || null)}</span>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  You have full access to all content. Subscribe before your trial ends to keep your access.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => handleSubscribe('monthly')} disabled={checkoutLoading !== null}>
                    {checkoutLoading === 'monthly' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Paid Subscription Status */}
          {hasAccess && !isDbTrial && subscription && (
            <Card className="mb-8 border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-white">Your Subscription</CardTitle>
                      <CardDescription>
                        {subscription.isGrandfathered 
                          ? 'Grandfathered: Lifetime Free Access'
                          : subscription.isAdmin
                          ? 'Admin: Full Access'
                          : subscription.plan === 'annual' 
                          ? 'Annual Plan' 
                          : 'Monthly Plan'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={isTrialing ? 'secondary' : 'default'} className="text-sm">
                    {isTrialing ? 'Trial' : 'Active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {subscription.trialEnd && (
                    <div className="flex items-center gap-2 text-white/50">
                      <Calendar className="w-4 h-4" />
                      <span>Trial ends: {formatDate(subscription.trialEnd)}</span>
                    </div>
                  )}
                  {subscription.subscriptionEnd && !subscription.isGrandfathered && !subscription.isAdmin && (
                    <div className="flex items-center gap-2 text-white/50">
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {subscription.cancelAtPeriodEnd 
                          ? `Expires: ${formatDate(subscription.subscriptionEnd)}`
                          : `Renews: ${formatDate(subscription.subscriptionEnd)}`}
                      </span>
                    </div>
                  )}
                </div>
                {!subscription.isGrandfathered && !subscription.isAdmin && (
                  <Button 
                    onClick={handleManageSubscription} 
                    variant="outline"
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      'Manage Subscription'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pricing Cards: Show when user doesn't have paid access */}
          {(!hasAccess || isDbTrial) && (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
              {/* Monthly Plan */}
              <Card className="relative p-6 md:p-8 flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Monthly</h3>
                  <p className="text-sm text-white/70 mb-5">Full access, billed monthly</p>
                  <div>
                    <span className="text-4xl md:text-5xl font-bold text-white">{PRICING.monthly.display}</span>
                    <span className="text-white/70">{PRICING.monthly.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'All DeFi courses and tutorials',
                    'Exclusive content and resources',
                    'Community access',
                    `${Math.round(COMMISSION_RATES.monthly * 100)}% referral commission`,
                    'Cancel anytime',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full min-h-[52px] text-base" 
                  size="lg"
                  onClick={() => handleSubscribe('monthly')}
                  disabled={checkoutLoading !== null || subLoading}
                >
                  {checkoutLoading === 'monthly' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isDbTrial ? (
                    'Subscribe Now'
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </Card>

              {/* Annual Plan */}
              <Card className="relative p-6 md:p-8 flex flex-col border-primary/60 shadow-lg shadow-primary/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Premium
                  </Badge>
                </div>
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">Annual</h3>
                  <p className="text-sm text-white/70 mb-5">Full year commitment</p>
                  <div>
                    <span className="text-4xl md:text-5xl font-bold text-white">{PRICING.annual.display}</span>
                    <span className="text-white/70">{PRICING.annual.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'All DeFi courses and tutorials',
                    'Exclusive content and resources',
                    'Community access',
                    'Early access to new courses',
                    `${ANNUAL_BENEFITS.bonusRaffleTickets} bonus raffle entries per raffle`,
                    'Early access to new vaults',
                    `${Math.round(COMMISSION_RATES.annual * 100)}% referral commission`,
                    'Input on platform direction',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full min-h-[52px] text-base" 
                  size="lg"
                  variant="default"
                  onClick={() => handleSubscribe('annual')}
                  disabled={checkoutLoading !== null || subLoading}
                >
                  {checkoutLoading === 'annual' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isDbTrial ? (
                    'Subscribe Now'
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </Card>
            </div>
          )}

          {/* FAQ */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-2xl mx-auto space-y-4 text-left">
              <div className="p-5 md:p-6 bg-white/3 rounded-xl border border-white/8">
                <h3 className="font-semibold text-white mb-3 text-base">
                  How does the free trial work?
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Your 14 day trial starts immediately when you create an account: no payment required. You get full access to all content during your trial.
                </p>
              </div>
              <div className="p-5 md:p-6 bg-white/3 rounded-xl border border-white/8">
                <h3 className="font-semibold text-white mb-3 text-base">
                  What happens when my trial ends?
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  After your trial, you'll need to subscribe to continue accessing premium content. You can subscribe anytime during or after your trial.
                </p>
              </div>
              <div className="p-5 md:p-6 bg-white/3 rounded-xl border border-white/8">
                <h3 className="font-semibold text-white mb-3 text-base">
                  Can I cancel anytime?
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Yes! Cancel anytime and you'll keep access until the end of your billing period. No questions asked.
                </p>
              </div>
              <div className="p-5 md:p-6 bg-white/3 rounded-xl border border-white/8">
                <h3 className="font-semibold text-white mb-3 text-base">
                  What payment methods do you accept?
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  We accept all major credit cards and debit cards through our secure Stripe payment processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscription;
