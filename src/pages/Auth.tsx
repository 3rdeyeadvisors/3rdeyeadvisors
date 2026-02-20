import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const { user, session, signIn, signUp, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const checkoutTriggeredRef = useRef(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isPasswordUpdate, setIsPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const hasRedirected = useRef(false);
  
  // Get initial tab from URL parameter or pathname
  const urlParams = new URLSearchParams(window.location.search);
  const isSignupPath = location.pathname === '/signup';
  const isSigninPath = location.pathname === '/signin';
  const defaultTab = isSignupPath || urlParams.get('tab') === 'signup' ? 'signup' : 'signin';

  // Check URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const tokenHash = urlParams.get('token_hash');
    const type = urlParams.get('type');
    
    if (verified === 'true') {
      toast({
        title: "Email verified!",
        description: "Your account has been verified successfully.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Handle password reset token from email - redirect to dedicated reset page
    if (tokenHash && type === 'recovery') {
      navigate('/reset-password' + window.location.search);
      return;
    }
  }, [toast, navigate]);

  // Handle authenticated user - either redirect or trigger checkout
  useEffect(() => {
    const triggerCheckout = async (plan: 'monthly' | 'annual') => {
      if (checkoutTriggeredRef.current || !session) return;
      checkoutTriggeredRef.current = true;
      setCheckoutLoading(true);
      
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
        toast({
          title: "Checkout error",
          description: err instanceof Error ? err.message : 'Failed to start checkout',
          variant: "destructive",
        });
        checkoutTriggeredRef.current = false;
        setCheckoutLoading(false);
        navigate('/dashboard', { replace: true });
      }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const tokenHash = urlParams.get('token_hash');
    const type = urlParams.get('type');
    const plan = urlParams.get('plan') as 'monthly' | 'annual' | null;
    const redirectTo = urlParams.get('redirect');
    
    // Don't redirect if this is a password reset flow
    if (tokenHash && type === 'recovery') {
      return;
    }
    
    // Handle authenticated users - redirect only ONCE
    if (user && session && !hasRedirected.current) {
      // After successful authentication, check for pending plan
      const pendingPlan = sessionStorage.getItem('pending_plan');
      if (pendingPlan) {
        sessionStorage.removeItem('pending_plan');
        navigate(`/subscription?plan=${pendingPlan}`);
      } else if (plan && (plan === 'monthly' || plan === 'annual')) {
        // If there's a plan parameter in the URL, auto-trigger Stripe checkout
        triggerCheckout(plan);
      } else {
        // Redirect to intended destination or dashboard
        hasRedirected.current = true;
        const destination = redirectTo || '/dashboard';
        navigate(destination, { replace: true });
      }
    }
  }, [user, session, navigate, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast({
        title: "Terms and Privacy",
        description: "You must agree to the Terms of Service and Privacy Policy to create an account.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get referrer ID from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const referrerId = urlParams.get('ref');
      
      const { error, data } = await signUp(email, password, {
        emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        data: {
          display_name: displayName,
        },
      });
      
      if (error) {
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // If there's a referrer, create referral record after successful signup
        // The database trigger (award_referral_ticket) handles ticket creation automatically
        if (referrerId && data.user) {
          try {
            // Get active raffle (must have future end_date)
            const { data: activeRaffle } = await supabase
              .from('raffles')
              .select('id')
              .eq('is_active', true)
              .gt('end_date', new Date().toISOString())
              .maybeSingle();

            if (activeRaffle) {
              // Create referral record - the trigger handles ticket creation
              const { error: refInsertError } = await supabase
                .from('referrals')
                .insert({
                  referrer_id: referrerId,
                  referred_user_id: data.user.id,
                  raffle_id: activeRaffle.id,
                  bonus_awarded: true,
                });

              if (refInsertError) {
                console.error('Error inserting referral:', refInsertError);
              } else {
              }
            } else {
              // No active raffle, still record the referral without raffle association
              const { error: refInsertError } = await supabase
                .from('referrals')
                .insert({
                  referrer_id: referrerId,
                  referred_user_id: data.user.id,
                  raffle_id: null,
                  bonus_awarded: false,
                });

              if (refInsertError) {
                console.error('Error inserting referral (no active raffle):', refInsertError);
              } else {
              }
            }
          } catch (refError) {
            console.error('Error in referral process:', refError);
          }
        }
        
        toast({
          title: "Account created!",
          description: "Welcome! You can now start exploring our courses.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: "Error sending reset email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset email sent!",
          description: "Check your email for password reset instructions.",
        });
        setIsPasswordReset(false);
        setEmail("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        toast({
          title: "Error updating password",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated successfully!",
          description: "Your password has been changed. You can now sign in with your new password.",
        });
        
        // Clean up and redirect
        setIsPasswordUpdate(false);
        setNewPassword("");
        setConfirmNewPassword("");
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen when redirecting to Stripe checkout
  if (checkoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8 max-w-md w-full relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-400 mx-auto mb-6" />
          <h2 className="font-consciousness text-xl font-bold text-white mb-2">Setting up your trial...</h2>
          <p className="font-body text-sm text-white/40">Redirecting to secure checkout</p>
        </div>
      </div>
    );
  }

  if (isPasswordReset) {
    return (
      <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8 max-w-md w-full relative z-10">
            <div className="text-center mb-8">
              <h1 className="font-consciousness text-2xl font-bold text-violet-400 mb-2">3rdeyeadvisors</h1>
              <p className="font-body text-sm text-white/40 uppercase tracking-widest">Reset Password</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-1">
                <Label htmlFor="reset-email" className="font-body text-xs uppercase tracking-widest text-white/40 block">Email</Label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="font-body text-base sm:text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={loading} className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 font-medium transition-all w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Email
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsPasswordReset(false);
                    window.history.replaceState({}, document.title, window.location.pathname);
                  }}
                  className="font-body text-xs text-white/40 hover:text-white"
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  // Show password update form when coming from reset email
  if (isPasswordUpdate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8 max-w-md w-full relative z-10">
          <div className="text-center mb-8">
            <h1 className="font-consciousness text-2xl font-bold text-violet-400 mb-2">3rdeyeadvisors</h1>
            <p className="font-body text-sm text-white/40 uppercase tracking-widest">Set New Password</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="new-password" className="font-body text-xs uppercase tracking-widest text-white/40 block">New Password</Label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="font-body text-base sm:text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                />
                <p className="font-body text-[10px] text-white/30 uppercase tracking-tight">
                  Min. 8 characters long
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-new-password" className="font-body text-xs uppercase tracking-widest text-white/40 block">Confirm New Password</Label>
                <input
                  id="confirm-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="font-body text-base sm:text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 font-medium transition-all w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 md:p-8 max-w-md w-full relative z-10">
          <div className="text-center mb-8">
            <h1 className="font-consciousness text-3xl font-bold text-violet-400 mb-2">3rdeyeadvisors</h1>
            <p className="font-body text-sm text-white/40">Access Institutional-Grade DeFi Intelligence</p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl mb-8">
              <TabsTrigger value="signin" className="font-consciousness text-sm font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all py-2.5">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="font-consciousness text-sm font-medium data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all py-2.5">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="signin-email" className="font-body text-xs uppercase tracking-widest text-white/40 block">Email Address</Label>
                    <input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="font-body text-base sm:text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password" className="font-body text-xs uppercase tracking-widest text-white/40 block">Password</Label>
                      <button
                        type="button"
                        onClick={() => setIsPasswordReset(true)}
                        className="font-body text-[10px] text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest"
                      >
                        Forgot?
                      </button>
                    </div>
                    <input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="font-body text-base sm:text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                    />
                  </div>
                </div>
                <Button type="submit" className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 font-medium transition-all w-full text-base" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In to Platform
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="signup-name" className="font-body text-xs uppercase tracking-widest text-white/40 block">Display Name</Label>
                    <input
                      id="signup-name"
                      type="text"
                      placeholder="Your name or alias"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="font-body text-base sm:text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-email" className="font-body text-xs uppercase tracking-widest text-white/40 block">Email Address</Label>
                    <input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="font-body text-base sm:text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-password" className="font-body text-xs uppercase tracking-widest text-white/40 block">Create Password</Label>
                    <input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="font-body text-base sm:text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors w-full"
                    />
                    <p className="font-body text-[10px] text-white/30 uppercase tracking-tighter">
                      Must be 8+ characters with uppercase & number
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 py-2">
                  <div className="relative flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-violet-600 focus:ring-violet-500 focus:ring-offset-black"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      required
                    />
                  </div>
                  <Label htmlFor="terms" className="font-body text-[10px] leading-snug text-white/40 uppercase tracking-widest">
                    I agree to the{" "}
                    <a href="/terms" className="text-violet-400 hover:text-violet-300 underline transition-colors">
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-violet-400 hover:text-violet-300 underline transition-colors">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                <Button type="submit" className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 font-medium transition-all w-full text-base" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Auth;