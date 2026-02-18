import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, ArrowDown } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useGalaxySounds } from '@/hooks/useGalaxySounds';

const HeroSection = () => {
  const { playPing, playDeepHum } = useGalaxySounds();
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden pt-12 md:pt-16 lg:pt-20">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Hero glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <AnimatedSection animation="fade-up" delay={0}>
          <span className="inline-block text-xs md:text-sm uppercase tracking-[0.4em] text-primary font-semibold mb-4 md:mb-6">
            Institutional DeFi Intelligence
          </span>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={100}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-consciousness font-bold text-foreground mb-4 md:mb-8 leading-[1.1] tracking-tighter max-w-5xl mx-auto">
            Advanced Blockchain Education for the{' '}
            <span className="bg-gradient-to-r from-white via-primary to-primary bg-clip-text text-transparent">
              Modern Financial Firm.
            </span>
          </h1>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-consciousness mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
            Empowering institutional and professional investors with deep-tech insights into decentralized protocols. Rigorous, research-driven, and strictly hype-free.
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={300}>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
            <Link to="/courses">
              <Button 
                size="lg" 
                onMouseEnter={playDeepHum}
                onClick={playPing}
                className="group relative overflow-hidden bg-white text-black hover:bg-white/90 px-10 py-7 text-lg font-semibold min-w-[240px] rounded-none transition-all duration-300 shadow-2xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Access Research
                </span>
              </Button>
            </Link>
            
            <Link to="/subscription">
              <Button 
                variant="outline"
                size="lg" 
                onMouseEnter={playDeepHum}
                onClick={playPing}
                className="group border-white/20 hover:border-white/40 hover:bg-white/5 px-10 py-7 text-lg font-semibold min-w-[240px] rounded-none backdrop-blur-sm transition-all duration-300"
              >
                <Users className="w-5 h-5 mr-2" />
                Institutional Onboarding
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default HeroSection;
