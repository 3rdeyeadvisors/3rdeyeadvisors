import { Link } from "react-router-dom";
import { GraduationCap, Building2, Scale, Users, User, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";

const InstitutionalSection = () => {
  return (
    <section className="py-10 md:py-14 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <AnimatedSection animation="fade-up" className="text-center">
          {/* Icons row */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Scale className="w-6 h-6" />
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          
          {/* Headline */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Specialized Advisory & Institutional Services
          </h2>
          
          {/* Partnership Body */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Beyond our core platform, we offer schools, law firms, and financial institutions custom onboarding, bulk licensing, and specialized advisory services.
          </p>

          {/* Digital Asset Reserves Section */}
          <div className="mt-12 pt-10 border-t border-border/50">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
              Digital Asset Reserve Solutions
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              We help families, individuals, and institutions build and manage yield-generating digital asset reserves. Whether you're planning for generational wealth transfer, building a digital asset portfolio, or diversifying treasury holdings, our team provides tailored solutions.
            </p>
            
            {/* Client Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
              <div className="p-6 rounded-xl bg-card/50 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Families</h4>
                <p className="text-sm text-muted-foreground">Estate planning & generational wealth preservation</p>
              </div>
              
              <div className="p-6 rounded-xl bg-card/50 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                  <User className="w-5 h-5" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Individuals</h4>
                <p className="text-sm text-muted-foreground">Personal portfolio building & asset allocation</p>
              </div>
              
              <div className="p-6 rounded-xl bg-card/50 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
                  <Landmark className="w-5 h-5" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Institutions</h4>
                <p className="text-sm text-muted-foreground">Treasury diversification & reserve management</p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <Button asChild size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
            <Link to="/contact">
              Inquire About Our Services
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default InstitutionalSection;
