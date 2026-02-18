import { ShieldCheck, Cpu, BarChart3, Fingerprint, LucideIcon } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import GlowCard from './GlowCard';
import { useStaggeredAnimation } from '@/hooks/useScrollAnimation';
import { useGalaxySounds } from '@/hooks/useGalaxySounds';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Protocol Auditing",
    description: "Deep-dive technical analysis of smart contract security and risk parameters."
  },
  {
    icon: Cpu,
    title: "Yield Optimization",
    description: "Advanced strategies for algorithmic capital allocation and liquidity provision."
  },
  {
    icon: Fingerprint,
    title: "Risk Mitigation",
    description: "Institutional-grade frameworks for identifying and neutralizing systemic DeFi risks."
  },
  {
    icon: BarChart3,
    title: "Capital Efficiency",
    description: "Maximizing ROI through sophisticated cross-chain architectural understanding."
  }
];

const FeaturesSection = () => {
  const { containerRef, isItemVisible } = useStaggeredAnimation(features.length, 150);
  const { playWhoosh } = useGalaxySounds();

  return (
    <section className="py-10 md:py-14 lg:py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-10 md:mb-16">
          <span className="inline-block text-xs md:text-sm uppercase tracking-[0.4em] text-primary font-semibold mb-4">
            Core Competencies
          </span>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-consciousness font-bold text-foreground mb-6">
            Elite DeFi Capabilities
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-consciousness max-w-3xl mx-auto opacity-80">
            Providing the technical foundation and strategic intelligence required for sophisticated decentralized finance operations.
          </p>
        </AnimatedSection>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <GlowCard 
              key={feature.title}
              delay={index * 100}
              isVisible={isItemVisible(index)}
            >
              <div
                className="p-4 md:p-5 lg:p-6 flex flex-col items-center text-center h-full cursor-pointer"
                onMouseEnter={playWhoosh}
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-consciousness font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground font-consciousness leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;