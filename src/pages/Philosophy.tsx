import { Card } from "@/components/ui/card";
import { Eye, Brain, Zap } from "lucide-react";
import SEO from "@/components/SEO";
import PageHero from "@/components/PageHero";

const Philosophy = () => {
  const philosophyPoints = [
    {
      icon: Eye,
      title: "Awareness",
      description: "See beyond the programmed financial systems that keep you trapped."
    },
    {
      icon: Brain,
      title: "Understanding", 
      description: "Decode the mechanics of decentralized finance and autonomous wealth."
    },
    {
      icon: Zap,
      title: "Evolution",
      description: "Transform your relationship with money and financial sovereignty."
    }
  ];

  return (
    <>
      <SEO 
        title="Financial Consciousness & DeFi Philosophy: Money Awakening"
        description="Transform your relationship with money through financial consciousness and DeFi education. Break free from traditional banking and discover financial sovereignty through decentralized finance."
        keywords="financial consciousness, DeFi philosophy, financial sovereignty, money consciousness, decentralized finance mindset, financial awakening, crypto philosophy, financial freedom"
        url="https://www.the3rdeyeadvisors.com/philosophy"
        schema={{
          type: 'WebPage',
          data: {
            about: [
              "Financial consciousness and awareness",
              "Decentralized finance philosophy",
              "Money and wealth consciousness",
              "Financial sovereignty education"
            ]
          }
        }}
        faq={[
          {
            question: "What is financial consciousness?",
            answer: "Financial consciousness is the awareness of how money and financial systems truly work, including understanding the limitations of traditional banking and the opportunities presented by decentralized finance (DeFi)."
          },
          {
            question: "How does DeFi promote financial sovereignty?",
            answer: "DeFi promotes financial sovereignty by removing intermediaries, giving individuals direct control over their assets, and providing access to financial services without traditional banking restrictions or gatekeepers."
          },
          {
            question: "What does it mean to reprogram your relationship with money?",
            answer: "Reprogramming your relationship with money means questioning traditional financial assumptions, understanding how modern monetary systems work, and exploring alternative financial paradigms like cryptocurrency and DeFi for true financial independence."
          }
        ]}
      />
      <div className="min-h-screen bg-black overflow-hidden relative">
        {/* Nebula Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <PageHero
          eyebrow="Our Belief"
          title="Why This Exists"
          subtitle="The philosophy behind 3rdeyeadvisors and why financial education without gatekeeping matters."
        />

        <div className="max-w-4xl mx-auto px-6 pb-20 relative z-10">
          {/* First Strip */}
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-consciousness font-bold text-white mb-6 animate-awareness-float leading-tight">
              This is not a brand.
            </h2>
            <h3 className="text-xl md:text-3xl font-consciousness font-bold text-violet-400 animate-cosmic-pulse leading-tight">
              It is a reprogramming system.
            </h3>
          </div>

          {/* Philosophy Introduction */}
          <div className="mb-16">
            <div className="p-8 md:p-10 bg-white/3 border border-white/8 rounded-2xl backdrop-blur-sm">
              <p className="text-base md:text-lg text-white/70 leading-relaxed font-body mb-6 text-center">
                Financial awareness is not just about making money. It is about understanding how systems work
                so you can make choices, not just follow rules. DeFi gives individuals a chance to reclaim that control.
                Here, we teach you how, step by step.
              </p>
              <p className="text-base md:text-lg text-white/70 leading-relaxed font-body text-center">
                For too long, traditional financial institutions have programmed us to believe
                that true financial freedom is impossible. They have conditioned us to accept
                middlemen, hidden fees, and systems designed to extract value from our labor.
                It is time to break free from this conditioning and reprogram our understanding
                of what money and finance truly represent.
              </p>
            </div>
          </div>

          {/* Three Columns */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {philosophyPoints.map((point, index) => (
                <div
                  key={point.title}
                  className="p-8 bg-white/3 border border-white/8 rounded-2xl hover:border-violet-500/30 transition-all duration-300 group text-center"
                >
                  <div className="mb-6 flex justify-center">
                    <point.icon className="w-12 h-12 text-violet-400 group-hover:text-violet-300 transition-colors" />
                  </div>
                  <h3 className="text-lg font-consciousness font-bold text-white mb-3">
                    {point.title}
                  </h3>
                  <p className="text-sm text-white/50 font-body leading-relaxed">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Final Strip */}
          <div className="text-center">
            <div className="p-10 bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/30 rounded-2xl">
              <p className="text-xl md:text-2xl font-consciousness font-bold text-white">
                You are not here to follow.
              </p>
              <p className="text-xl md:text-2xl font-consciousness font-bold text-violet-400 mt-2">
                You are here to rewrite.
              </p>
            </div>
          </div>
      </div>
    </div>
    </>
  );
};

export default Philosophy;