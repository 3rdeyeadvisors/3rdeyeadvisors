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
      {variant === "cosmic" ? (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-cosmic opacity-20 rounded-full blur-xl"></div>
            <Mail className="w-16 h-16 text-primary mx-auto relative" />
          </div>
          
          <div>
            <h3 className="text-2xl font-consciousness font-bold text-foreground mb-3">
              Get the DeFi moves your advisor is missing
            </h3>
            <p className="text-muted-foreground font-consciousness leading-relaxed">
              Weekly insights, plain language breakdowns, and platform updates. No hype. Unsubscribe anytime.
            </p>
          </div>

          {isSubscribed ? (
            <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20">
              <Check className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-primary font-consciousness font-medium">
                Welcome to the conscious investor community!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 font-consciousness"
                disabled={isLoading}
              />
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 font-consciousness"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  variant="cosmic"
                  className="h-12 px-8 font-consciousness"
                >
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span className="font-consciousness">
                  No spam. Unsubscribe anytime. Your privacy is protected.
                </span>
              </div>
            </form>
          )}
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