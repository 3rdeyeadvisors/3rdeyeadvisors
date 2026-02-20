interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

const PageHero = ({ eyebrow, title, subtitle, className = '' }: PageHeroProps) => {
  return (
    <div className={`relative py-12 md:py-16 px-6 text-center overflow-hidden ${className}`}>
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 border border-violet-500/30 bg-violet-500/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="font-body text-xs uppercase tracking-widest text-violet-300">{eyebrow}</span>
          </div>
        )}
        <h1 className="font-consciousness text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body text-lg text-white/50 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHero;
