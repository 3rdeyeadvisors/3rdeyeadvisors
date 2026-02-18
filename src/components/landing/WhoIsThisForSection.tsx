import { Shield, Briefcase, Building } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

interface PersonaCard {
  icon: React.ReactNode;
  label: string;
  headline: string;
  body: string;
}

const personas: PersonaCard[] = [
  {
    icon: <Shield className="w-8 h-8" />,
    label: "The Safety First Individual",
    headline: "The Protective Guardian",
    body: "You have capital you want to move on-chain, but you're terrified of 'pressing the wrong button.' We provide the roadmap to secure your assets, vet protocols, and sleep soundly knowing your keys are safe.",
  },
  {
    icon: <Briefcase className="w-8 h-8" />,
    label: "The Career Strategist",
    headline: "The Future Proof Professional",
    body: "Traditional finance is being rewritten in code. Whether you're an accountant, lawyer, or entrepreneur, we bridge the knowledge gap so you can lead the transition into the decentralized economy.",
  },
  {
    icon: <Building className="w-8 h-8" />,
    label: "The Sovereign Architect",
    headline: "The Independent Builder",
    body: "Tired of centralized exchanges and banking limits? We teach you the mechanics of lending, staking, and yield farming so you can manage your own wealth without a middleman.",
  },
];

const WhoIsThisForSection = () => {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedSection animation="fade-up" className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Who Is This For?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed for individuals, families, institutions and corporations ready to take control of their financial future.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {personas.map((persona, index) => (
            <AnimatedSection
              key={persona.label}
              animation="fade-up"
              delay={index * 150}
              className="group"
            >
              <div className="h-full p-6 md:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                {/* Icon */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 md:mb-6 mx-auto md:mx-0 group-hover:bg-primary/20 transition-colors">
                  {persona.icon}
                </div>
                
                {/* Label */}
                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1 md:mb-2 text-center md:text-left">
                  {persona.label}
                </p>
                
                {/* Headline */}
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4 text-center md:text-left">
                  {persona.headline}
                </h3>
                
                {/* Body */}
                <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                  {persona.body}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoIsThisForSection;
