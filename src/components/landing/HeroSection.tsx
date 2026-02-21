import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGalaxySounds } from '@/hooks/useGalaxySounds';

const HeroSection = () => {
  const { playDeepHum, playPing } = useGalaxySounds();

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6 text-center max-w-5xl">

        <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-violet-300 font-body">DeFi Education Platform</span>
        </div>

        <h1 className="font-consciousness text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Everything Your Financial<br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
            Advisor Won't Tell You
          </span>
        </h1>

        <p className="font-body text-lg md:text-xl text-white/60 mb-4 max-w-2xl mx-auto leading-relaxed">
          3rdeyeadvisors turns complete beginners into confident DeFi participants. Plain language. No hype. No gatekeeping.
        </p>

        <p className="font-body text-sm text-white/40 mb-12 max-w-xl mx-auto">
          Used by individuals, families, financial advisors, and law firms navigating digital assets for the first time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link to="/courses">
            <Button
              size="lg"
              onMouseEnter={playDeepHum}
              onClick={playPing}
              className="font-body bg-violet-600 hover:bg-violet-500 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-violet-900/40 transition-all duration-300 hover:shadow-violet-700/50 hover:scale-105 min-w-[200px]"
            >
              Start Learning Free
            </Button>
          </Link>
          <Link to="/subscription">
            <Button
              variant="outline"
              size="lg"
              onMouseEnter={playDeepHum}
              onClick={playPing}
              className="font-body border-white/20 hover:border-violet-500/50 hover:bg-violet-500/10 text-white/80 hover:text-white px-8 py-6 text-base rounded-xl transition-all duration-300 min-w-[200px]"
            >
              View Membership Plans
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-white/40">
          <div className="flex items-center gap-2">
            <span className="font-consciousness text-2xl font-bold text-white/70">14</span>
            <span className="font-body text-xs uppercase tracking-wider">Day Free Trial</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-consciousness text-2xl font-bold text-white/70">6</span>
            <span className="font-body text-xs uppercase tracking-wider">Core Courses</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-consciousness text-2xl font-bold text-white/70">11+</span>
            <span className="font-body text-xs uppercase tracking-wider">Hands-On Tutorials</span>
          </div>
          <div className="w-px h-8 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-consciousness text-2xl font-bold text-white/70">0</span>
            <span className="font-body text-xs uppercase tracking-wider">Crypto Knowledge Required</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
