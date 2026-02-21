import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import SEO from "@/components/SEO";

const AwarenessBlueprintLanding = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "awareness_blueprint_signup",
        {
          body: { email: email.trim().toLowerCase() },
        }
      );

      if (error) {
        console.error("Signup error:", error);
        toast.error("Something went wrong. Please try again.");
      } else {
        toast.success("Check your inbox for The Awareness Blueprint.");
        setEmail("");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title="The Awareness Blueprint: Free Download"
        description="A 10-page breakdown showing how money, value, and power are shifting on-chain :  written in plain English, without hype."
        keywords="DeFi education, blockchain awareness, financial literacy, tokenization, AI finance"
      />
      
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-12 text-center">
          
          {/* SECTION 1 :  HEADLINE + SUBHEADLINE */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              The Financial System Is Shifting Faster Than Anyone Realizes
            </h1>
            <p className="text-xl md:text-2xl text-white/50">
              Stay ahead instead of catching up.
            </p>
          </div>

          {/* SECTION 2 :  VALUE PROMISE */}
          <div className="space-y-4">
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              A 10-page breakdown showing how money, value, and power are shifting on-chain :  written in plain English, without hype.
            </p>
          </div>

          {/* SECTION 3 :  BENEFITS */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              What You'll Learn Inside the Blueprint
            </h2>
            <ul className="text-left space-y-4 text-base md:text-lg text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>How AI, tokenization, and digital assets are quietly reshaping the financial system</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>Why awareness is becoming a competitive advantage</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>The three systems institutions are already adopting behind the scenes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>How to avoid being blindsided by the shift into digital value</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>A simple on-chain playbook for beginners who want clarity, not confusion</span>
              </li>
            </ul>
          </div>

          {/* SECTION 4 :  WHY IT MATTERS */}
          <div className="space-y-4">
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              Most people won't realize the world changed until they're already living inside the new system. Awareness now is worth more than reaction later.
            </p>
          </div>

          {/* SECTION 5 :  FREE DOWNLOAD CALL-TO-ACTION */}
          <div className="space-y-6 pt-8">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Download The Awareness Blueprint (FREE)
              </h2>
              <p className="text-lg text-white/50">
                No fluff. No noise. No pressure.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                required
              />
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Get Immediate Access"}
              </Button>
            </form>
          </div>

          {/* SECTION 6 :  FINAL LINE */}
          <div className="pt-8">
            <p className="text-lg md:text-xl text-white/50 italic">
              Knowledge is free. Awareness is the real currency.
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default AwarenessBlueprintLanding;
