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
      <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Setting up your trial...</h2>
            <p className="text-muted-foreground">Redirecting to secure checkout</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPasswordReset) {
    return (
      <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>
                Enter your email to receive password reset instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Email
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsPasswordReset(false);
                      window.history.replaceState({}, document.title, window.location.pathname);
                    }}
                    className="flex-1"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Show password update form when coming from reset email
  if (isPasswordUpdate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-cosmic px-4 py-8 w-full overflow-x-hidden">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to 3rdeyeadvisors</CardTitle>
            <CardDescription>
              Join our community to access exclusive DeFi courses and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => setIsPasswordReset(true)}
                  >
                    Forgot your password?
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters and include uppercase, lowercase, and a number
                    </p>
                  </div>
                  <div className="flex items-start space-x-2 py-2">
                    <input
                      id="terms"
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      required
                    />
                    <Label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
                      I agree to the{" "}
                      <a href="/terms" className="text-primary hover:underline underline-offset-4">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-primary hover:underline underline-offset-4">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;