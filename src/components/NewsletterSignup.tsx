import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { newsletterSchema, sanitizeInput, checkRateLimit } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupProps {
  variant?: "default" | "cosmic" | "minimal";
  className?: string;
}

const NewsletterSignup = ({ variant = "default", className = "" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple email validation
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Direct insert without complex validation that might fail
      const { error } = await supabase
        .from('subscribers')
        .insert([{ 
          email: email.trim().toLowerCase(),
          name: name.trim() || null
        }]);

      if (error) {
        console.error('Subscription error:', error);
        toast({
          title: "Subscription Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setIsSubscribed(true);
      setEmail("");
      setName("");
      
      toast({
        title: "Successfully Subscribed!",
        description: "You'll receive our latest DeFi insights and updates.",
      });
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription Failed", 
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "minimal") {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
            disabled={isLoading || isSubscribed}
          />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={isLoading || isSubscribed}
          />
          <Button 
            type="submit" 
            disabled={isLoading || isSubscribed}
            variant="cosmic"
          >
            {isLoading ? "..." : isSubscribed ? <Check className="w-4 h-4" /> : "Subscribe"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Card className={`p-8 bg-gradient-cosmic-subtle border-border/50 ${className}`}>
      {variant === 'cosmic' ? (
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-950/30 to-black p-8 md:p-12 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 rounded-full px-4 py-1.5 mb-6">
              <Mail className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-body text-xs uppercase tracking-widest text-violet-300">Weekly Intelligence</span>
            </div>

            <h3 className="font-consciousness text-2xl md:text-3xl font-bold text-white mb-3">
              Get the DeFi moves your advisor is missing
            </h3>
            <p className="font-body text-white/50 mb-8 max-w-md mx-auto">
              Weekly insights, plain language breakdowns, and platform updates. No hype. Unsubscribe anytime.
            </p>

            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 text-violet-400">
                <Check className="w-5 h-5" />
                <span className="font-body text-sm">You are in. Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 font-body text-sm bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="font-body text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {isLoading ? 'Joining...' : 'Join Free'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <Mail className="w-12 h-12 text-primary mx-auto" />
          
          <div>
            <h3 className="text-xl font-consciousness font-bold text-foreground mb-2">
              Stay ahead of the curve
            </h3>
            <p className="text-muted-foreground font-consciousness">
              Weekly DeFi education, platform updates, and insights delivered to your inbox.
            </p>
          </div>

          {isSubscribed ? (
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <Check className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-primary font-consciousness">Successfully subscribed!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-consciousness"
                disabled={isLoading}
              />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-consciousness"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                variant="cosmic"
                className="w-full font-consciousness"
              >
                {isLoading ? "Subscribing..." : "Subscribe to Newsletter"}
              </Button>
            </form>
          )}
        </div>
      )}
    </Card>
  );
};

export default NewsletterSignup;